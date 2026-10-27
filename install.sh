#!/bin/bash

echo ""
echo "========================================"
echo "  Wildberries - Установка зависимостей"
echo "========================================"
echo ""

echo "[1/2] Установка Python зависимостей..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Ошибка установки Python зависимостей!"
    exit 1
fi

echo ""
echo "[2/2] Установка Node.js зависимостей..."
npm install
if [ $? -ne 0 ]; then
    echo "Ошибка установки Node.js зависимостей!"
    exit 1
fi

echo ""
echo "========================================"
echo "  Установка завершена!"
echo "========================================"
echo ""
echo "Теперь запустите ./start.sh"
echo ""
