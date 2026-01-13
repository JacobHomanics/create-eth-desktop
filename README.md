# Create ETH Desktop

A desktop application for creating Scaffold-ETH 2 projects with a user-friendly GUI. Built with Electron, React, and TypeScript.

## Features

- 🚀 **Easy Project Creation** - Create new Scaffold-ETH 2 projects with a simple interface
- 🎯 **Framework Selection** - Choose between Hardhat or Foundry
- 🔌 **Extension Support** - Select from a curated list of extensions or use third-party extensions
- 📦 **Version Control** - Select specific versions of create-eth (defaults to latest)
- 📁 **Project Management** - View and manage all your created projects
- 🔧 **IDE Integration** - Open projects directly in Cursor or VS Code
- ✅ **Validation** - Automatic validation to prevent duplicate project names

## Requirements

- **Node.js** >= 20.18.3 (required by create-eth)
- **Yarn** >= 1.0.0 (required by create-eth, recommended >= 2.0.0)
- **Foundry** (if using Foundry framework) - Install from [getfoundry.sh](https://getfoundry.sh)

## Installation

### From Source

1. Clone the repository:

```bash
git clone <repository-url>
cd create-eth-desktop
```

2. Install dependencies:

```bash
npm install
```

3. Build the Electron files:

```bash
npm run electron:build
```

4. Start the development server:

```bash
npm run dev
```

5. In another terminal, start Electron:

```bash
npm run electron:dev
```

## Building for Distribution

Build the application for distribution:

```bash
# Build for current platform
npm run dist

# Build for specific platforms
npm run dist:mac    # macOS
npm run dist:win    # Windows
npm run dist:linux   # Linux
```

Built applications will be in the `dist-electron` directory.

## Usage

### Creating a New Project

1. Click "Create New Project"
2. Choose a destination folder
3. Enter a project name
4. Select a framework (Hardhat or Foundry)
5. (Optional) Select a create-eth version
6. (Optional) Choose an extension
7. Click "Create" and wait for the project to be generated

### Managing Projects

- View all your projects on the main screen
- Click on a project to open it in your preferred IDE (Cursor or VS Code)
- Select your preferred IDE from the dropdown
- Delete projects you no longer need

## Development

### Project Structure

```
create-eth-desktop/
├── electron/          # Electron main process files
│   ├── main.ts       # Main process entry point
│   └── preload.ts    # Preload script for IPC
├── src/              # React application
│   ├── App.tsx       # Main app component
│   ├── ProjectsList.tsx
│   └── CreateProject.tsx
└── dist/             # Built React app (generated)
```

### Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build React app and Electron files
- `npm run electron:build` - Build only Electron TypeScript files
- `npm run electron:dev` - Start Electron in development mode
- `npm run dist` - Build for distribution
- `npm start` - Start Electron (production mode)

## How It Works

The app uses Electron's IPC (Inter-Process Communication) to:

1. **Find Node.js/npx** - Automatically locates Node.js installations (including nvm) to run create-eth
2. **Validate Requirements** - Checks Node.js version and ensures it meets create-eth requirements (>= 20.18.3)
3. **Run create-eth** - Executes `npx create-eth` with your selected options
4. **Stream Output** - Shows real-time output from the create-eth process
5. **Manage Projects** - Stores project metadata locally for easy access

## Code Signing & Notarization (macOS)

To distribute the macOS app without Gatekeeper warnings, you need to:

1. **Get an Apple Developer Certificate**:

   **Step 1: Sign up for Apple Developer Program**

   - Go to [developer.apple.com/programs](https://developer.apple.com/programs/)
   - Sign up for the Apple Developer Program ($99/year)
   - Complete enrollment and wait for approval (usually instant for individuals)

   **Step 2: Create a Developer ID Application Certificate**

   **Option A: Using Xcode (Easiest)**

   1. Open Xcode
   2. Go to **Xcode** → **Settings** (or **Preferences** on older versions)
   3. Click the **Accounts** tab
   4. Click the **+** button and sign in with your Apple ID
   5. Select your Apple ID and click **Manage Certificates...**
   6. Click the **+** button → **Developer ID Application**
   7. Xcode will automatically create and install the certificate in your Keychain

   **Option B: Using Apple Developer Portal**

   1. Go to [developer.apple.com/account](https://developer.apple.com/account)
   2. Sign in with your Apple ID
   3. Click **Certificates, Identifiers & Profiles**
   4. Click **Certificates** → **+** button
   5. Select **Developer ID Application** → **Continue**
   6. Follow the instructions to create a Certificate Signing Request (CSR):
      - Open **Keychain Access** on your Mac
      - Go to **Keychain Access** → **Certificate Assistant** → **Request a Certificate From a Certificate Authority**
      - Enter your email and name, select **Saved to disk**
      - Upload the CSR file on the Apple Developer portal
   7. Download the certificate and double-click to install it in Keychain Access

   **Step 3: Export Certificate as .p12 File**

   1. Open **Keychain Access** on your Mac
   2. Select **login** keychain (left sidebar)
   3. Select **My Certificates** category
   4. Find your **Developer ID Application** certificate (it should show your name/company)
   5. Right-click the certificate → **Export "Developer ID Application: Your Name"**
   6. Choose **Personal Information Exchange (.p12)** format
   7. Save it (remember the location and password you set!)
   8. Enter a password when prompted (remember this - you'll need it for GitHub Secrets)

   **Step 4: Convert .p12 to Base64 for GitHub**

   1. Open Terminal
   2. Navigate to where you saved the .p12 file
   3. Run:
      ```bash
      base64 -i YourCertificate.p12 | pbcopy
      ```
   4. This copies the base64-encoded certificate to your clipboard
   5. Paste it into the `APPLE_CERTIFICATE_BASE64` GitHub secret (it will be a very long string)

   **Step 5: Get Your Apple Team ID**

   1. Go to [developer.apple.com/account](https://developer.apple.com/account)
   2. Sign in
   3. Your Team ID is displayed at the top right (format: `ABC123DEF4`)
   4. Or in Xcode: **Xcode** → **Settings** → **Accounts** → Select your account → Team ID is shown

2. **Set up environment variables** (for local builds):

   ```bash
   export APPLE_TEAM_ID="YOUR_TEAM_ID"
   export APPLE_ID="your@email.com"
   export APPLE_APP_SPECIFIC_PASSWORD="your-app-specific-password"
   ```

3. **For GitHub Actions**, add these secrets:

   **How to add secrets to GitHub:**

   1. Go to your GitHub repository page
   2. Click **Settings** (top menu bar)
   3. In the left sidebar, click **Secrets and variables** → **Actions**
   4. Click **New repository secret** button
   5. Add each secret below (Name = secret name, Secret = the value)

   **Required secrets:**

   - `APPLE_CERTIFICATE_BASE64`: Base64-encoded .p12 certificate
     - Export your certificate from Keychain Access as .p12
     - Convert to base64: `base64 -i certificate.p12 | pbcopy` (macOS) or use an online base64 encoder
   - `APPLE_CERTIFICATE_PASSWORD`: Password you set when exporting the .p12 certificate
   - `APPLE_TEAM_ID`: Your Apple Team ID (found in [Apple Developer portal](https://developer.apple.com/account) or Xcode → Preferences → Accounts)
   - `APPLE_ID`: Your Apple ID email (the one associated with your Apple Developer account)
   - `APPLE_APP_SPECIFIC_PASSWORD`: App-specific password
     - Generate at [appleid.apple.com](https://appleid.apple.com)
     - Sign in → **Sign-In and Security** → **App-Specific Passwords** → **Generate an app-specific password**

4. **Generate app-specific password**:
   - Go to [appleid.apple.com](https://appleid.apple.com)
   - Sign in → App-Specific Passwords → Generate
   - Use this password in `APPLE_APP_SPECIFIC_PASSWORD`

**Note**: Without code signing, users will need to right-click the app and select "Open" the first time, then click "Open" in the security dialog.

## Troubleshooting

### "Create ETH Desktop.app is damaged and can't be opened"

This is a macOS Gatekeeper issue. Solutions:

1. **Right-click and Open**: Right-click the app → "Open" → Click "Open" in the dialog
2. **Remove quarantine attribute** (temporary fix):
   ```bash
   xattr -cr "/Applications/Create ETH Desktop.app"
   ```
3. **Proper fix**: Code sign and notarize the app (see Code Signing section above)

### "npx: command not found"

The app automatically searches for Node.js installations. If you're using nvm, make sure you have Node.js >= 20.18.3 installed:

```bash
nvm install 20.18.3
nvm use 20.18.3
```

### "Foundry not found"

Make sure Foundry is installed and in your PATH. The app will automatically add `~/.foundry/bin` to the PATH, but if Foundry is installed elsewhere, you may need to add it manually.

### "Node.js version is too old"

Create-eth requires Node.js >= 20.18.3. The app will automatically try to find a compatible version if you have multiple Node.js versions installed (via nvm).

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
