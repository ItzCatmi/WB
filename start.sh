#!/bin/bash

echo ""
echo "========================================"
echo "  Wildberries - Запуск сервера"
echo "========================================"
echo ""

echo "Сборка фронтенда..."
npm run build
if [ $? -ne 0 ]; then
    echo "Ошибка сборки фронтенда!"
    exit 1
fi

echo ""
echo "Запуск сервера..."
echo ""
python3 server.py
