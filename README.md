# 🤖 BHAPUMA - Nepali AI Voice Assistant

**BHAPUMA** is an advanced autonomous Nepali AI voice assistant powered by Gemini with full device automation (Flashlight, Wi-Fi/Bluetooth launcher, Call/SMS dialer, WhatsApp messenger, Camera scanner), real-time Nepali Bikram Sambat date & time, wake-word activation ("भपुम", "भरत", "ह्याकर", "कम्प्युटर"), and an interactive cyberpunk holographic interface.

---

## 🚀 Quick Setup & Automated APK Build (GitHub Actions)

This repository includes a pre-configured **GitHub Actions CI/CD Workflow** (`.github/workflows/build-apk.yml`) that automatically builds a ready-to-install Android APK (`.apk`) every time you push code or run the workflow manually.

### 📱 How to Push/Upload from Mobile or PC

#### Method 1: Push Directly via AI Studio (Easiest)
1. In the AI Studio editor, tap the **Share / Export (⚙️)** menu in the top right.
2. Select **"Push to GitHub"** or **"Export to GitHub Repository"**.
3. Choose or connect your GitHub repository (`bhapuma/BHAPUMA`).
4. Once pushed, GitHub Actions automatically starts building the APK.

#### Method 2: Upload via ZIP on Phone / Browser
1. In AI Studio, tap **Export** ➡️ **Download ZIP**.
2. Open your GitHub repository on your phone browser: `https://github.com/<your-username>/<repo-name>`.
3. Tap **Add file** ➡️ **Upload files**.
4. Drag and upload all project files.
5. Tap **Commit changes**.

---

## ⚙️ Enable GitHub Release Permissions (Required 1-Time Setup)

To allow GitHub Actions to publish the APK directly to the **Releases** tab:
1. Open your repository on GitHub.
2. Go to **Settings** (⚙️) ➡️ **Actions** ➡️ **General**.
3. Scroll down to **Workflow permissions**.
4. Select **◉ Read and write permissions**.
5. Tap **Save**.

---

## 📥 How to Download the Generated APK

### From GitHub Releases:
1. Open your repository page on GitHub.
2. Under the **Releases** section on the right (or scroll down on mobile), tap the latest release: `Android APK Build (v1.0.X)`.
3. Under **Assets**, tap **`BHAPUMA-AI-Assistant-v1.0.X.apk`** to download it directly to your phone.
4. Open the downloaded APK on your Android device and tap **Install** (allow unknown sources if prompted).

### From GitHub Actions Artifacts:
1. Go to the **Actions** tab on your repository.
2. Click on the latest workflow run: **"Build & Release Android APK"**.
3. Scroll down to the **Artifacts** section at the bottom.
4. Tap **`BHAPUMA-Android-APK`** to download the zip containing the debug APK.

---

## 🔑 GitHub Secrets & Environment Variables

| Secret Name | Purpose | Required for APK Build? |
| :--- | :--- | :--- |
| `GITHUB_TOKEN` | Automatic GitHub token provided by GitHub Actions for creating Releases | **Automatic** (No setup needed) |
| `GEMINI_API_KEY` | Optional: Used when hosting the standalone web/backend API server | Optional for web hosting |

> ℹ️ *Note: No private keystore or secret tokens are required to build the APK. The workflow automatically generates a debug signing key inside the build environment.*

---

## 💻 Local Build Instructions (Using Gradle)

If building on a local machine with Java 17 and Android SDK installed:

```bash
# 1. Install dependencies
npm install

# 2. Build web assets
npm run build

# 3. Sync Android platform
npx cap sync android

# 4. Build Debug APK
cd android
./gradlew :app:assembleDebug

# 5. The output APK will be located at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🛡️ License & Credits
- **Architect & Creator:** Avyan Acharya (Bharat Pun Magar)
- **Engine:** Gemini 3.7 Flash & Capacitor Native Android
