@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Wildberries - Установка зависимостей
echo ========================================
echo.

echo [1/2] Установка Python зависимостей...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Ошибка установки Python зависимостей!
    pause
    exit /b 1
)

echo.
echo [2/2] Установка Node.js зависимостей...
call npm install
if %errorlevel% neq 0 (
    echo Ошибка установки Node.js зависимостей!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Установка завершена!
echo ========================================
echo.
echo Теперь запустите start.bat
echo.
pause
