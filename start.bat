@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Wildberries - Запуск сервера
echo ========================================
echo.

echo Сборка фронтенда...
call npm run build
if %errorlevel% neq 0 (
    echo Ошибка сборки фронтенда!
    pause
    exit /b 1
)

echo.
echo Запуск сервера...
echo.
python server.py

pause
