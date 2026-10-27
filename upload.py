"""
Одна команда — и у тебя будет ссылка!
Запуск: python upload.py
"""
import zipfile
import os
import urllib.request
import json

# Все файлы проекта
FILES = [
    'server.py', 'requirements.txt', 'package.json', 'package-lock.json',
    'index.html', 'tsconfig.json', 'vite.config.js', 'README.md', 'INSTALL.md',
    '.gitignore', 'install.bat', 'install.sh', 'start.bat', 'start.sh',
    'src/App.tsx', 'src/index.css', 'src/main.tsx', 'src/store.ts', 'src/types.ts',
]

print("📦 Шаг 1: Создаю ZIP-архив...")

with zipfile.ZipFile('wildberries.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in FILES:
        if os.path.exists(f):
            zf.write(f, f'wildberries/{f}')
            print(f"  ✅ {f}")

size = os.path.getsize('wildberries.zip') / 1024
print(f"\n✅ Архив создан: wildberries.zip ({size:.1f} KB)")
print()
print("📤 Шаг 2: Загружаю на x0.at...")
print()

# Загрузка на x0.at
try:
    # Читаем файл
    with open('wildberries.zip', 'rb') as f:
        file_data = f.read()
    
    # Формируем multipart/form-data
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    
    body = []
    body.append(f'--{boundary}'.encode())
    body.append(b'Content-Disposition: form-data; name="file"; filename="wildberries.zip"')
    body.append(b'Content-Type: application/zip')
    body.append(b'')
    body.append(file_data)
    body.append(f'--{boundary}--'.encode())
    body.append(b'')
    
    body_bytes = b'\r\n'.join(body)
    
    req = urllib.request.Request(
        'https://x0.at/',
        data=body_bytes,
        headers={
            'Content-Type': f'multipart/form-data; boundary={boundary}',
        },
        method='POST'
    )
    
    with urllib.request.urlopen(req, timeout=30) as response:
        result = response.read().decode('utf-8')
        
        # Ищем ссылку в ответе
        lines = result.strip().split('\n')
        url = None
        for line in lines:
            line = line.strip()
            if line.startswith('http'):
                url = line
                break
        
        if url:
            print("=" * 50)
            print("🎉 ГОТОВО! Вот твоя ссылка:")
            print()
            print(f"  {url}")
            print()
            print("=" * 50)
        else:
            print("Ответ сервера:")
            print(result[:500])
            print()
            print("⚠️ Не удалось получить ссылку. Попробуй загрузить вручную:")
            print("   1. Открой https://x0.at")
            print("   2. Загрузи файл wildberries.zip")
            
except Exception as e:
    print(f"❌ Ошибка загрузки: {e}")
    print()
    print("⚠️ Загрузи файл вручную:")
    print("   1. Открой https://x0.at в браузере")
    print("   2. Загрузи файл wildberries.zip")
    print()
    print(f"📁 Файл создан: {os.path.abspath('wildberries.zip')}")
