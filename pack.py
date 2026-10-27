"""
Скрипт для создания ZIP-архива проекта Wildberries
Запуск: python pack.py
"""
import zipfile
import os

# Файлы которые нужно включить в архив
FILES_TO_INCLUDE = [
    # Основные файлы
    'server.py',
    'requirements.txt',
    'package.json',
    'package-lock.json',
    'index.html',
    'tsconfig.json',
    'vite.config.js',
    'README.md',
    'INSTALL.md',
    '.gitignore',
    
    # Скрипты запуска
    'install.bat',
    'install.sh',
    'start.bat',
    'start.sh',
    
    # Исходный код фронтенда
    'src/App.tsx',
    'src/index.css',
    'src/main.tsx',
    'src/store.ts',
    'src/types.ts',
]

OUTPUT_ZIP = 'wildberries.zip'

def create_zip():
    print("📦 Создание архива wildberries.zip...")
    print()
    
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
        added = 0
        for filepath in FILES_TO_INCLUDE:
            if os.path.exists(filepath):
                # Сохраняем с путём внутри архива
                arcname = os.path.join('wildberries', filepath)
                zipf.write(filepath, arcname)
                print(f"  ✅ {filepath}")
                added += 1
            else:
                print(f"  ⚠️  Пропущен: {filepath}")
    
    # Размер файла
    size = os.path.getsize(OUTPUT_ZIP)
    size_kb = size / 1024
    
    print()
    print("=" * 50)
    print(f"✅ Архив создан: {OUTPUT_ZIP}")
    print(f"📊 Размер: {size_kb:.1f} KB")
    print(f"📁 Файлов: {added}")
    print("=" * 50)
    print()
    print("📋 Инструкция по использованию:")
    print("  1. Распакуйте wildberries.zip")
    print("  2. Откройте папку wildberries")
    print("  3. Windows: запустите install.bat, потом start.bat")
    print("  4. Linux/Mac: chmod +x *.sh && ./install.sh && ./start.sh")
    print()
    print("🌐 После запуска откройте в браузере адрес из консоли")
    print()

if __name__ == '__main__':
    create_zip()
