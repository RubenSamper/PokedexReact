@echo off
REM ===================================================
REM  Script para generar APK de la Pokédex con Capacitor
REM ===================================================
echo.
echo === 1. Construyendo web app para Capacitor...
set CAPACITOR_BUILD=true
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Fallo al construir la web app
    pause
    exit /b 1
)

echo.
echo === 2. Sincronizando con Capacitor Android...
call npx cap sync
if %errorlevel% neq 0 (
    echo ERROR: Fallo al sincronizar con Capacitor
    pause
    exit /b 1
)

echo.
echo === 3. Generando APK de debug...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Fallo al generar el APK.
    echo Asegurate de tener:
    echo   - JDK 17+ instalado (JAVA_HOME configurado)
    echo   - Android SDK instalado (ANDROID_HOME configurado)
    echo   - Aceptados los licenses de Android
    echo.
    echo Alternativa: Abre el proyecto en Android Studio:
    echo   npx cap open android
    pause
    exit /b 1
)

echo.
echo === APK generado exitosamente ===
echo.
echo Localizacion:
echo   android\app\build\outputs\apk\debug\
echo.
echo Archivo: app-debug.apk
echo.
pause
