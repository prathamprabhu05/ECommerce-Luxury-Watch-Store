import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase/config';

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  phone?: string;
  addresses: Address[];
  preferences: {
    newsletter: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profileRef = doc(db, 'userProfiles', userId);
    const profileDoc = await getDoc(profileRef);

    if (!profileDoc.exists()) {
      return null;
    }

    return {
      userId,
      ...profileDoc.data(),
    } as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Create user profile
export const createUserProfile = async (
  userId: string,
  email: string,
  displayName: string
): Promise<boolean> => {
  try {
    const profileRef = doc(db, 'userProfiles', userId);
    const profileData: Omit<UserProfile, 'userId'> = {
      email,
      displayName,
      addresses: [],
      preferences: {
        newsletter: true,
        orderUpdates: true,
        promotions: true,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(profileRef, profileData);
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<UserProfile, 'userId' | 'email' | 'createdAt'>>
): Promise<boolean> => {
  try {
    const profileRef = doc(db, 'userProfiles', userId);
    await updateDoc(profileRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// Add address to user profile
export const addAddress = async (
  userId: string,
  address: Omit<Address, 'id'>
): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      ...address,
    };

    // If this is the first address or is set as default, make it default
    let addresses = profile.addresses || [];
    if (address.isDefault || addresses.length === 0) {
      // Remove default from other addresses
      addresses = addresses.map((addr) => ({ ...addr, isDefault: false }));
      newAddress.isDefault = true;
    }

    addresses.push(newAddress);

    return await updateUserProfile(userId, { addresses });
  } catch (error) {
    console.error('Error adding address:', error);
    return false;
  }
};

// Update address
export const updateAddress = async (
  userId: string,
  addressId: string,
  updates: Partial<Omit<Address, 'id'>>
): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    let addresses = profile.addresses || [];
    const addressIndex = addresses.findIndex((addr) => addr.id === addressId);

    if (addressIndex === -1) {
      throw new Error('Address not found');
    }

    // If setting this address as default, remove default from others
    if (updates.isDefault) {
      addresses = addresses.map((addr) => ({ ...addr, isDefault: false }));
    }

    addresses[addressIndex] = {
      ...addresses[addressIndex],
      ...updates,
    };

    return await updateUserProfile(userId, { addresses });
  } catch (error) {
    console.error('Error updating address:', error);
    return false;
  }
};

// Delete address
export const deleteAddress = async (
  userId: string,
  addressId: string
): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    let addresses = profile.addresses || [];
    const addressToDelete = addresses.find((addr) => addr.id === addressId);
    
    if (!addressToDelete) {
      throw new Error('Address not found');
    }

    addresses = addresses.filter((addr) => addr.id !== addressId);

    // If deleted address was default and there are other addresses, set first one as default
    if (addressToDelete.isDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    return await updateUserProfile(userId, { addresses });
  } catch (error) {
    console.error('Error deleting address:', error);
    return false;
  }
};

// Set default address
export const setDefaultAddress = async (
  userId: string,
  addressId: string
): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const addresses = (profile.addresses || []).map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));

    return await updateUserProfile(userId, { addresses });
  } catch (error) {
    console.error('Error setting default address:', error);
    return false;
  }
};

// Get default address
export const getDefaultAddress = async (userId: string): Promise<Address | null> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return null;

    const defaultAddress = profile.addresses?.find((addr) => addr.isDefault);
    return defaultAddress || profile.addresses?.[0] || null;
  } catch (error) {
    console.error('Error getting default address:', error);
    return null;
  }
};

// Update user preferences
export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<UserProfile['preferences']>
): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const updatedPreferences = {
      ...profile.preferences,
      ...preferences,
    };

    return await updateUserProfile(userId, { preferences: updatedPreferences });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return false;
  }
};