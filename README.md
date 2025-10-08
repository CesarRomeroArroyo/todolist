# todolist — Ejecutar en Android e iOS (Ionic 7 + Capacitor 7)

Guía clara para compilar y correr la app en **Android** (dispositivo/emulador) e **iOS** (simulador/dispositivo). 

---

## 1) Requisitos

- **Node.js 18+** (LTS recomendado)
- **npm 9+** o **pnpm/yarn**
- **Ionic CLI 7+**
  ```bash
  npm i -g @ionic/cli
  ```
- **Capacitor 7** (ya incluido en el proyecto)

### Android
- **Android Studio** (SDK Platform **Android 14 / API 34** y **Build-Tools**)
- **JDK 17** (Gradle debe usarlo)
- **ADB** en el PATH (`adb devices` debe listar el teléfono)
- Depuración USB activa en tu dispositivo

### iOS (solo macOS)
- **Xcode 15+**
- **CocoaPods**
  ```bash
  sudo gem install cocoapods
  ```
- Cuenta de **Apple Developer** para correr en dispositivo físico

---

## 2) Scripts disponibles (desde `package.json`)

```json
{
  "start": "ionic serve",
  "build": "ionic build",
  "sync": "npx cap sync",
  "android": "npx cap open android",
  "ios": "npx cap open ios"
}
```

- **start** → desarrollo web (Ionic dev server)
- **build** → compila `www/` para Capacitor
- **sync** → `npx cap sync` (sincroniza web → nativo)
- **android** → abre el proyecto nativo en Android Studio
- **ios** → abre el proyecto nativo en Xcode

---

## 3) Instalación del proyecto

```bash
# Clonar
git clone https://github.com/CesarRomeroArroyo/todolist.git
cd todolist

# Instalar dependencias
npm install

```

---

## 4) Preparar plataformas nativas (una sola vez)

```bash
# Añadir plataformas (si aún no existen)
npx cap add android
npx cap add ios

# Compilar la web y sincronizar con nativo
npm run build
npx cap sync
```

> Cada vez que agregues/quites **plugins nativos** o cambies `capacitor.config.ts`, vuelve a ejecutar `npm run build && npx cap sync`.

---

## 5) Ejecutar en **Android**

### A) Emulador (AVD)
1. Abre **Android Studio** → **Device Manager** → crea un AVD (p.ej. Pixel / Android 14).
2. Compila y sincroniza:
   ```bash
   npm run build
   npx cap sync android
   ```
3. Abre el proyecto nativo y ejecuta:
   ```bash
   npm run android
   ```

**Live Reload (emulador/dispositivo)**
```bash
ionic cap run android -l --external
# --external expone la IP en LAN para recarga en caliente
```

### B) Dispositivo físico
1. Activa **Depuración USB** y conecta el dispositivo.
   ```bash
   adb devices  # debe aparecer como 'device'
   ```
2. Construye y sincroniza:
   ```bash
   npm run build
   npx cap sync android
   ```
3. Ejecuta con recarga en vivo (opcional) o desde Android Studio:
   ```bash
   ionic cap run android --device -l --external
   # o
   npm run android
   ```

**Si falla la compilación (Android):**
- Verifica que **Gradle usa JDK 17** (Android Studio → Settings → Build → Gradle → *Gradle JDK*).
- Acepta licencias del SDK:
  ```bash
  yes | "$ANDROID_HOME/tools/bin/sdkmanager" --licenses
  ```

---

## 6) Ejecutar en **iOS** (macOS)

### A) Simulador de iOS
```bash
# Compila + sincroniza
npm run build
npx cap sync ios

# Instala pods (primera vez o tras agregar plugins)
cd ios/App
pod install
cd ../..

# Abrir el workspace en Xcode y ejecutar en un simulador
npm run ios
```

### B) Dispositivo físico
1. Conecta el iPhone por USB.
2. Abre `ios/App/App.xcworkspace` en **Xcode**.
3. En **Signing & Capabilities**:
   - Selecciona tu **Team**.
   - Permite que Xcode gestione el **provisioning**.
4. En el iPhone (iOS 16+), activa **Developer Mode** si se solicita.
5. Selecciona tu dispositivo en Xcode y pulsa **Run**.

**Live Reload (LAN)**
```bash
ionic cap run ios -l --external
# Si no arranca el dev server automáticamente:
ionic serve --external
# Luego abre y corre el proyecto iOS (la app cargará la URL del dev server)
```

---

## 7) Flujo de desarrollo recomendado

```bash
# Desarrollo web rápido
npm run start

# Probar en nativo con recarga (Android/iOS)
ionic cap run android -l --external
ionic cap run ios -l --external

# Cuando cambies plugins nativos o la config de Capacitor
npm run build && npx cap sync

# Abrir IDEs nativos
npm run android
npm run ios
```

---

## 8) Builds de producción

### Android (APK/AAB firmado)
1. Genera un **keystore** (una vez):
   ```bash
   keytool -genkey -v -keystore app-release.keystore -alias app -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Mueve `app-release.keystore` a `android/app/` y configura `~/.gradle/gradle.properties`:
   ```
   MYAPP_UPLOAD_STORE_FILE=app-release.keystore
   MYAPP_UPLOAD_KEY_ALIAS=app
   MYAPP_UPLOAD_STORE_PASSWORD=<password>
   MYAPP_UPLOAD_KEY_PASSWORD=<password>
   ```
3. En `android/app/build.gradle`, usa las variables anteriores en `signingConfigs`.
4. Construye:
   ```bash
   npm run build
   npx cap copy android
   cd android
   ./gradlew bundleRelease   # AAB (Play Store)
   ./gradlew assembleRelease # APK
   ```

### iOS (Archive/TestFlight/App Store)
```bash
npm run build
npx cap copy ios
cd ios/App
pod install
open App.xcworkspace
# Xcode: Product → Archive → Distribute
```

---
