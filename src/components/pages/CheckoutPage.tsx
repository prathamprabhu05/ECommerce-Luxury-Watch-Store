import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Lock, Check, MapPin, Plus, User, Mail, Phone, X, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { Address, CreditCard as CreditCardType } from '../../lib/types';
import { getAddresses, getPaymentCards, addAddress, addPaymentCard } from '../../lib/firebase/firestore';

interface CheckoutPageProps {
  cart: any[];
  user: any;
  onPlaceOrder: (orderData: any) => void;
  onNavigate: (page: string) => void;
}

export default function CheckoutPage({ cart, user, onPlaceOrder, onNavigate }: CheckoutPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // New loading state for order placement
  
  // Card states
  const [savedCards, setSavedCards] = useState<CreditCardType[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isAddingNewCard, setIsAddingNewCard] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + tax + shipping;

  const steps = [
    { number: 1, title: 'Shipping' },
    { number: 2, title: 'Payment' },
    { number: 3, title: 'Review' },
  ];

  // Load saved addresses and cards on mount
  useEffect(() => {
    if (user && user.id) {
      loadUserData();
    } else if (!user) {
      // Only redirect if there's no user at all
      toast.error('Please login to continue checkout');
      onNavigate('login');
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user || !user.id) {
      return;
    }

    try {
      setLoading(true);
      
      // Pre-fill user info
      setShippingInfo({
        fullName: user.name || '',
        email: user.email || '',
        phone: '',
      });

      // Load saved addresses from Firestore
      try {
        const addresses = await getAddresses(user.id);
        setSavedAddresses(addresses);
        
        if (addresses.length > 0) {
          setSelectedAddressId(addresses[0].id);
        } else {
          setIsAddingNewAddress(true);
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
        setIsAddingNewAddress(true);
      }

      // Load saved cards from Firestore
      try {
        const cards = await getPaymentCards(user.id);
        // Convert PaymentCard to CreditCard format for checkout
        const convertedCards = cards.map(card => ({
          id: card.id,
          cardNumber: card.cardNumber || ('*'.repeat(12) + card.lastFour),
          cardHolder: card.cardHolder,
          expiryDate: `${card.expiryMonth}/${card.expiryYear}`,
          cvv: card.cvv || '***',
          isDefault: card.isDefault || false,
        }));
        setSavedCards(convertedCards);
        
        if (convertedCards.length > 0) {
          setSelectedCardId(convertedCards[0].id);
        }
      } catch (error) {
        console.error('Error loading cards:', error);
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load saved data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAddress = async () => {
    // Validate new address
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      toast.error('Please fill in all address fields');
      return;
    }

    if (!/^\d{6}$/.test(newAddress.postalCode)) {
      toast.error('Please enter a valid 6-digit postal code');
      return;
    }

    if (!user || !user.id) {
      toast.error('Please login to save address');
      return;
    }

    try {
      // Save to Firebase with correct field names
      const addressId = await addAddress(user.id, {
        label: newAddress.label,
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
        country: newAddress.country,
      });

      toast.success('Address saved successfully!');

      // Reload addresses from Firebase
      const updatedAddresses = await getAddresses(user.id);
      setSavedAddresses(updatedAddresses);
      
      // Find the newly added address
      const newlyAddedAddress = updatedAddresses.find(addr => 
        addr.street === newAddress.street && 
        addr.city === newAddress.city &&
        addr.postalCode === newAddress.postalCode
      );
      
      if (newlyAddedAddress) {
        setSelectedAddressId(newlyAddedAddress.id);
      }
      
      setIsAddingNewAddress(false);
      
      // Reset new address form
      setNewAddress({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      });

      setCurrentStep(2);
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    }
  };

  const handleAddNewCard = async () => {
    // Validate card details
    if (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryDate || !cardDetails.cvv) {
      toast.error('Please fill in all card details');
      return;
    }

    // Validate card number (basic check for 13-19 digits)
    const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanCardNumber)) {
      toast.error('Please enter a valid card number');
      return;
    }

    // Validate expiry date format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      toast.error('Please enter expiry date in MM/YY format');
      return;
    }

    // Validate CVV (3 or 4 digits)
    if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      toast.error('Please enter a valid CVV');
      return;
    }

    if (!user || !user.id) {
      toast.error('Please login to save card');
      return;
    }

    try {
      // Parse expiry date
      const [month, year] = cardDetails.expiryDate.split('/');
      
      // Save to Firebase
      const cardId = await addPaymentCard(user.id, {
        cardNumber: cleanCardNumber,
        cardHolder: cardDetails.cardHolder,
        expiryMonth: month,
        expiryYear: `20${year}`, // Convert YY to YYYY
        cvv: cardDetails.cvv,
        lastFour: cleanCardNumber.slice(-4),
        cardType: 'Credit Card', // You can add logic to detect card type
        isDefault: savedCards.length === 0,
      });

      toast.success('Card saved successfully!');

      // Reload cards from Firebase
      const updatedCards = await getPaymentCards(user.id);
      const convertedCards = updatedCards.map(card => ({
        id: card.id,
        cardNumber: card.cardNumber || ('*'.repeat(12) + card.lastFour),
        cardHolder: card.cardHolder,
        expiryDate: `${card.expiryMonth}/${card.expiryYear}`,
        cvv: card.cvv || '***',
        isDefault: card.isDefault || false,
      }));
      setSavedCards(convertedCards);
      
      // Find the newly added card
      const newlyAddedCard = convertedCards.find(card => 
        card.cardHolder === cardDetails.cardHolder &&
        card.cardNumber.slice(-4) === cleanCardNumber.slice(-4)
      );
      
      if (newlyAddedCard) {
        setSelectedCardId(newlyAddedCard.id);
      }
      
      setIsAddingNewCard(false);
      
      // Reset card form
      setCardDetails({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
      });

      setCurrentStep(3);
    } catch (error: any) {
      console.error('Error saving card:', error);
      toast.error('Failed to save card');
    }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
  };

  const handleSelectCard = (card: CreditCardType) => {
    setSelectedCardId(card.id);
  };

  const handleContinueToPayment = () => {
    // Validation: Must have a selected address or be adding a new one
    if (!selectedAddressId && !isAddingNewAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    // If adding new address, must complete it first
    if (isAddingNewAddress && (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode)) {
      toast.error('Please complete the address form or select a saved address');
      return;
    }

    // Validate contact info
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone) {
      toast.error('Please fill in your name, email, and phone number');
      return;
    }

    // Validate phone number (must be exactly 10 digits)
    if (!/^\d{10}$/.test(shippingInfo.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // If adding new address, save it first
    if (isAddingNewAddress) {
      handleAddNewAddress();
      return;
    }

    setCurrentStep(2);
  };

  const handleContinueToReview = () => {
    // For card payment, must have selected card or be adding new one
    if (paymentMethod === 'card') {
      if (!selectedCardId && !isAddingNewCard) {
        toast.error('Please select a payment card');
        return;
      }

      // If adding new card, must complete it first
      if (isAddingNewCard && (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryDate || !cardDetails.cvv)) {
        toast.error('Please complete the card details or select a saved card');
        return;
      }

      // If adding new card, save it first
      if (isAddingNewCard) {
        handleAddNewCard();
        return;
      }
    }

    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    // Validate address selection
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      setCurrentStep(1);
      return;
    }

    const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
    if (!selectedAddress) {
      toast.error('Selected address not found. Please select an address.');
      setCurrentStep(1);
      return;
    }

    // Validate payment method
    if (paymentMethod === 'card' && !selectedCardId) {
      toast.error('Please select a payment card');
      setCurrentStep(2);
      return;
    }

    const selectedCard = savedCards.find(card => card.id === selectedCardId);
    
    // Create a clean address object with all required fields
    const cleanAddress = {
      id: selectedAddress.id || '',
      label: selectedAddress.label || 'Home',
      street: selectedAddress.street || '',
      city: selectedAddress.city || '',
      state: selectedAddress.state || '',
      postalCode: selectedAddress.postalCode || '',
      country: selectedAddress.country || 'India',
      createdAt: selectedAddress.createdAt || new Date().toISOString(),
    };

    const orderData = {
      shippingAddress: cleanAddress,
      paymentMethod,
      paymentDetails: paymentMethod === 'card' && selectedCard ? {
        cardNumber: `****${selectedCard.cardNumber.slice(-4)}`,
        cardHolder: selectedCard.cardHolder,
      } : null,
    };

    // Set loading state before calling onPlaceOrder
    setIsPlacingOrder(true);
    
    try {
      await onPlaceOrder(orderData);
    } catch (error) {
      console.error('Error in handlePlaceOrder:', error);
      // Error handling is done in App.tsx, just reset loading state here
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const maskCardNumber = (cardNumber: string) => {
    return `**** **** **** ${cardNumber.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl text-black mb-12 font-serif"
        >
          Checkout
        </motion.h1>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.number
                        ? 'bg-[#FDBA3A] text-black'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 mt-2">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition-colors ${
                      currentStep > step.number ? 'bg-[#FDBA3A]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl text-black mb-6">Shipping Information</h2>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-12 h-12 border-4 border-[#FDBA3A] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      {/* Contact Information */}
                      <div className="space-y-4 mb-6">
                        <h3 className="text-black flex items-center gap-2">
                          <User className="w-5 h-5 text-[#FDBA3A]" />
                          Contact Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            placeholder="Full Name *"
                            value={shippingInfo.fullName}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                          />
                          <input
                            type="email"
                            placeholder="Email Address *"
                            value={shippingInfo.email}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                          />
                          <input
                            type="tel"
                            placeholder="Phone Number (10 digits) *"
                            value={shippingInfo.phone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setShippingInfo({ ...shippingInfo, phone: value });
                            }}
                            maxLength={10}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                          />
                        </div>
                      </div>

                      {/* Saved Addresses */}
                      <div className="space-y-4">
                        <h3 className="text-black flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-[#FDBA3A]" />
                          Delivery Address
                        </h3>

                        {savedAddresses.length > 0 && !isAddingNewAddress && (
                          <div className="space-y-3">
                            {savedAddresses.map((address) => (
                              <motion.button
                                key={address.id}
                                onClick={() => handleSelectAddress(address)}
                                whileHover={{ scale: 1.01 }}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                  selectedAddressId === address.id
                                    ? 'border-[#FDBA3A] bg-[#FDBA3A]/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-black">{address.label}</span>
                                      {selectedAddressId === address.id && (
                                        <Check className="w-5 h-5 text-[#FDBA3A]" />
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">{address.street}</p>
                                    <p className="text-sm text-gray-600">
                                      {address.city}, {address.state} {address.postalCode}
                                    </p>
                                    <p className="text-sm text-gray-600">{address.country}</p>
                                  </div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        )}

                        {/* Add New Address Button */}
                        {!isAddingNewAddress && (
                          <button
                            onClick={() => setIsAddingNewAddress(true)}
                            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#FDBA3A] hover:text-[#FDBA3A] transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            Add New Address
                          </button>
                        )}

                        {/* New Address Form */}
                        {isAddingNewAddress && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="border-2 border-[#FDBA3A] rounded-xl p-4 space-y-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-black">New Address</h4>
                              {savedAddresses.length > 0 && (
                                <button
                                  onClick={() => setIsAddingNewAddress(false)}
                                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                  <X className="w-5 h-5 text-gray-500" />
                                </button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <select
                                value={newAddress.label}
                                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                              >
                                <option value="Home">Home</option>
                                <option value="Work">Work</option>
                                <option value="Other">Other</option>
                              </select>
                              
                              <input
                                type="text"
                                placeholder="Street Address *"
                                value={newAddress.street}
                                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                              />
                              
                              <input
                                type="text"
                                placeholder="City (letters only) *"
                                value={newAddress.city}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                  setNewAddress({ ...newAddress, city: value });
                                }}
                                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                              />
                              
                              <input
                                type="text"
                                placeholder="State (letters only) *"
                                value={newAddress.state}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                  setNewAddress({ ...newAddress, state: value });
                                }}
                                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                              />
                              
                              <input
                                type="text"
                                placeholder="Postal Code (6 digits) *"
                                value={newAddress.postalCode}
                                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                              />
                              
                              <input
                                type="text"
                                placeholder="Country"
                                value={newAddress.country}
                                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                              />
                            </div>

                            <button
                              onClick={handleAddNewAddress}
                              className="w-full py-3 bg-[#FDBA3A] text-black rounded-xl hover:bg-[#f5a623] transition-colors"
                            >
                              Save & Use This Address
                            </button>
                          </motion.div>
                        )}

                        {savedAddresses.length === 0 && !isAddingNewAddress && (
                          <div className="text-center py-8 text-gray-500">
                            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No saved addresses found</p>
                            <p className="text-sm">Please add an address to continue</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl text-black mb-6">Payment Method</h2>
                  
                  {/* Payment Options */}
                  <div className="space-y-3 mb-6">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#FDBA3A] bg-[#FDBA3A]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-black" />
                        <span className="text-black">Credit / Debit Card</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-[#FDBA3A] bg-[#FDBA3A]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Banknote className="w-5 h-5 text-black" />
                        <span className="text-black">UPI</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#FDBA3A] bg-[#FDBA3A]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Banknote className="w-5 h-5 text-black" />
                        <span className="text-black">Cash on Delivery</span>
                      </div>
                    </button>
                  </div>

                  {/* Card Payment Section */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      {/* Saved Cards */}
                      {savedCards.length > 0 && !isAddingNewCard && (
                        <div className="space-y-3">
                          {savedCards.map((card) => (
                            <motion.button
                              key={card.id}
                              onClick={() => handleSelectCard(card)}
                              whileHover={{ scale: 1.01 }}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                selectedCardId === card.id
                                  ? 'border-[#FDBA3A] bg-[#FDBA3A]/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <CreditCard className="w-6 h-6 text-[#FDBA3A]" />
                                  <div>
                                    <p className="text-black">{maskCardNumber(card.cardNumber)}</p>
                                    <p className="text-sm text-gray-500">{card.cardHolder}</p>
                                  </div>
                                </div>
                                {selectedCardId === card.id && (
                                  <Check className="w-5 h-5 text-[#FDBA3A]" />
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {/* Add New Card Button */}
                      {!isAddingNewCard && (
                        <button
                          onClick={() => setIsAddingNewCard(true)}
                          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#FDBA3A] hover:text-[#FDBA3A] transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add New Card
                        </button>
                      )}

                      {/* New Card Form */}
                      {isAddingNewCard && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="border-2 border-[#FDBA3A] rounded-xl p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-black">New Card</h4>
                            {savedCards.length > 0 && (
                              <button
                                onClick={() => setIsAddingNewCard(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <X className="w-5 h-5 text-gray-500" />
                              </button>
                            )}
                          </div>

                          <input
                            type="text"
                            placeholder="Card Number *"
                            value={cardDetails.cardNumber}
                            onChange={(e) => {
                              const formatted = formatCardNumber(e.target.value);
                              if (formatted.replace(/\s/g, '').length <= 19) {
                                setCardDetails({ ...cardDetails, cardNumber: formatted });
                              }
                            }}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                          />

                          <input
                            type="text"
                            placeholder="Cardholder Name (letters only) *"
                            value={cardDetails.cardHolder}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                              setCardDetails({ ...cardDetails, cardHolder: value });
                            }}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="MM/YY *"
                              value={cardDetails.expiryDate}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length >= 2) {
                                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                }
                                setCardDetails({ ...cardDetails, expiryDate: value });
                              }}
                              maxLength={5}
                              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                            />

                            <input
                              type="text"
                              placeholder="CVV *"
                              value={cardDetails.cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setCardDetails({ ...cardDetails, cvv: value });
                              }}
                              maxLength={4}
                              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
                            />
                          </div>

                          <button
                            onClick={handleAddNewCard}
                            className="w-full py-3 bg-[#FDBA3A] text-black rounded-xl hover:bg-[#f5a623] transition-colors"
                          >
                            Save & Use This Card
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* UPI Section */}
                  {paymentMethod === 'upi' && (
                    <div className="text-center py-6 text-gray-600">
                      <Banknote className="w-12 h-12 mx-auto mb-3 text-[#FDBA3A]" />
                      <p>UPI payment will be processed at the time of order placement</p>
                    </div>
                  )}

                  {/* COD Section */}
                  {paymentMethod === 'cod' && (
                    <div className="text-center py-6 text-gray-600">
                      <Banknote className="w-12 h-12 mx-auto mb-3 text-[#FDBA3A]" />
                      <p>Pay with cash when your order is delivered</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl text-black mb-6">Review Order</h2>

                  {/* Shipping Info */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-black mb-3">Shipping Address</h3>
                    {selectedAddressId && savedAddresses.find(a => a.id === selectedAddressId) && (
                      <div className="text-gray-600">
                        {(() => {
                          const addr = savedAddresses.find(a => a.id === selectedAddressId);
                          return addr ? (
                            <>
                              <p>{shippingInfo.fullName}</p>
                              <p>{addr.street}</p>
                              <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                              <p>{addr.country}</p>
                              <p className="mt-2">{shippingInfo.email}</p>
                              <p>{shippingInfo.phone}</p>
                            </>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-black mb-3">Payment Method</h3>
                    <div className="text-gray-600">
                      {paymentMethod === 'card' && selectedCardId && savedCards.find(c => c.id === selectedCardId) && (
                        <p>{maskCardNumber(savedCards.find(c => c.id === selectedCardId)!.cardNumber)}</p>
                      )}
                      {paymentMethod === 'upi' && <p>UPI Payment</p>}
                      {paymentMethod === 'cod' && <p>Cash on Delivery</p>}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-black mb-3">Order Items ({cart.length})</h3>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-black">{item.name}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <p className="text-black">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex gap-4">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-colors"
                  >
                    Back
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    onClick={currentStep === 1 ? handleContinueToPayment : handleContinueToReview}
                    className="flex-1 py-3 bg-[#FDBA3A] text-black rounded-xl hover:bg-[#f5a623] transition-colors flex items-center justify-center gap-2"
                  >
                    Continue
                    <Lock className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className={`flex-1 py-3 bg-[#FDBA3A] text-black rounded-xl transition-colors flex items-center justify-center gap-2 ${
                      isPlacingOrder ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f5a623]'
                    }`}
                  >
                    {isPlacingOrder ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        Place Order
                        <Lock className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm sticky top-32"
            >
              <h3 className="text-xl text-black mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-black">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-black">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="text-black">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-black">Total</span>
                    <span className="text-black">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {shipping === 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700">
                    🎉 You've qualified for FREE shipping!
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4 text-[#FDBA3A]" />
                  <span>Secure checkout</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}