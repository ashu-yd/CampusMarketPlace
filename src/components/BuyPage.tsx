import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Product } from '../lib/supabase';
import { MessageCircle } from 'lucide-react';

// Utility function to convert Google Drive URLs
const convertGoogleDriveUrl = (url: string): string => {
  const driveMatch = url.match(/\/file\/d\/([^\/]+)/);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return url;
};

export default function BuyPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [negotiatingProduct, setNegotiatingProduct] = useState<Product | null>(null);
  const [offerPrice, setOfferPrice] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'available')
        .neq('seller_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNegotiate = (product: Product) => {
    setNegotiatingProduct(product);
    setOfferPrice(product.price.toString());
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!negotiatingProduct || !user) return;

    try {
      const { error } = await supabase.from('negotiations').insert([
        {
          product_id: negotiatingProduct.id,
          buyer_id: user.id,
          seller_id: negotiatingProduct.seller_id,
          offered_price: parseFloat(offerPrice),
          status: 'pending',
        },
      ]);

      if (error) throw error;

      alert('Offer sent successfully! The seller will review your offer.');
      setNegotiatingProduct(null);
      setOfferPrice('');
    } catch (error) {
      console.error('Error submitting offer:', error);
      alert('Failed to send offer. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Available Products</h2>
        <p className="text-gray-600 text-sm mt-1">Browse and make offers on items</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-600">No products available right now</p>
          <p className="text-sm text-gray-500 mt-1">Check back later for new listings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[400px]">
              <div className="bg-gray-100 flex items-center justify-center overflow-hidden h-56">
                <img
                  src={convertGoogleDriveUrl(product.image_url)}
                  alt={product.name}
                  className="h-full w-auto object-contain transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-blue-600 mt-2 mb-3">₹{product.price}</p>
                  <button
                    onClick={() => handleNegotiate(product)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span>Negotiate</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {negotiatingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Make an Offer</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Product</p>
              <p className="font-semibold">{negotiatingProduct.name}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Asking Price</p>
              <p className="text-lg font-bold text-blue-600">₹{negotiatingProduct.price}</p>
            </div>
            <form onSubmit={handleSubmitOffer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Offer (₹)
                </label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Offer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNegotiatingProduct(null);
                    setOfferPrice('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
