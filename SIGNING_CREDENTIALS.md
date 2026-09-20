# Official Release APK Signing Credentials & Configuration

The Android project is pre-configured at the system level with an official Release Signing Keystore and automated signature anti-tamper verification.

---

### Keystore Details

| Parameter | Value |
| :--- | :--- |
| **Keystore Path** | `android/app/release.keystore` & `android/release.keystore` |
| **Keystore Format** | PKCS#12 (Java & Android Standard) |
| **Store Password** | `MusicPlayerPass2026!` |
| **Key Alias** | `freemusicplayer` |
| **Key Password** | `MusicPlayerPass2026!` |
| **Validity** | 10,000 Days (~27 Years) |
| **Certificate Issuer** | `CN=FreeMusicPlayer, OU=Mobile, O=FreeMusicPlayer, C=IN` |

---

### Official Certificate Fingerprint (SHA-256)

```
B1:E1:4E:A2:FB:49:AB:F5:CA:F5:23:F3:5F:8C:E9:C7:D8:6F:00:83:84:8B:82:E0:4E:90:1C:E7:E5:94:CA:83
```

- **Hex without colons**:
  ```
  B1E14EA2FB49ABF5CAF523F35F8CE9C7D86F0083848B82E04E901CE7E594CA83
  ```

---

### System-Level Configuration

1. **`android/gradle.properties`**:
   Automatically provides signing properties directly to Gradle so running `./gradlew assembleRelease` automatically outputs a signed APK:
   ```properties
   RELEASE_STORE_FILE=release.keystore
   RELEASE_STORE_PASSWORD=MusicPlayerPass2026!
   RELEASE_KEY_ALIAS=freemusicplayer
   RELEASE_KEY_PASSWORD=MusicPlayerPass2026!
   ```

2. **`android/app/build.gradle`**:
   Configured to bind `signingConfigs.release` directly to `buildTypes.release` whenever `release.keystore` is found.

3. **`android/app/src/main/java/com/freemusicplayer/app/security/SecurityGuard.java`**:
   Configured with the exact certificate fingerprint:
   ```java
   private static final String[] AUTHORIZED_SIGNATURES_SHA256 = {
       "B1:E1:4E:A2:FB:49:AB:F5:CA:F5:23:F3:5F:8C:E9:C7:D8:6F:00:83:84:8B:82:E0:4E:90:1C:E7:E5:94:CA:83"
   };
   ```
   If anyone decompiles, alters, and signs the APK with any other key, `SecurityGuard.verifyIntegrityOrTerminate()` will immediately terminate the application process (`Process.killProcess()`).

---

### Command to Build Signed Release APK

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```
The output signed APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`
