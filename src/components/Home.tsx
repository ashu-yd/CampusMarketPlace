import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BuyPage from './BuyPage';
import SellPage from './SellPage';
import RequestsPage from './RequestsPage';
import InboxPage from './InboxPage';
import { ShoppingCart, Store, MessageSquare, Inbox, LogOut, User } from 'lucide-react';

type Tab = 'buy' | 'sell' | 'requests' | 'inbox';

export default function Home() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('buy');

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'buy':
        return <BuyPage />;
      case 'sell':
        return <SellPage />;
      case 'requests':
        return <RequestsPage />;
      case 'inbox':
        return <InboxPage />;
      default:
        return <BuyPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Store className="text-blue-600" size={28} />
              <h1 className="text-xl font-bold text-gray-900">Campus Marketplace</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={18} />
                <span>{profile?.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <div className="flex gap-1 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'buy'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ShoppingCart size={18} />
              <span>Buy</span>
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'sell'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Store size={18} />
              <span>Sell</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare size={18} />
              <span>Requests</span>
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'inbox'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Inbox size={18} />
              <span>Inbox</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="py-6">{renderContent()}</main>
    </div>
  );
}
