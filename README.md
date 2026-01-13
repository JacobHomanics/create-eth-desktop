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

## Troubleshooting

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

