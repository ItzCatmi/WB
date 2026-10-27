export interface Product {
  id: string;
  name: string;
  description: string;
  priceOriginal: number;
  priceDiscount: number;
  category: string;
  images: string[];
  brand: string;
  rating: number;
  reviews: number;
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  createdAt: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: 'new' | 'processing' | 'ready' | 'issued' | 'cancelled';
  total: number;
  createdAt: number;
  customerName: string;
  customerPhone: string;
  pickupCode: string;
}

export type ViewMode = 'mobile' | 'desktop' | 'admin';
