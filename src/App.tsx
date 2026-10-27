import { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Order, ViewMode } from './types';
import * as store from './store';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');
  const [products, setProducts] = useState<Product[]>(store.getProducts());
  const [cart, setCart] = useState<CartItem[]>(store.getCart());
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [currentScreen, setCurrentScreen] = useState<string>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Detect device
  useEffect(() => {
    const checkDevice = () => {
      if (window.innerWidth >= 1024) {
        setViewMode('desktop');
      } else {
        setViewMode('mobile');
      }
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // F6 for admin panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F6') {
        e.preventDefault();
        setShowAdminPanel(!showAdminPanel);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAdminPanel]);

  const refreshData = useCallback(() => {
    setProducts(store.getProducts());
    setCart(store.getCart());
    setOrders(store.getOrders());
  }, []);

  const categories = ['Все', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.priceDiscount * item.quantity : 0);
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Admin Panel Component
  const AdminPanel = () => {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
      name: '', description: '', priceOriginal: 0, priceDiscount: 0,
      category: '', brand: '', images: [], sizes: [], colors: [], inStock: true
    });
    const [isCreating, setIsCreating] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => {
      const files = e.target.files;
      if (!files) return;
      const readers: Promise<string>[] = [];
      for (let i = 0; i < files.length; i++) {
        readers.push(new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(files[i]);
        }));
      }
      Promise.all(readers).then((results) => {
        if (isNew) {
          setNewProduct(prev => ({ ...prev, images: [...(prev.images || []), ...results] }));
        } else if (editingProduct) {
          setEditingProduct({ ...editingProduct, images: [...editingProduct.images, ...results] });
        }
      });
    };

    const handleCreate = () => {
      if (!newProduct.name || !newProduct.priceDiscount) return;
      const product: Product = {
        id: store.generateId(),
        name: newProduct.name || '',
        description: newProduct.description || '',
        priceOriginal: newProduct.priceOriginal || 0,
        priceDiscount: newProduct.priceDiscount || 0,
        category: newProduct.category || 'Другое',
        images: newProduct.images || [],
        brand: newProduct.brand || '',
        rating: 4.5,
        reviews: 0,
        sizes: newProduct.sizes || [],
        colors: newProduct.colors || [],
        inStock: true,
        createdAt: Date.now()
      };
      store.addProduct(product);
      setNewProduct({ name: '', description: '', priceOriginal: 0, priceDiscount: 0, category: '', brand: '', images: [], sizes: [], colors: [], inStock: true });
      setIsCreating(false);
      refreshData();
    };

    const handleUpdate = () => {
      if (!editingProduct) return;
      store.updateProduct(editingProduct);
      setEditingProduct(null);
      refreshData();
    };

    const handleDelete = (id: string) => {
      store.deleteProduct(id);
      refreshData();
    };

    if (showAdminPanel) {
      return (
        <div className="fixed inset-0 z-[9999] bg-gray-900 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">
                <i className="fas fa-cog mr-2 text-purple-400"></i>
                Панель управления товарами
              </h1>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCreating(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  <i className="fas fa-plus mr-2"></i>Добавить товар
                </button>
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  <i className="fas fa-times mr-2"></i>Закрыть (F6)
                </button>
              </div>
            </div>

            {/* Create Product Form */}
            {isCreating && (
              <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Новый товар</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Название</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1"
                      placeholder="Название товара"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Бренд</label>
                    <input
                      type="text"
                      value={newProduct.brand}
                      onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1"
                      placeholder="Бренд"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Категория</label>
                    <input
                      type="text"
                      value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1"
                      placeholder="Категория"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Цена без скидки (₽)</label>
                    <input
                      type="number"
                      value={newProduct.priceOriginal || ''}
                      onChange={e => setNewProduct({ ...newProduct, priceOriginal: Number(e.target.value) })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Цена со скидкой (₽)</label>
                    <input
                      type="number"
                      value={newProduct.priceDiscount || ''}
                      onChange={e => setNewProduct({ ...newProduct, priceDiscount: Number(e.target.value) })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Размеры (через запятую)</label>
                    <input
                      type="text"
                      value={newProduct.sizes?.join(', ') || ''}
                      onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1"
                      placeholder="S, M, L, XL"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Цвета (через запятую)</label>
                    <input
                      type="text"
                      value={newProduct.colors?.join(', ') || ''}
                      onChange={e => setNewProduct({ ...newProduct, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1"
                      placeholder="Чёрный, Белый"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Фотографии</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => handleImageUpload(e, true)}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1 file:mr-3 file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-2 file:py-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-gray-400 text-sm">Описание</label>
                    <textarea
                      value={newProduct.description}
                      onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1 h-24 resize-none"
                      placeholder="Описание товара..."
                    />
                  </div>
                </div>
                {newProduct.images && newProduct.images.length > 0 && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {newProduct.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                  <button onClick={handleCreate} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                    <i className="fas fa-check mr-2"></i>Создать
                  </button>
                  <button onClick={() => setIsCreating(false)} className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg">
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Edit Product Form */}
            {editingProduct && (
              <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-purple-700">
                <h2 className="text-lg font-semibold text-white mb-4">Редактирование: {editingProduct.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Название</label>
                    <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Бренд</label>
                    <input type="text" value={editingProduct.brand} onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Категория</label>
                    <input type="text" value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Цена без скидки (₽)</label>
                    <input type="number" value={editingProduct.priceOriginal} onChange={e => setEditingProduct({ ...editingProduct, priceOriginal: Number(e.target.value) })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Цена со скидкой (₽)</label>
                    <input type="number" value={editingProduct.priceDiscount} onChange={e => setEditingProduct({ ...editingProduct, priceDiscount: Number(e.target.value) })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Размеры (через запятую)</label>
                    <input type="text" value={editingProduct.sizes?.join(', ') || ''} onChange={e => setEditingProduct({ ...editingProduct, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Цвета (через запятую)</label>
                    <input type="text" value={editingProduct.colors?.join(', ') || ''} onChange={e => setEditingProduct({ ...editingProduct, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Добавить фото</label>
                    <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(e, false)} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1 file:mr-3 file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-2 file:py-1" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-gray-400 text-sm">Описание</label>
                    <textarea value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mt-1 h-24 resize-none" />
                  </div>
                </div>
                {editingProduct.images.length > 0 && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {editingProduct.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                        <button onClick={() => setEditingProduct({ ...editingProduct, images: editingProduct.images.filter((_, idx) => idx !== i) })} className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                  <button onClick={handleUpdate} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                    <i className="fas fa-save mr-2"></i>Сохранить
                  </button>
                  <button onClick={() => setEditingProduct(null)} className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg">
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Products List */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-750 border-b border-gray-700">
                  <tr>
                    <th className="text-left text-gray-400 text-sm px-4 py-3">Фото</th>
                    <th className="text-left text-gray-400 text-sm px-4 py-3">Название</th>
                    <th className="text-left text-gray-400 text-sm px-4 py-3">Бренд</th>
                    <th className="text-left text-gray-400 text-sm px-4 py-3">Категория</th>
                    <th className="text-left text-gray-400 text-sm px-4 py-3">Цена</th>
                    <th className="text-left text-gray-400 text-sm px-4 py-3">Скидка</th>
                    <th className="text-left text-gray-400 text-sm px-4 py-3">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="px-4 py-3">
                        {product.images.length > 0 ? (
                          <img src={product.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-gray-500">
                            <i className="fas fa-image"></i>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white text-sm">{product.name}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{product.brand}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{product.category}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm line-through">{product.priceOriginal.toLocaleString()} ₽</td>
                      <td className="px-4 py-3 text-purple-400 text-sm font-bold">{product.priceDiscount.toLocaleString()} ₽</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setEditingProduct(product)} className="text-blue-400 hover:text-blue-300 text-sm">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300 text-sm">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Orders Section */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white mb-4">
                <i className="fas fa-box mr-2 text-blue-400"></i>Заказы ({orders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-mono text-sm">#{order.id.slice(0, 8)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'new' ? 'bg-yellow-900 text-yellow-300' :
                        order.status === 'processing' ? 'bg-blue-900 text-blue-300' :
                        order.status === 'ready' ? 'bg-green-900 text-green-300' :
                        order.status === 'issued' ? 'bg-gray-700 text-gray-300' :
                        'bg-red-900 text-red-300'
                      }`}>
                        {order.status === 'new' ? 'Новый' : order.status === 'processing' ? 'В обработке' : order.status === 'ready' ? 'Готов' : order.status === 'issued' ? 'Выдан' : 'Отменён'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">{order.customerName}</div>
                    <div className="text-gray-500 text-xs">{order.customerPhone}</div>
                    <div className="text-purple-400 font-bold mt-2">{order.total.toLocaleString()} ₽</div>
                    <div className="text-gray-400 text-xs mt-1">Код выдачи: <span className="font-mono text-white">{order.pickupCode}</span></div>
                    <div className="flex gap-2 mt-3">
                      {order.status === 'new' && (
                        <button onClick={() => { store.updateOrderStatus(order.id, 'processing'); refreshData(); }} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">В обработку</button>
                      )}
                      {order.status === 'processing' && (
                        <button onClick={() => { store.updateOrderStatus(order.id, 'ready'); refreshData(); }} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Готов к выдаче</button>
                      )}
                      {order.status === 'ready' && (
                        <button onClick={() => { store.updateOrderStatus(order.id, 'issued'); refreshData(); }} className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Выдать</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Mobile View - Customer ordering
  const MobileView = () => {
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const handleAddToCart = (product: Product) => {
      store.addToCart({
        productId: product.id,
        quantity: 1,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined
      });
      refreshData();
      setCurrentScreen('catalog');
    };

    const handleCheckout = () => {
      if (!customerName || !customerPhone || cart.length === 0) return;
      const order: Order = {
        id: store.generateId(),
        items: [...cart],
        status: 'new',
        total: cartTotal,
        createdAt: Date.now(),
        customerName,
        customerPhone,
        pickupCode: store.generatePickupCode()
      };
      store.addOrder(order);
      store.clearCart();
      refreshData();
      setOrderPlaced(true);
    };

    if (currentScreen === 'product' && selectedProduct) {
      const discount = Math.round((1 - selectedProduct.priceDiscount / selectedProduct.priceOriginal) * 100);
      return (
        <div className="min-h-screen bg-white pb-20">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center p-3 border-b">
            <button onClick={() => setCurrentScreen('catalog')} className="text-purple-600 text-lg">
              <i className="fas fa-arrow-left"></i>
            </button>
            <span className="ml-3 font-medium text-sm truncate">{selectedProduct.name}</span>
          </div>

          {/* Product Image */}
          <div className="relative">
            {selectedProduct.images.length > 0 ? (
              <img src={selectedProduct.images[0]} alt="" className="w-full h-80 object-cover" />
            ) : (
              <div className="w-full h-80 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <i className="fas fa-image text-6xl text-purple-300"></i>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          </div>

          {/* Price */}
          <div className="p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{selectedProduct.priceDiscount.toLocaleString()} ₽</span>
              <span className="text-sm text-gray-400 line-through">{selectedProduct.priceOriginal.toLocaleString()} ₽</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-500 text-sm">
                {'★'.repeat(Math.floor(selectedProduct.rating))}{'☆'.repeat(5 - Math.floor(selectedProduct.rating))}
              </span>
              <span className="text-gray-400 text-xs">{selectedProduct.rating} ({selectedProduct.reviews} отзывов)</span>
            </div>
          </div>

          {/* Product Info */}
          <div className="px-4 pb-4">
            <h2 className="font-semibold text-gray-900">{selectedProduct.brand} / {selectedProduct.name}</h2>
            <p className="text-gray-500 text-sm mt-2">{selectedProduct.description}</p>
          </div>

          {/* Sizes */}
          {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
            <div className="px-4 pb-4">
              <h3 className="font-medium text-sm text-gray-700 mb-2">Размер</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      selectedSize === size ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {selectedProduct.colors && selectedProduct.colors.length > 0 && (
            <div className="px-4 pb-4">
              <h3 className="font-medium text-sm text-gray-700 mb-2">Цвет</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      selectedColor === color ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Info */}
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <i className="fas fa-truck text-purple-500"></i>
                <span>Доставка в пункт выдачи — бесплатно</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <i className="fas fa-clock text-purple-500"></i>
                <span>Завтра, после 12:00</span>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3">
            <button
              onClick={() => handleAddToCart(selectedProduct)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl"
            >
              <i className="fas fa-shopping-bag mr-2"></i>Добавить в корзину
            </button>
          </div>
        </div>
      );
    }

    if (currentScreen === 'cart') {
      if (orderPlaced) {
        return (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-check text-3xl text-green-500"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Заказ оформлен!</h2>
            <p className="text-gray-500 text-center mt-2">Вы получите уведомление когда заказ будет готов к выдаче</p>
            <button
              onClick={() => { setOrderPlaced(false); setCurrentScreen('catalog'); }}
              className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-xl"
            >
              Вернуться к покупкам
            </button>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="sticky top-0 bg-white z-10 flex items-center p-3 border-b">
            <button onClick={() => setCurrentScreen('catalog')} className="text-purple-600 text-lg">
              <i className="fas fa-arrow-left"></i>
            </button>
            <span className="ml-3 font-medium">Корзина ({cartCount})</span>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <i className="fas fa-shopping-bag text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-400">Корзина пуста</p>
            </div>
          ) : (
            <>
              <div className="p-3 space-y-3">
                {cart.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="bg-white rounded-xl p-3 flex gap-3">
                      {product.images.length > 0 ? (
                        <img src={product.images[0]} alt="" className="w-20 h-20 object-cover rounded-lg" />
                      ) : (
                        <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-image text-purple-300"></i>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.selectedSize && <span>Размер: {item.selectedSize} </span>}
                          {item.selectedColor && <span>Цвет: {item.selectedColor}</span>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-gray-900">{(product.priceDiscount * item.quantity).toLocaleString()} ₽</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { store.updateCartQuantity(item.productId, item.quantity - 1); refreshData(); }}
                              className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"
                            >
                              −
                            </button>
                            <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => { store.updateCartQuantity(item.productId, item.quantity + 1); refreshData(); }}
                              className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => { store.removeFromCart(item.productId); refreshData(); }}
                        className="text-gray-300 hover:text-red-400 self-start"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Checkout Form */}
              <div className="p-3">
                <div className="bg-white rounded-xl p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Данные для получения</h3>
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-2 text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Телефон"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* Checkout Button */}
          {cart.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Итого:</span>
                <span className="text-lg font-bold text-gray-900">{cartTotal.toLocaleString()} ₽</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={!customerName || !customerPhone}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-3 rounded-xl"
              >
                Оформить заказ
              </button>
            </div>
          )}
        </div>
      );
    }

    // Catalog Screen
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 shadow-sm">
          <div className="flex items-center p-3 gap-3">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">WB</span>
              </div>
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Найти на Wildberries"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 rounded-lg pl-9 pr-3 py-2 text-sm"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
          </div>
          {/* Categories */}
          <div className="flex overflow-x-auto gap-2 px-3 pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${
                  selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-3">
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(product => {
              const discount = Math.round((1 - product.priceDiscount / product.priceOriginal) * 100);
              return (
                <div
                  key={product.id}
                  onClick={() => { setSelectedProduct(product); setCurrentScreen('product'); setSelectedSize(''); setSelectedColor(''); }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="relative">
                    {product.images.length > 0 ? (
                      <img src={product.images[0]} alt="" className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                        <i className="fas fa-tshirt text-3xl text-purple-200"></i>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      -{discount}%
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-gray-900">{product.priceDiscount.toLocaleString()} ₽</span>
                    </div>
                    <span className="text-[10px] text-gray-400 line-through">{product.priceOriginal.toLocaleString()} ₽</span>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.brand} / {product.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500 text-[10px]">★</span>
                      <span className="text-[10px] text-gray-400">{product.rating}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex">
          <button
            onClick={() => setCurrentScreen('catalog')}
            className={`flex-1 py-3 flex flex-col items-center ${currentScreen === 'catalog' ? 'text-purple-600' : 'text-gray-400'}`}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="text-[10px] mt-0.5">Главная</span>
          </button>
          <button className="flex-1 py-3 flex flex-col items-center text-gray-400">
            <i className="fas fa-th-large text-lg"></i>
            <span className="text-[10px] mt-0.5">Каталог</span>
          </button>
          <button
            onClick={() => setCurrentScreen('cart')}
            className={`flex-1 py-3 flex flex-col items-center relative ${currentScreen === 'cart' ? 'text-purple-600' : 'text-gray-400'}`}
          >
            <i className="fas fa-shopping-bag text-lg"></i>
            <span className="text-[10px] mt-0.5">Корзина</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button className="flex-1 py-3 flex flex-col items-center text-gray-400">
            <i className="fas fa-heart text-lg"></i>
            <span className="text-[10px] mt-0.5">Избранное</span>
          </button>
          <button className="flex-1 py-3 flex flex-col items-center text-gray-400">
            <i className="fas fa-user text-lg"></i>
            <span className="text-[10px] mt-0.5">Профиль</span>
          </button>
        </div>
      </div>
    );
  };

  // Desktop View - Pickup Point
  const DesktopView = () => {
    const [activeTab, setActiveTab] = useState<'orders' | 'issuing' | 'returns'>('orders');
    const [issueCode, setIssueCode] = useState('');
    const [issueMessage, setIssueMessage] = useState('');

    const handleIssue = () => {
      const order = orders.find(o => o.pickupCode === issueCode && o.status === 'ready');
      if (order) {
        store.updateOrderStatus(order.id, 'issued');
        setIssueMessage(`✅ Заказ #${order.id.slice(0, 8)} выдан!`);
        setIssueCode('');
        refreshData();
        setTimeout(() => setIssueMessage(''), 3000);
      } else {
        setIssueMessage('❌ Заказ не найден или не готов к выдаче');
        setTimeout(() => setIssueMessage(''), 3000);
      }
    };

    const statusLabel = (status: Order['status']) => {
      switch(status) {
        case 'new': return { text: 'Новый', color: 'bg-yellow-100 text-yellow-700' };
        case 'processing': return { text: 'В обработке', color: 'bg-blue-100 text-blue-700' };
        case 'ready': return { text: 'Готов к выдаче', color: 'bg-green-100 text-green-700' };
        case 'issued': return { text: 'Выдан', color: 'bg-gray-100 text-gray-600' };
        case 'cancelled': return { text: 'Отменён', color: 'bg-red-100 text-red-700' };
      }
    };

    const activeOrders = orders.filter(o => o.status !== 'issued' && o.status !== 'cancelled');
    const readyOrders = orders.filter(o => o.status === 'ready');

    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">WB</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Пункт выдачи заказов</h1>
                <p className="text-xs text-gray-400">ПВЗ #1234 • г. Москва</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">Оператор</div>
                <div className="text-xs text-gray-400">Смена: 09:00 - 21:00</div>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-purple-600"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-inbox text-yellow-600"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{activeOrders.length}</div>
                  <div className="text-xs text-gray-400">Активных заказов</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-green-600"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{readyOrders.length}</div>
                  <div className="text-xs text-gray-400">Готовы к выдаче</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-box text-blue-600"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'issued').length}</div>
                  <div className="text-xs text-gray-400">Выдано сегодня</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-ruble-sign text-purple-600"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{orders.reduce((s, o) => s + o.total, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Оборот (₽)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-2">
              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'orders' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}
                  >
                    Все заказы
                  </button>
                  <button
                    onClick={() => setActiveTab('issuing')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'issuing' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}
                  >
                    Выдача
                  </button>
                  <button
                    onClick={() => setActiveTab('returns')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'returns' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}
                  >
                    Возвраты
                  </button>
                </div>

                <div className="p-4">
                  {activeTab === 'orders' && (
                    <div className="space-y-3">
                      {orders.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <i className="fas fa-box-open text-3xl mb-3"></i>
                          <p>Нет заказов</p>
                        </div>
                      ) : (
                        orders.map(order => {
                          const status = statusLabel(order.status);
                          return (
                            <div key={order.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-box text-purple-500"></i>
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm text-gray-900">#{order.id.slice(0, 8)}</div>
                                    <div className="text-xs text-gray-400">{order.customerName} • {order.items.length} товар(ов)</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>{status.text}</span>
                                  <span className="text-sm font-bold text-gray-900">{order.total.toLocaleString()} ₽</span>
                                </div>
                              </div>
                              {order.status === 'ready' && (
                                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                                  <span className="text-xs text-gray-400">Код: <span className="font-mono font-bold text-gray-700">{order.pickupCode}</span></span>
                                  <button
                                    onClick={() => { store.updateOrderStatus(order.id, 'issued'); refreshData(); }}
                                    className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                                  >
                                    Выдать
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {activeTab === 'issuing' && (
                    <div className="py-6">
                      <div className="max-w-sm mx-auto text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-qrcode text-2xl text-purple-600"></i>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">Выдача заказа</h3>
                        <p className="text-sm text-gray-400 mb-4">Введите код получения заказа</p>
                        <input
                          type="text"
                          placeholder="Код (6 цифр)"
                          value={issueCode}
                          onChange={e => setIssueCode(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-center text-lg font-mono mb-3"
                          maxLength={6}
                        />
                        <button
                          onClick={handleIssue}
                          disabled={issueCode.length !== 6}
                          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium"
                        >
                          Выдать заказ
                        </button>
                        {issueMessage && (
                          <div className="mt-3 text-sm">{issueMessage}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'returns' && (
                    <div className="py-10 text-center text-gray-400">
                      <i className="fas fa-undo text-3xl mb-3"></i>
                      <p>Нет возвратов</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Issue */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3">
                  <i className="fas fa-bolt text-yellow-500 mr-2"></i>Быстрая выдача
                </h3>
                {readyOrders.length > 0 ? (
                  <div className="space-y-2">
                    {readyOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div>
                          <div className="text-xs text-gray-600">{order.customerName}</div>
                          <div className="font-mono text-sm font-bold text-gray-900">{order.pickupCode}</div>
                        </div>
                        <button
                          onClick={() => { store.updateOrderStatus(order.id, 'issued'); refreshData(); }}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                        >
                          Выдать
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">Нет заказов готовых к выдаче</p>
                )}
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3">
                  <i className="fas fa-clock text-blue-500 mr-2"></i>Режим работы
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Пн-Пт</span>
                    <span className="text-gray-700">09:00 - 21:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Сб-Вс</span>
                    <span className="text-gray-700">10:00 - 20:00</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-xs text-purple-600">
                  <i className="fas fa-info-circle mr-1"></i>
                  Нажмите <kbd className="bg-purple-200 px-1 rounded">F6</kbd> для панели управления товарами
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans">
      <AdminPanel />
      {viewMode === 'mobile' ? <MobileView /> : <DesktopView />}
    </div>
  );
}
