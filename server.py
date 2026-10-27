from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import json
import os
import uuid
import random
import string
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)

# Configuration
DATA_DIR = 'data'
UPLOAD_DIR = 'data/uploads'
PRODUCTS_FILE = os.path.join(DATA_DIR, 'products.json')
ORDERS_FILE = os.path.join(DATA_DIR, 'orders.json')

# Create directories
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Default products
DEFAULT_PRODUCTS = [
    {
        "id": "1",
        "name": "Кроссовки Nike Air Max 90",
        "description": "Легендарные кроссовки Nike Air Max 90. Комфортная посадка, амортизирующая подошва Air, стильный дизайн.",
        "priceOriginal": 12990,
        "priceDiscount": 7490,
        "category": "Обувь",
        "images": [],
        "brand": "Nike",
        "rating": 4.8,
        "reviews": 1243,
        "sizes": ["39", "40", "41", "42", "43", "44"],
        "colors": ["Белый", "Чёрный", "Серый"],
        "inStock": True,
        "createdAt": int(datetime.now().timestamp() * 1000)
    },
    {
        "id": "2",
        "name": "Худи оверсайз хлопок",
        "description": "Мягкое худи оверсайз из 100% хлопка. Удобная посадка, карман-кенгуру, капюшон с кулиской.",
        "priceOriginal": 4990,
        "priceDiscount": 2490,
        "category": "Одежда",
        "images": [],
        "brand": "ZARA",
        "rating": 4.6,
        "reviews": 856,
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Чёрный", "Бежевый", "Серый меланж"],
        "inStock": True,
        "createdAt": int(datetime.now().timestamp() * 1000)
    },
    {
        "id": "3",
        "name": "Смарт-часы Apple Watch SE",
        "description": "Apple Watch SE 2-го поколения. Мониторинг здоровья, GPS, водозащита, до 18 часов работы.",
        "priceOriginal": 29990,
        "priceDiscount": 22990,
        "category": "Электроника",
        "images": [],
        "brand": "Apple",
        "rating": 4.9,
        "reviews": 3421,
        "sizes": ["40mm", "44mm"],
        "colors": ["Серый", "Серебристый", "Тёмная ночь"],
        "inStock": True,
        "createdAt": int(datetime.now().timestamp() * 1000)
    },
    {
        "id": "4",
        "name": "Рюкзак городской 25л",
        "description": "Городской рюкзак объёмом 25 литров. Водоотталкивающая ткань, отделение для ноутбука до 15.6 дюймов.",
        "priceOriginal": 3490,
        "priceDiscount": 1890,
        "category": "Аксессуары",
        "images": [],
        "brand": "Xiaomi",
        "rating": 4.5,
        "reviews": 567,
        "sizes": [],
        "colors": ["Чёрный", "Синий", "Серый"],
        "inStock": True,
        "createdAt": int(datetime.now().timestamp() * 1000)
    },
    {
        "id": "5",
        "name": "Крем для лица увлажняющий",
        "description": "Увлажняющий крем для лица с гиалуроновой кислотой и витамином E. Подходит для всех типов кожи. 50 мл.",
        "priceOriginal": 1890,
        "priceDiscount": 990,
        "category": "Красота",
        "images": [],
        "brand": "CeraVe",
        "rating": 4.7,
        "reviews": 2134,
        "sizes": ["50 мл", "100 мл"],
        "colors": [],
        "inStock": True,
        "createdAt": int(datetime.now().timestamp() * 1000)
    },
    {
        "id": "6",
        "name": "Джинсы мужские slim fit",
        "description": "Мужские джинсы зауженного кроя из плотного денима с эластаном. Классические 5 карманов.",
        "priceOriginal": 5990,
        "priceDiscount": 3290,
        "category": "Одежда",
        "images": [],
        "brand": "Levi's",
        "rating": 4.4,
        "reviews": 987,
        "sizes": ["29", "30", "31", "32", "33", "34"],
        "colors": ["Синий", "Тёмно-синий", "Чёрный"],
        "inStock": True,
        "createdAt": int(datetime.now().timestamp() * 1000)
    },
    {
        "id": "7",
        "name": "Беспроводные наушники TWS",
        "description": "Беспроводные наушники с активным шумоподавлением. До 30 часов работы с кейсом, Bluetooth 5.3.",
        "priceOriginal": 8990,
        "priceDiscount": 4990,
        "category": "Электроника",
        "images": [],
        "brand": "JBL",
        "rating": 4.6,
        "reviews": 1567,
        "sizes": [],
        "colors": ["Чёрный", "Белый", "Бежевый"],
        "inStock": True,
        "createdAt": int(datetime.now().timestamp() * 1000)
    },
    {
        "id": "8",
        "name": "Платье летнее миди",
        "description": "Лёгкое летнее платье длины миди. Натуральная вискоза, V-образный вырез, расклешённая юбка.",
        "priceOriginal": 3990,
        "priceDiscount": 1990,
        "category": "Одежда",
        "images": [],
        "brand": "Mango",
        "rating": 4.5,
        "reviews": 432,
        "sizes": ["XS", "S", "M", "L"],
        "colors": ["Цветочный принт", "Однотонный зелёный", "Однотонный розовый"],
        "inStock": True,
        "createdAt": int(datetime.now().timestamp() * 1000)
    }
]


def load_json(filepath, default=None):
    """Load JSON data from file"""
    if default is None:
        default = []
    try:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
    except (json.JSONDecodeError, IOError):
        pass
    return default


def save_json(filepath, data):
    """Save data to JSON file"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_products():
    """Get all products"""
    products = load_json(PRODUCTS_FILE)
    if not products:
        save_json(PRODUCTS_FILE, DEFAULT_PRODUCTS)
        return DEFAULT_PRODUCTS
    return products


def save_products(products):
    """Save all products"""
    save_json(PRODUCTS_FILE, products)


def get_orders():
    """Get all orders"""
    return load_json(ORDERS_FILE, [])


def save_orders(orders):
    """Save all orders"""
    save_json(ORDERS_FILE, orders)


def generate_id():
    """Generate unique ID"""
    return uuid.uuid4().hex[:12]


def generate_pickup_code():
    """Generate 6-digit pickup code"""
    return ''.join(random.choices(string.digits, k=6))


# ============ API ROUTES ============

@app.route('/')
def serve_index():
    """Serve the main HTML file"""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


# --- Products API ---

@app.route('/api/products', methods=['GET'])
def api_get_products():
    """Get all products"""
    products = get_products()
    return jsonify(products)


@app.route('/api/products', methods=['POST'])
def api_create_product():
    """Create a new product"""
    data = request.json
    product = {
        "id": generate_id(),
        "name": data.get("name", ""),
        "description": data.get("description", ""),
        "priceOriginal": data.get("priceOriginal", 0),
        "priceDiscount": data.get("priceDiscount", 0),
        "category": data.get("category", "Другое"),
        "images": data.get("images", []),
        "brand": data.get("brand", ""),
        "rating": data.get("rating", 4.5),
        "reviews": data.get("reviews", 0),
        "sizes": data.get("sizes", []),
        "colors": data.get("colors", []),
        "inStock": True,
        "createdAt": int(datetime.now().timestamp() * 1000)
    }
    products = get_products()
    products.append(product)
    save_products(products)
    return jsonify(product), 201


@app.route('/api/products/<product_id>', methods=['PUT'])
def api_update_product(product_id):
    """Update a product"""
    data = request.json
    products = get_products()
    for i, p in enumerate(products):
        if p["id"] == product_id:
            products[i].update(data)
            save_products(products)
            return jsonify(products[i])
    return jsonify({"error": "Product not found"}), 404


@app.route('/api/products/<product_id>', methods=['DELETE'])
def api_delete_product(product_id):
    """Delete a product"""
    products = get_products()
    products = [p for p in products if p["id"] != product_id]
    save_products(products)
    return jsonify({"success": True})


# --- Orders API ---

@app.route('/api/orders', methods=['GET'])
def api_get_orders():
    """Get all orders"""
    orders = get_orders()
    return jsonify(orders)


@app.route('/api/orders', methods=['POST'])
def api_create_order():
    """Create a new order"""
    data = request.json
    order = {
        "id": generate_id(),
        "items": data.get("items", []),
        "status": "new",
        "total": data.get("total", 0),
        "createdAt": int(datetime.now().timestamp() * 1000),
        "customerName": data.get("customerName", ""),
        "customerPhone": data.get("customerPhone", ""),
        "pickupCode": generate_pickup_code()
    }
    orders = get_orders()
    orders.append(order)
    save_orders(orders)
    return jsonify(order), 201


@app.route('/api/orders/<order_id>/status', methods=['PUT'])
def api_update_order_status(order_id):
    """Update order status"""
    data = request.json
    orders = get_orders()
    for i, o in enumerate(orders):
        if o["id"] == order_id:
            orders[i]["status"] = data.get("status", orders[i]["status"])
            save_orders(orders)
            return jsonify(orders[i])
    return jsonify({"error": "Order not found"}), 404


# --- Upload API ---

@app.route('/api/upload', methods=['POST'])
def api_upload():
    """Upload image files"""
    if 'files' not in request.files:
        return jsonify({"error": "No files provided"}), 400
    
    files = request.files.getlist('files')
    urls = []
    
    for file in files:
        if file.filename:
            # Generate unique filename
            ext = os.path.splitext(file.filename)[1]
            filename = f"{generate_id()}{ext}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            file.save(filepath)
            urls.append(f"/api/uploads/{filename}")
    
    return jsonify({"urls": urls})


@app.route('/api/uploads/<filename>')
def serve_upload(filename):
    """Serve uploaded files"""
    return send_from_directory(UPLOAD_DIR, filename)


# --- Cart API (per device) ---

@app.route('/api/cart/<device_id>', methods=['GET'])
def api_get_cart(device_id):
    """Get cart for a device"""
    cart_file = os.path.join(DATA_DIR, f'cart_{device_id}.json')
    cart = load_json(cart_file, [])
    return jsonify(cart)


@app.route('/api/cart/<device_id>', methods=['POST'])
def api_save_cart(device_id):
    """Save cart for a device"""
    data = request.json
    cart_file = os.path.join(DATA_DIR, f'cart_{device_id}.json')
    save_json(cart_file, data)
    return jsonify({"success": True})


@app.route('/api/cart/<device_id>', methods=['DELETE'])
def api_clear_cart(device_id):
    """Clear cart for a device"""
    cart_file = os.path.join(DATA_DIR, f'cart_{device_id}.json')
    if os.path.exists(cart_file):
        os.remove(cart_file)
    return jsonify({"success": True})


# ============ SERVER INFO ============

def get_local_ip():
    """Get local IP address"""
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


if __name__ == '__main__':
    local_ip = get_local_ip()
    port = 5000
    
    print("=" * 60)
    print("  🛒 Wildberries - Пункт выдачи заказов")
    print("=" * 60)
    print(f"\n  📱 Мобильная версия (покупки):")
    print(f"     http://{local_ip}:{port}")
    print(f"\n  🖥️  Десктопная версия (ПВЗ):")
    print(f"     http://{local_ip}:{port}")
    print(f"\n  💻 Локально:")
    print(f"     http://localhost:{port}")
    print(f"\n  ⚙️  Панель управления товарами:")
    print(f"     Нажмите F6 в браузере")
    print(f"\n  📂 Данные хранятся в папке: {DATA_DIR}/")
    print(f"  📸 Загрузки в: {UPLOAD_DIR}/")
    print("=" * 60)
    print(f"\n  Запущен на {local_ip}:{port}")
    print("  Нажмите Ctrl+C для остановки\n")
    
    app.run(host='0.0.0.0', port=port, debug=False)
