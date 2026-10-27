import { Product, Order, CartItem } from './types';

// API base URL - auto-detect
const API_BASE = window.location.origin;

// Device ID for cart isolation
function getDeviceId(): string {
  let id = localStorage.getItem('wb_device_id');
  if (!id) {
    id = Math.random().toString(36).substr(2, 9);
    localStorage.setItem('wb_device_id', id);
  }
  return id;
}

// ============ PRODUCTS ============

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

export async function addProduct(product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  return await res.json();
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
}

// ============ ORDERS ============

export async function getOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_BASE}/api/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
}

export async function createOrder(order: Partial<Order>): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  return await res.json();
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return await res.json();
}

// ============ CART (per device) ============

export async function getCart(): Promise<CartItem[]> {
  try {
    const deviceId = getDeviceId();
    const res = await fetch(`${API_BASE}/api/cart/${deviceId}`);
    if (!res.ok) throw new Error('Failed to fetch cart');
    return await res.json();
  } catch (err) {
    console.error('Error fetching cart:', err);
    return [];
  }
}

export async function saveCart(cart: CartItem[]): Promise<void> {
  const deviceId = getDeviceId();
  await fetch(`${API_BASE}/api/cart/${deviceId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cart)
  });
}

export async function addToCart(item: CartItem): Promise<CartItem[]> {
  const cart = await getCart();
  const existing = cart.find(c => c.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  await saveCart(cart);
  return cart;
}

export async function removeFromCart(productId: string): Promise<CartItem[]> {
  const cart = await getCart();
  const newCart = cart.filter(c => c.productId !== productId);
  await saveCart(newCart);
  return newCart;
}

export async function updateCartQuantity(productId: string, quantity: number): Promise<CartItem[]> {
  const cart = await getCart();
  if (quantity <= 0) {
    const newCart = cart.filter(c => c.productId !== productId);
    await saveCart(newCart);
    return newCart;
  }
  const item = cart.find(c => c.productId === productId);
  if (item) {
    item.quantity = quantity;
    await saveCart(cart);
  }
  return cart;
}

export async function clearCart(): Promise<void> {
  const deviceId = getDeviceId();
  await fetch(`${API_BASE}/api/cart/${deviceId}`, { method: 'DELETE' });
}

// ============ FILE UPLOAD ============

export async function uploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  return data.urls || [];
}

// ============ UTILS ============

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function generatePickupCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
