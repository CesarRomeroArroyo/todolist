# Comandos básicos — Ionic Angular + Cordova (iOS/Android)

## Prerrequisitos rápidos
- Node LTS 20: `nvm use 20.19.4`
- Ionic CLI (opcional): `npm i -g @ionic/cli`
- Cordova CLI: `npm i -g cordova`
- JDK 17 (Android): exporta
  ```bash
  export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"
  export PATH="$JAVA_HOME/bin:$PATH"
  ```
- Android SDK (si compilas Android):
  ```bash
  export ANDROID_HOME="$HOME/Library/Android/sdk"
  export ANDROID_SDK_ROOT="$ANDROID_HOME"
  export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
  ```

---

## Instalar y correr en web
```bash
npm install
npx ionic serve
```

## Build web (genera /www)
```bash
npx ionic build
```

---

## iOS (Xcode)
### Preparar proyecto iOS
```bash
cordova platform add ios          # una vez
cordova prepare ios               # o: ionic cordova prepare ios --no-build
open platforms/ios/*.xcworkspace  # abre Xcode
```

### Generar .ipa (desde Xcode)
1. En **Signing & Capabilities**: selecciona **Team** y **Automatically manage signing**.
2. Menú **Product → Archive**.
3. En **Organizer → Distribute App**:
   - **App Store Connect (Upload)** para TestFlight/App Store, o
   - **Ad Hoc / Development (Export)** para obtener un **.ipa** local.

### .ipa sin firmar (opcional, para re-firmado externo)
```bash
cd platforms/ios
xcodebuild -workspace MyApp.xcworkspace -scheme MyApp -configuration Release -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO clean build
cd build/Release-iphoneos
mkdir Payload && cp -R MyApp.app Payload/ && zip -yr MyApp-unsigned.ipa Payload && rm -rf Payload
```

---

## Android
### Preparar proyecto Android
```bash
cordova platform add android      # una vez
cordova prepare android           # o: ionic cordova prepare android --no-build
```

### APK debug (rápido)
```bash
cordova build android
# salida: platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### APK release firmado (recomendado)
1) Crear keystore (una vez):
```bash
mkdir -p signing
keytool -genkeypair -v -keystore signing/myapp.keystore -alias myapp -keyalg RSA -keysize 2048 -validity 36500
```
2) `build.json` en la raíz (ejemplo):
```json
{
  "android": {
    "release": {
      "keystore": "signing/myapp.keystore",
      "storePassword": "TU_STORE_PASSWORD",
      "alias": "myapp",
      "password": "TU_KEY_PASSWORD",
      "keystoreType": ""
    }
  }
}
```
3) Build:
```bash
cordova build android --release -- --packageType=apk --buildConfig=build.json
# salida: platforms/android/app/build/outputs/apk/release/app-release.apk
```

### AAB (Play Console)
```bash
cordova build android --release -- --packageType=bundle --buildConfig=build.json
# salida: platforms/android/app/build/outputs/bundle/release/app-release.aab
```

---

## Utilidad
- Limpiar: `cordova clean ios && cordova clean android`
- Reinstalar plataformas:
  ```bash
  cordova platform rm ios android
  cordova platform add ios android
  ```
