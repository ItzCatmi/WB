import { Product, Order, CartItem } from './types';

const PRODUCTS_KEY = 'wb_products';
const ORDERS_KEY = 'wb_orders';
const CART_KEY = 'wb_cart';

// Default products
const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Кроссовки Nike Air Max 90',
    description: 'Легендарные кроссовки Nike Air Max 90. Комфортная посадка, амортизирующая подошва Air, стильный дизайн. Идеальны для повседневной носки.',
    priceOriginal: 12990,
    priceDiscount: 7490,
    category: 'Обувь',
    images: [],
    brand: 'Nike',
    rating: 4.8,
    reviews: 1243,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['Белый', 'Чёрный', 'Серый'],
    inStock: true,
    createdAt: Date.now()
  },
  {
    id: '2',
    name: 'Худи оверсайз хлопок',
    description: 'Мягкое худи оверсайз из 100% хлопка. Удобная посадка, карман-кенгуру, капюшон с кулиской. Отличный вариант для повседневного стиля.',
    priceOriginal: 4990,
    priceDiscount: 2490,
    category: 'Одежда',
    images: [],
    brand: 'ZARA',
    rating: 4.6,
    reviews: 856,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Чёрный', 'Бежевый', 'Серый меланж'],
    inStock: true,
    createdAt: Date.now()
  },
  {
    id: '3',
    name: 'Смарт-часы Apple Watch SE',
    description: 'Apple Watch SE 2-го поколения. Мониторинг здоровья, GPS, водозащита, до 18 часов работы. Алюминиевый корпус.',
    priceOriginal: 29990,
    priceDiscount: 22990,
    category: 'Электроника',
    images: [],
    brand: 'Apple',
    rating: 4.9,
    reviews: 3421,
    sizes: ['40mm', '44mm'],
    colors: ['Серый', 'Серебристый', 'Тёмная ночь'],
    inStock: true,
    createdAt: Date.now()
  },
  {
    id: '4',
    name: 'Рюкзак городской 25л',
    description: 'Городской рюкзак объёмом 25 литров. Водоотталкивающая ткань, отделение для ноутбука до 15.6", USB-порт для зарядки.',
    priceOriginal: 3490,
    priceDiscount: 1890,
    category: 'Аксессуары',
    images: [],
    brand: 'Xiaomi',
    rating: 4.5,
    reviews: 567,
    sizes: [],
    colors: ['Чёрный', 'Синий', 'Серый'],
    inStock: true,
    createdAt: Date.now()
  },
  {
    id: '5',
    name: 'Крем для лица увлажняющий',
    description: 'Увлажняющий крем для лица с гиалуроновой кислотой и витамином E. Подходит для всех типов кожи. 50 мл.',
    priceOriginal: 1890,
    priceDiscount: 990,
    category: 'Красота',
    images: [],
    brand: 'CeraVe',
    rating: 4.7,
    reviews: 2134,
    sizes: ['50 мл', '100 мл'],
    colors: [],
    inStock: true,
    createdAt: Date.now()
  },
  {
    id: '6',
    name: 'Джинсы мужские slim fit',
    description: 'Мужские джинсы зауженного кроя из плотного денима с эластаном. Классические 5 карманов, средняя посадка.',
    priceOriginal: 5990,
    priceDiscount: 3290,
    category: 'Одежда',
    images: [],
    brand: "Levi's",
    rating: 4.4,
    reviews: 987,
    sizes: ['29', '30', '31', '32', '33', '34'],
    colors: ['Синий', 'Тёмно-синий', 'Чёрный'],
    inStock: true,
    createdAt: Date.now()
  },
  {
    id: '7',
    name: 'Беспроводные наушники TWS',
    description: 'Беспроводные наушники с активным шумоподавлением. До 30 часов работы с кейсом, Bluetooth 5.3, IPX5.',
    priceOriginal: 8990,
    priceDiscount: 4990,
    category: 'Электроника',
    images: [],
    brand: 'JBL',
    rating: 4.6,
    reviews: 1567,
    sizes: [],
    colors: ['Чёрный', 'Белый', 'Бежевый'],
    inStock: true,
    createdAt: Date.now()
  },
  {
    id: '8',
    name: 'Платье летнее миди',
    description: 'Лёгкое летнее платье длины миди. Натуральная вискоза, V-образный вырез, расклешённая юбка. Идеально для жаркой погоды.',
    priceOriginal: 3990,
    priceDiscount: 1990,
    category: 'Одежда',
    images: [],
    brand: 'Mango',
    rating: 4.5,
    reviews: 432,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Цветочный принт', 'Однотонный зелёный', 'Однотонный розовый'],
    inStock: true,
    createdAt: Date.now()
  }
];

export function getProducts(): Product[] {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
  return defaultProducts;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Product): void {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
}

export function updateProduct(product: Product): void {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === product.id);
  if (idx !== -1) {
    products[idx] = product;
    saveProducts(products);
  }
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

export function getOrders(): Order[] {
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function addOrder(order: Order): void {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
}

export function updateOrderStatus(id: string, status: Order['status']): void {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    orders[idx].status = status;
    saveOrders(orders);
  }
}

export function getCart(): CartItem[] {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const existing = cart.find(c => c.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

export function removeFromCart(productId: string): void {
  const cart = getCart().filter(c => c.productId !== productId);
  saveCart(cart);
}

export function updateCartQuantity(productId: string, quantity: number): void {
  const cart = getCart();
  const item = cart.find(c => c.productId === productId);
  if (item) {
    if (quantity <= 0) {
      saveCart(cart.filter(c => c.productId !== productId));
    } else {
      item.quantity = quantity;
      saveCart(cart);
    }
  }
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function generatePickupCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
