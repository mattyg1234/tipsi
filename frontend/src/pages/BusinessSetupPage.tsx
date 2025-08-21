import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BuildingStorefrontIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

interface MenuItem {
  id: string;
  category: string;
  name: string;
  priceCents: number;
  active: boolean;
}

interface Venue {
  id: string;
  name: string;
  brandColor: string;
  logoUrl?: string;
}

const BusinessSetupPage: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'settings' | 'nfc'>('menu');

  // New menu item form
  const [newMenuItem, setNewMenuItem] = useState({
    category: '',
    name: '',
    priceCents: ''
  });

  // Settings form
  const [settings, setSettings] = useState({
    name: '',
    brandColor: '#6366f1'
  });

  useEffect(() => {
    if (venueId) {
      loadVenueData();
    }
  }, [venueId]);

  const loadVenueData = async () => {
    try {
      const [venueResponse, menuResponse] = await Promise.all([
        fetch(`/api/business/profile/${venueId}`),
        fetch(`/api/business/${venueId}/menu`)
      ]);

      if (venueResponse.ok) {
        const venueData = await venueResponse.json();
        setVenue(venueData.venue);
        setSettings({
          name: venueData.venue.name,
          brandColor: venueData.venue.brandColor
        });
      }

      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        setMenuItems(menuData.menuItems);
      }
    } catch (error) {
      console.error('Error loading venue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/business/${venueId}/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: newMenuItem.category,
          name: newMenuItem.name,
          priceCents: parseInt(newMenuItem.priceCents)
        })
      });

      if (response.ok) {
        const newItem = await response.json();
        setMenuItems([...menuItems, newItem.menuItem]);
        setNewMenuItem({ category: '', name: '', priceCents: '' });
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const handleUpdateMenuItem = async (itemId: string, updates: Partial<MenuItem>) => {
    try {
      const response = await fetch(`/api/business/menu/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setMenuItems(menuItems.map(item => 
          item.id === itemId ? updatedItem.menuItem : item
        ));
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/business/menu/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMenuItems(menuItems.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`/api/business/profile/${venueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const updatedVenue = await response.json();
        setVenue(updatedVenue.venue);
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Venue not found</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {venue.logoUrl && (
                <img 
                  src={venue.logoUrl} 
                  alt={venue.name} 
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}
              <h1 className="text-xl font-bold text-gray-900">{venue.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Business Setup</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'menu', label: 'Menu Builder', icon: PlusIcon },
              { id: 'settings', label: 'Venue Settings', icon: CogIcon },
              { id: 'nfc', label: 'NFC Setup', icon: QrCodeIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Menu Builder Tab */}
        {activeTab === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Add Menu Item</h2>
              <form onSubmit={handleAddMenuItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Category (e.g., Drinks, Food)"
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Item name"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Price (cents)"
                  value={newMenuItem.priceCents}
                  onChange={(e) => setNewMenuItem({...newMenuItem, priceCents: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Item</span>
                </button>
              </form>
            </div>

            {/* Menu Items List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Current Menu</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        <span className="text-sm text-gray-500">{item.category}</span>
                        <span className="text-sm font-medium text-green-600">
                          ${(item.priceCents / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateMenuItem(item.id, { active: !item.active })}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {menuItems.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No menu items yet. Add your first item above!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Venue Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-6">Venue Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({...settings, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Color
                </label>
                <input
                  type="color"
                  value={settings.brandColor}
                  onChange={(e) => setSettings({...settings, brandColor: e.target.value})}
                  className="w-20 h-10 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={handleSaveSettings}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        )}

        {/* NFC Setup Tab */}
        {activeTab === 'nfc' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-6">NFC Setup</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Getting Started with NFC</h3>
                <p className="text-blue-700 text-sm">
                  To set up NFC ordering for your venue, you'll need to:
                </p>
                <ol className="text-blue-700 text-sm mt-2 ml-4 list-decimal">
                  <li>Purchase NFC tags or cards</li>
                  <li>Assign tags to specific tables</li>
                  <li>Configure your menu items</li>
                  <li>Test the ordering flow</li>
                </ol>
              </div>
              <div className="text-center py-8">
                <QrCodeIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">NFC setup coming soon!</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default BusinessSetupPage;

