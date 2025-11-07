import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Negotiation, Product } from '../lib/supabase';
import { CheckCircle, XCircle } from 'lucide-react';

interface NegotiationWithProduct extends Negotiation {
  product: Product;
}

export default function InboxPage() {
  const { user } = useAuth();
  const [receivedOffers, setReceivedOffers] = useState<NegotiationWithProduct[]>([]);
  const [sentOffers, setSentOffers] = useState<NegotiationWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    if (user) {
      fetchNegotiations();
    }
  }, [user]);

  const fetchNegotiations = async () => {
    if (!user) return;

    try {
      const { data: received, error: receivedError } = await supabase
        .from('negotiations')
        .select('*, product:products(*)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      const { data: sent, error: sentError } = await supabase
        .from('negotiations')
        .select('*, product:products(*)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      setReceivedOffers((received as NegotiationWithProduct[]) || []);
      setSentOffers((sent as NegotiationWithProduct[]) || []);
    } catch (error) {
      console.error('Error fetching negotiations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (negotiation: NegotiationWithProduct) => {
    try {
      const { error: updateNegError } = await supabase
        .from('negotiations')
        .update({ status: 'accepted' })
        .eq('id', negotiation.id);

      if (updateNegError) throw updateNegError;

      const { error: updateProductError } = await supabase
        .from('products')
        .update({ status: 'sold' })
        .eq('id', negotiation.product_id);

      if (updateProductError) throw updateProductError;

      alert('Offer accepted! The product has been marked as sold.');
      fetchNegotiations();
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Failed to accept offer. Please try again.');
    }
  };

  const handleReject = async (negotiationId: string) => {
    try {
      const { error } = await supabase
        .from('negotiations')
        .update({ status: 'rejected' })
        .eq('id', negotiationId);

      if (error) throw error;

      fetchNegotiations();
    } catch (error) {
      console.error('Error rejecting offer:', error);
      alert('Failed to reject offer. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">Pending</span>;
      case 'accepted':
        return <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Accepted</span>;
      case 'rejected':
        return <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">Rejected</span>;
      default:
        return null;
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
        <h2 className="text-2xl font-bold text-gray-900">Inbox</h2>
        <p className="text-gray-600 text-sm mt-1">Manage your negotiations</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'received'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Received Offers ({receivedOffers.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'sent'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Sent Offers ({sentOffers.length})
        </button>
      </div>

      {activeTab === 'received' ? (
        <div className="space-y-4">
          {receivedOffers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <p className="text-gray-600">No offers received yet</p>
            </div>
          ) : (
            receivedOffers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{offer.product.name}</h3>
                      {getStatusBadge(offer.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Original Price: ₹{offer.product.price}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      Offered Price: ₹{offer.offered_price}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(offer.created_at)}</p>
                  </div>
                </div>

                {offer.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleAccept(offer)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={18} />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleReject(offer.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle size={18} />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {offer.status === 'accepted' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700 font-medium">
                      Offer accepted! Contact +91 8949XXXXXX to complete the transaction and deliver the item.
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sentOffers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <p className="text-gray-600">No offers sent yet</p>
            </div>
          ) : (
            sentOffers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{offer.product.name}</h3>
                      {getStatusBadge(offer.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Original Price: ₹{offer.product.price}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      Your Offer: ₹{offer.offered_price}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(offer.created_at)}</p>
                  </div>
                </div>

                {offer.status === 'accepted' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700 font-medium">
                      Your offer was accepted! Contact +91 8949XXXXXX to complete the transaction and pick up the item.
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}