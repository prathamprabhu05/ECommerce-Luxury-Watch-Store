export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  stock: number; // Available stock quantity
  specs?: {
    movement?: string;
    caseMaterial?: string;
    caseSize?: string;
    waterResistance?: string;
    strapMaterial?: string;
    warranty?: string;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string; // Firebase UID
  name: string;
  email: string;
  isAdmin?: boolean; // Admin flag
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: string;
}

export interface PaymentCard {
  id: string;
  type: string;
  cardNumber?: string;
  lastFour: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv?: string;
  createdAt: string;
}

export interface CreditCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: string;
  total: number;
  status: string;
  createdAt: string;
}