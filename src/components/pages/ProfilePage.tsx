import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, CreditCard, Plus, Trash2, Edit2, Save, X, Loader2, Package, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Address, PaymentCard, Order } from '../../lib/types';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getPaymentCards,
  addPaymentCard,
  updatePaymentCard,
  deletePaymentCard,
  getOrders,
} from '../../lib/firebase/firestore';

interface ProfilePageProps {
  user: any;
  onNavigate: (page: string) => void;
}

export default function ProfilePage({ user, onNavigate }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'cards' | 'orders'>('profile');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFirebaseAlert, setShowFirebaseAlert] = useState(false);
  const [showIndexAlert, setShowIndexAlert] = useState(false);
  const [indexUrl, setIndexUrl] = useState('');

  // Debug: Log user object on mount and when it changes
  useEffect(() => {
    console.log('ProfilePage - User object:', user);
    console.log('ProfilePage - User ID:', user?.id);
  }, [user]);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Card form state
  const [cardForm, setCardForm] = useState({
    type: 'Visa',
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  useEffect(() => {
    if (user && user.id) {
      console.log('Loading user data for userId:', user.id);
      loadAddresses();
      loadCards();
      loadOrders();
    }
  }, [user]);

  const loadAddresses = async () => {
    if (!user || !user.id) return;
    try {
      setLoading(true);
      const fetchedAddresses = await getAddresses(user.id);
      setAddresses(fetchedAddresses);
    } catch (error: any) {
      console.error('Error loading addresses:', error);
      if (error.code === 'permission-denied') {
        toast.error('Firebase permission error. Please set up Firestore rules in Firebase Console.', {
          duration: 5000,
        });
        setShowFirebaseAlert(true);
      } else {
        toast.error('Failed to load addresses');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCards = async () => {
    if (!user || !user.id) return;
    try {
      setLoading(true);
      const fetchedCards = await getPaymentCards(user.id);
      setCards(fetchedCards);
    } catch (error: any) {
      console.error('Error loading cards:', error);
      if (error.code === 'permission-denied') {
        toast.error('Firebase permission error. Please set up Firestore rules in Firebase Console.', {
          duration: 5000,
        });
        setShowFirebaseAlert(true);
      } else {
        toast.error('Failed to load payment cards');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!user || !user.id) return;
    try {
      setLoading(true);
      const fetchedOrders = await getOrders(user.id);
      setOrders(fetchedOrders);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      if (error.code === 'permission-denied') {
        toast.error('Firebase permission error. Please set up Firestore rules in Firebase Console.', {
          duration: 5000,
        });
        setShowFirebaseAlert(true);
      } else if (error.code === 'failed-precondition') {
        // Extract the index creation URL from error message
        const urlMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
        if (urlMatch) {
          setIndexUrl(urlMatch[0]);
          setShowIndexAlert(true);
          toast.error('Database index required. Click the alert to create it.', {
            duration: 7000,
          });
        } else {
          toast.error('Database index required. Please check the setup guide.', {
            duration: 5000,
          });
        }
      } else {
        toast.error('Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!addressForm.label || !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      const newAddress = await addAddress(user.id, addressForm);
      setAddresses([newAddress, ...addresses]);
      
      toast.success('Address added successfully');
      setShowAddressForm(false);
      setAddressForm({
        label: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      });
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!editingAddress) return;
    
    if (!addressForm.label || !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      await updateAddress(user.id, editingAddress.id, addressForm);
      
      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...addressForm }
          : addr
      ));

      toast.success('Address updated successfully');
      setEditingAddress(null);
      setAddressForm({
        label: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      });
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      setSaving(true);
      await deleteAddress(user.id, id);
      setAddresses(addresses.filter(addr => addr.id !== id));
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCard = async () => {
    // Validation
    if (!cardForm.cardNumber || cardForm.cardNumber.length < 13) {
      toast.error('Please enter a valid card number');
      return;
    }

    if (!cardForm.cardHolder || cardForm.cardHolder.trim() === '') {
      toast.error('Please enter cardholder name');
      return;
    }

    if (!cardForm.expiryMonth || !cardForm.expiryYear) {
      toast.error('Please enter expiry date');
      return;
    }

    if (!cardForm.cvv || cardForm.cvv.length !== 3) {
      toast.error('CVV must be 3 digits');
      return;
    }

    // Validate user is logged in and has ID
    if (!user || !user.id) {
      toast.error('User not logged in. Please login again.');
      return;
    }

    try {
      setSaving(true);
      const newCard = await addPaymentCard(user.id, {
        type: cardForm.type,
        lastFour: cardForm.cardNumber.slice(-4),
        cardHolder: cardForm.cardHolder,
        expiryMonth: cardForm.expiryMonth,
        expiryYear: cardForm.expiryYear,
        cardNumber: cardForm.cardNumber,
        cvv: cardForm.cvv,
      });

      setCards([newCard, ...cards]);
      
      toast.success('✅ Payment card added and encrypted successfully');
      setShowCardForm(false);
      setCardForm({
        type: 'Visa',
        cardNumber: '',
        cardHolder: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
      });
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error('Failed to add payment card');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCard = async () => {
    if (!editingCard) return;
    
    if (!cardForm.cardNumber || !cardForm.cardHolder || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvv) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      await updatePaymentCard(user.id, editingCard.id, {
        type: cardForm.type,
        cardHolder: cardForm.cardHolder,
        expiryMonth: cardForm.expiryMonth,
        expiryYear: cardForm.expiryYear,
        lastFour: cardForm.cardNumber.slice(-4),
        cardNumber: cardForm.cardNumber,
        cvv: cardForm.cvv,
      });

      setCards(cards.map(card => 
        card.id === editingCard.id 
          ? { 
              ...card, 
              type: cardForm.type,
              lastFour: cardForm.cardNumber.slice(-4),
              cardHolder: cardForm.cardHolder,
              expiryMonth: cardForm.expiryMonth,
              expiryYear: cardForm.expiryYear,
            }
          : card
      ));

      toast.success('✅ Payment card updated and encrypted successfully');
      setEditingCard(null);
      setCardForm({
        type: 'Visa',
        cardNumber: '',
        cardHolder: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
      });
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Failed to update payment card');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      setSaving(true);
      await deletePaymentCard(user.id, id);
      setCards(cards.filter(card => card.id !== id));
      toast.success('Payment card deleted successfully');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete payment card');
    } finally {
      setSaving(false);
    }
  };

  const startEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
  };

  const startEditCard = (card: PaymentCard) => {
    setEditingCard(card);
    setCardForm({
      type: card.type,
      cardNumber: card.cardNumber || '',
      cardHolder: card.cardHolder,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvv: card.cvv || '',
    });
  };

  const cancelEdit = () => {
    setEditingAddress(null);
    setEditingCard(null);
    setShowAddressForm(false);
    setShowCardForm(false);
    setAddressForm({
      label: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    });
    setCardForm({
      type: 'Visa',
      cardNumber: '',
      cardHolder: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Firebase Setup Alert */}
        {showFirebaseAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-red-900 mb-2">🔥 Firebase Firestore Setup Required</h3>
                <p className="text-red-700 mb-4">
                  Your app is ready, but Firestore security rules need to be configured to enable Addresses, Payment Cards, and Orders features.
                </p>
                <div className="bg-white border border-red-200 rounded-xl p-5 mb-4 shadow-sm">
                  <p className="text-sm text-red-900 mb-3"><strong>⚡ Quick Setup (2 minutes):</strong></p>
                  <ol className="list-decimal list-inside text-sm text-red-800 space-y-2 mb-4">
                    <li>Open <strong>FIRESTORE_SETUP.md</strong> file in this project</li>
                    <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Firebase Console</a></li>
                    <li>Select your project → <strong>Firestore Database</strong> → <strong>Rules</strong> tab</li>
                    <li>Copy the rules from <code className="bg-red-100 px-2 py-1 rounded text-xs">/firestore.rules</code> file</li>
                    <li>Paste and click <strong className="text-green-700">Publish</strong></li>
                    <li>Refresh this page ✅</li>
                  </ol>
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-xs text-yellow-900">
                    <strong>📁 Files to check:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>→ <code className="bg-yellow-100 px-2 py-0.5 rounded">/firestore.rules</code> - Copy these rules</li>
                      <li>→ <code className="bg-yellow-100 px-2 py-0.5 rounded">/FIRESTORE_SETUP.md</code> - Detailed guide</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <a
                    href="https://console.firebase.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm shadow-md hover:shadow-lg"
                  >
                    🚀 Open Firebase Console
                  </a>
                  <button
                    onClick={() => {
                      setShowFirebaseAlert(false);
                      window.location.reload();
                    }}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm shadow-md hover:shadow-lg"
                  >
                    ✅ I've Set Up the Rules
                  </button>
                  <button
                    onClick={() => setShowFirebaseAlert(false)}
                    className="px-5 py-2.5 bg-white border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-all text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Index Creation Alert */}
        {showIndexAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-red-900 mb-2">🔥 Database Index Required</h3>
                <p className="text-red-700 mb-4">
                  Your app is ready, but a Firestore index is required to enable the Orders feature.
                </p>
                <div className="bg-white border border-red-200 rounded-xl p-5 mb-4 shadow-sm">
                  <p className="text-sm text-red-900 mb-3"><strong>⚡ Quick Setup (2 minutes):</strong></p>
                  <ol className="list-decimal list-inside text-sm text-red-800 space-y-2 mb-4">
                    <li>Open <strong>FIRESTORE_SETUP.md</strong> file in this project</li>
                    <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Firebase Console</a></li>
                    <li>Select your project → <strong>Firestore Database</strong> → <strong>Indexes</strong> tab</li>
                    <li>Click <strong className="text-green-700">Create Index</strong> and follow the instructions</li>
                    <li>Refresh this page ✅</li>
                  </ol>
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-xs text-yellow-900">
                    <strong>📁 Files to check:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>→ <code className="bg-yellow-100 px-2 py-0.5 rounded">/FIRESTORE_SETUP.md</code> - Detailed guide</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <a
                    href={indexUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm shadow-md hover:shadow-lg"
                  >
                    🚀 Open Firebase Console
                  </a>
                  <button
                    onClick={() => {
                      setShowIndexAlert(false);
                      window.location.reload();
                    }}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm shadow-md hover:shadow-lg"
                  >
                    ✅ I've Created the Index
                  </button>
                  <button
                    onClick={() => setShowIndexAlert(false)}
                    className="px-5 py-2.5 bg-white border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-all text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl text-black font-serif mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information, addresses, and payment methods</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#FDBA3A] text-black shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" />
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'bg-[#FDBA3A] text-black shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-5 h-5" />
            Addresses ({addresses.length})
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'cards'
                ? 'bg-[#FDBA3A] text-black shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Payment Cards ({cards.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#FDBA3A] text-black shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-5 h-5" />
            Orders ({orders.length})
          </button>
        </div>

        {/* Profile Info Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm"
          >
            <h2 className="text-2xl text-black mb-6 font-serif">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">User ID</label>
                <p className="text-black font-mono bg-gray-50 px-4 py-2 rounded-xl mt-1">{user.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="text-black bg-gray-50 px-4 py-2 rounded-xl mt-1">{user.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-black bg-gray-50 px-4 py-2 rounded-xl mt-1">{user.email}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-black font-serif">Saved Addresses</h2>
              {!showAddressForm && !editingAddress && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FDBA3A] text-black rounded-xl hover:bg-[#f5a623] transition-all disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  Add Address
                </button>
              )}
            </div>

            {/* Address Form */}
            <AnimatePresence>
              {(showAddressForm || editingAddress) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <h3 className="text-xl text-black mb-4">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Label *</label>
                      <input
                        type="text"
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        placeholder="e.g., Home, Office"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Street Address *</label>
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        placeholder="Street address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="City"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="State"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Postal Code *</label>
                      <input
                        type="text"
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        placeholder="Postal code"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Country *</label>
                      <input
                        type="text"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        placeholder="Country"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-[#FDBA3A] text-black rounded-xl hover:bg-[#f5a623] transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {editingAddress ? 'Update' : 'Save'} Address
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Addresses List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#FDBA3A] animate-spin" />
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-[#FDBA3A] transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg text-black">{address.label}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditAddress(address)}
                          disabled={saving}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          disabled={saving}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.postalCode}</p>
                      <p>{address.country}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              !showAddressForm && (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No addresses saved yet</p>
                  <p className="text-sm text-gray-400 mt-2">Add your first address to get started</p>
                </div>
              )
            )}
          </motion.div>
        )}

        {/* Payment Cards Tab */}
        {activeTab === 'cards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-black font-serif">Saved Payment Cards</h2>
              {!showCardForm && !editingCard && (
                <button
                  onClick={() => setShowCardForm(true)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FDBA3A] text-black rounded-xl hover:bg-[#f5a623] transition-all disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  Add Card
                </button>
              )}
            </div>

            {/* Card Form */}
            <AnimatePresence>
              {(showCardForm || editingCard) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <h3 className="text-xl text-black mb-4">
                    {editingCard ? 'Edit Payment Card' : 'Add New Payment Card'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Card Type *</label>
                      <select
                        value={cardForm.type}
                        onChange={(e) => setCardForm({ ...cardForm, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="American Express">American Express</option>
                        <option value="Discover">Discover</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Card Number *</label>
                      <input
                        type="text"
                        value={cardForm.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '');
                          if (/^\d{0,16}$/.test(value)) {
                            setCardForm({ ...cardForm, cardNumber: value });
                          }
                        }}
                        placeholder="1234567890123456"
                        maxLength={16}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-700 mb-2">Cardholder Name *</label>
                      <input
                        type="text"
                        value={cardForm.cardHolder}
                        onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Expiry Month *</label>
                      <input
                        type="text"
                        value={cardForm.expiryMonth}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d{0,2}$/.test(value) && (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12))) {
                            setCardForm({ ...cardForm, expiryMonth: value });
                          }
                        }}
                        placeholder="MM"
                        maxLength={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Expiry Year *</label>
                      <input
                        type="text"
                        value={cardForm.expiryYear}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d{0,4}$/.test(value)) {
                            setCardForm({ ...cardForm, expiryYear: value });
                          }
                        }}
                        placeholder="YYYY"
                        maxLength={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">CVV *</label>
                      <input
                        type="text"
                        value={cardForm.cvv}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d{0,3}$/.test(value)) {
                            setCardForm({ ...cardForm, cvv: value });
                          }
                        }}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                      />
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                    <p className="text-green-800 text-sm">
                      🔒 <strong>Secure:</strong> Card number and CVV are encrypted using AES-256-GCM before storing in Firebase.
                    </p>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={editingCard ? handleUpdateCard : handleAddCard}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-[#FDBA3A] text-black rounded-xl hover:bg-[#f5a623] transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {editingCard ? 'Update' : 'Save'} Card
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cards List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#FDBA3A] animate-spin" />
              </div>
            ) : cards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 shadow-lg text-white relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDBA3A] opacity-10 rounded-full -mr-16 -mt-16" />
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="text-sm opacity-70">{card.type}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditCard(card)}
                          disabled={saving}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          disabled={saving}
                          className="p-2 bg-white/10 hover:bg-red-500/20 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-6 relative z-10">
                      <div className="text-2xl tracking-wider">•••• •••• •••• {card.lastFour}</div>
                    </div>
                    <div className="flex justify-between items-end relative z-10">
                      <div>
                        <div className="text-xs opacity-70 mb-1">Cardholder</div>
                        <div className="text-sm">{card.cardHolder}</div>
                      </div>
                      <div>
                        <div className="text-xs opacity-70 mb-1">Expires</div>
                        <div className="text-sm">{card.expiryMonth}/{card.expiryYear}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              !showCardForm && (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No payment cards saved yet</p>
                  <p className="text-sm text-gray-400 mt-2">Add your first card to get started</p>
                </div>
              )
            )}
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-black font-serif">My Orders</h2>
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#FDBA3A] animate-spin" />
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-[#FDBA3A] transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-5 h-5 text-[#FDBA3A]" />
                          <h3 className="text-lg text-black">Order #{order.id}</h3>
                        </div>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'Processing'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="text-black">{item.name}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-black">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div className="text-sm text-gray-600">
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Payment: <span className="capitalize">{order.paymentMethod}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl text-black">₹{order.total.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
                <p className="text-sm text-gray-400 mt-2">Start shopping to place your first order</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}