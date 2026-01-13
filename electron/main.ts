import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import { spawn, execSync } from "node:child_process";
import fs from "node:fs/promises";
import https from "node:https";
import os from "node:os";

let win: BrowserWindow | null = null;

interface Project {
  id: string;
  name: string;
  path: string;
  framework?: "hardhat" | "foundry";
  extensions?: string[];
  createdAt: number;
}

const getProjectsFilePath = () => {
  return path.join(app.getPath("userData"), "projects.json");
};

async function loadProjects(): Promise<Project[]> {
  try {
    const filePath = getProjectsFilePath();
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveProjects(projects: Project[]): Promise<void> {
  const filePath = getProjectsFilePath();
  await fs.writeFile(filePath, JSON.stringify(projects, null, 2), "utf-8");
}

// Find npx command and node path - needed for packaged apps where npx isn't in PATH
async function findNpxCommand(): Promise<{ npx: string; nodeDir?: string }> {
  const isMac = process.platform === "darwin";
  const isWindows = process.platform === "win32";
  const isLinux = process.platform === "linux";

  // First, try to use npx directly (works in dev, might work if PATH is set)
  try {
    if (isWindows) {
      execSync("where npx", { stdio: "ignore" });
    } else {
      execSync("which npx", { stdio: "ignore" });
    }
    return { npx: "npx" };
  } catch {
    // npx not in PATH, try to find it
  }

  // Try common Node.js installation paths
  const homeDir = os.homedir();
  
  if (isMac) {
    const possiblePaths = [
      "/usr/local/bin/npx",
      "/opt/homebrew/bin/npx",
      `${homeDir}/.nvm/current/bin/npx`,
      "/usr/bin/npx",
    ];
    
    // Check nvm versions directory - prefer versions >= 20.18.3
    try {
      const nvmVersionsDir = path.join(homeDir, ".nvm", "versions", "node");
      const versions = await fs.readdir(nvmVersionsDir);
      // Sort versions and get the latest (newest first)
      versions.sort((a, b) => {
        const aParts = a.replace(/^v/, "").split(".").map(Number);
        const bParts = b.replace(/^v/, "").split(".").map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const diff = (bParts[i] || 0) - (aParts[i] || 0);
          if (diff !== 0) return diff;
        }
        return 0;
      });
      
      // Find the first version that meets the minimum requirement (>= 20.18.3)
      const minVersion = [20, 18, 3];
      for (const version of versions) {
        const versionParts = version.replace(/^v/, "").split(".").map(Number);
        const meetsRequirement = versionParts[0] > minVersion[0] ||
          (versionParts[0] === minVersion[0] && versionParts[1] > minVersion[1]) ||
          (versionParts[0] === minVersion[0] && versionParts[1] === minVersion[1] && versionParts[2] >= minVersion[2]);
        
        if (meetsRequirement) {
          const versionNpx = path.join(nvmVersionsDir, version, "bin", "npx");
          try {
            await fs.access(versionNpx);
            const nodeDir = path.join(nvmVersionsDir, version, "bin");
            possiblePaths.unshift(versionNpx);
            // Return with node directory for PATH
            return { npx: versionNpx, nodeDir };
          } catch {
            // This version doesn't have npx, continue
            continue;
          }
        }
      }
      
      // If no version meets requirement, use the latest available
      if (versions.length > 0) {
        const latestNpx = path.join(nvmVersionsDir, versions[0], "bin", "npx");
        try {
          await fs.access(latestNpx);
          const nodeDir = path.join(nvmVersionsDir, versions[0], "bin");
          possiblePaths.unshift(latestNpx);
          // Return with node directory for PATH
          return { npx: latestNpx, nodeDir };
        } catch {
          // Latest version doesn't have npx, continue
        }
      }
    } catch {
      // nvm not installed or can't read versions
    }
    
    for (const npxPath of possiblePaths) {
      try {
        await fs.access(npxPath);
        const nodeDir = path.dirname(npxPath);
        return { npx: npxPath, nodeDir };
      } catch {
        continue;
      }
    }
  } else if (isWindows) {
    const possiblePaths = [
      "C:\\Program Files\\nodejs\\npx.cmd",
      "C:\\Program Files (x86)\\nodejs\\npx.cmd",
      `${process.env.APPDATA}\\npm\\npx.cmd`,
      `${process.env.LOCALAPPDATA}\\Programs\\nodejs\\npx.cmd`,
    ];
    
    for (const npxPath of possiblePaths) {
      try {
        await fs.access(npxPath);
        const nodeDir = path.dirname(npxPath);
        return { npx: npxPath, nodeDir };
      } catch {
        continue;
      }
    }
  } else {
    // Linux
    const possiblePaths = [
      "/usr/bin/npx",
      "/usr/local/bin/npx",
      `${homeDir}/.nvm/current/bin/npx`,
    ];
    
    // Check nvm versions directory - prefer versions >= 20.18.3
    try {
      const nvmVersionsDir = path.join(homeDir, ".nvm", "versions", "node");
      const versions = await fs.readdir(nvmVersionsDir);
      // Sort versions and get the latest (newest first)
      versions.sort((a, b) => {
        const aParts = a.replace(/^v/, "").split(".").map(Number);
        const bParts = b.replace(/^v/, "").split(".").map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const diff = (bParts[i] || 0) - (aParts[i] || 0);
          if (diff !== 0) return diff;
        }
        return 0;
      });
      
      // Find the first version that meets the minimum requirement (>= 20.18.3)
      const minVersion = [20, 18, 3];
      for (const version of versions) {
        const versionParts = version.replace(/^v/, "").split(".").map(Number);
        const meetsRequirement = versionParts[0] > minVersion[0] ||
          (versionParts[0] === minVersion[0] && versionParts[1] > minVersion[1]) ||
          (versionParts[0] === minVersion[0] && versionParts[1] === minVersion[1] && versionParts[2] >= minVersion[2]);
        
        if (meetsRequirement) {
          const versionNpx = path.join(nvmVersionsDir, version, "bin", "npx");
          try {
            await fs.access(versionNpx);
            const nodeDir = path.join(nvmVersionsDir, version, "bin");
            possiblePaths.unshift(versionNpx);
            // Return with node directory for PATH
            return { npx: versionNpx, nodeDir };
          } catch {
            // This version doesn't have npx, continue
            continue;
          }
        }
      }
      
      // If no version meets requirement, use the latest available
      if (versions.length > 0) {
        const latestNpx = path.join(nvmVersionsDir, versions[0], "bin", "npx");
        try {
          await fs.access(latestNpx);
          const nodeDir = path.join(nvmVersionsDir, versions[0], "bin");
          possiblePaths.unshift(latestNpx);
          // Return with node directory for PATH
          return { npx: latestNpx, nodeDir };
        } catch {
          // Latest version doesn't have npx, continue
        }
      }
    } catch {
      // nvm not installed or can't read versions
    }
    
    for (const npxPath of possiblePaths) {
      try {
        await fs.access(npxPath);
        const nodeDir = path.dirname(npxPath);
        return { npx: npxPath, nodeDir };
      } catch {
        continue;
      }
    }
  }

  // Fallback: try to find node and construct npx path
  try {
    let nodePath: string;
    if (isWindows) {
      nodePath = execSync("where node", { encoding: "utf-8" }).trim().split("\n")[0];
    } else {
      nodePath = execSync("which node", { encoding: "utf-8" }).trim();
    }
    if (nodePath) {
      const nodeDir = path.dirname(nodePath);
      const npxPath = path.join(nodeDir, isWindows ? "npx.cmd" : "npx");
      try {
        await fs.access(npxPath);
        return { npx: npxPath, nodeDir };
      } catch {
        // Node found but npx not in same directory
      }
    }
  } catch {
    // Couldn't find node either
  }

  // Last resort: return "npx" and hope shell can find it
  return { npx: "npx" };
}

function createWindow() {
  win = new BrowserWindow({
    width: 980,
    height: 720,
    title: "Create ETH Desktop",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Vite dev server in dev, local file in prod
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ---- IPC: choose directory ----
ipcMain.handle("pick-directory", async (_evt, defaultPath?: string) => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
    defaultPath: defaultPath,
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// ---- IPC: run create-eth ----
// This is the simple "spawn" version. Great if create-eth supports flags/presets.
// If create-eth is interactive, use node-pty version below.
ipcMain.handle(
  "run-create-eth",
  async (
    _evt,
    args: {
      cwd: string;
      projectName: string;
      options?: {
        framework?: "hardhat" | "foundry";
        extensions?: string[];
        version?: string;
      };
    }
  ) => {
    if (!win) throw new Error("No window");

    const { cwd, projectName, options } = args;

    // Basic input hardening
    if (!projectName || projectName.length > 80)
      throw new Error("Invalid project name");
    if (
      projectName.includes("..") ||
      projectName.includes("/") ||
      projectName.includes("\\")
    ) {
      throw new Error("Project name cannot include path separators");
    }

    // Build command arguments
    const version = options?.version || "latest";
    const createEthPackage = version === "latest" ? "create-eth@latest" : `create-eth@${version}`;
    const npxArgs: string[] = [createEthPackage, projectName];

    // Add solidity framework flag if specified (use -s or --solidity-framework)
    if (options?.framework) {
      npxArgs.push("--solidity-framework", options.framework);
    }

    // Add extension flags if specified (use -e or --extension)
    if (options?.extensions && options.extensions.length > 0) {
      for (const ext of options.extensions) {
        // Validate extension name - allow alphanumeric, hyphens, slashes, and colons (for branch refs like "iPaulPro/scaffold-lens:ext")
        // Also allow dots and underscores which might be in extension names
        if (/^[a-z0-9\-\/.:_]+$/i.test(ext) && ext.length <= 100) {
          npxArgs.push("--extension", ext);
        } else {
          console.warn(`Skipping invalid extension: ${ext}`);
          win?.webContents.send("create-eth:log", `[WARN] Skipping invalid extension: ${ext}\n`);
        }
      }
    }

    // Find npx command (important for packaged apps)
    const { npx: npxCommand, nodeDir } = await findNpxCommand();
    
    // Build environment with node in PATH if we found a node directory
    // Also ensure common tool directories are in PATH (for Foundry, etc.)
    const env = { ...process.env };
    const pathSeparator = process.platform === "win32" ? ";" : ":";
    const additionalPaths: string[] = [];
    
    if (nodeDir) {
      additionalPaths.push(nodeDir);
    }
    
    // Add common Foundry installation paths
    if (process.platform === "darwin") {
      // macOS - Foundry is typically in ~/.foundry/bin
      const foundryPath = path.join(os.homedir(), ".foundry", "bin");
      additionalPaths.push(foundryPath);
      // Also check /usr/local/bin and /opt/homebrew/bin
      additionalPaths.push("/usr/local/bin", "/opt/homebrew/bin");
    } else if (process.platform === "linux") {
      // Linux - Foundry is typically in ~/.foundry/bin
      const foundryPath = path.join(os.homedir(), ".foundry", "bin");
      additionalPaths.push(foundryPath);
      additionalPaths.push("/usr/local/bin", "/usr/bin");
    } else if (process.platform === "win32") {
      // Windows - Foundry might be in various locations
      const foundryPath = path.join(os.homedir(), ".foundry", "bin");
      additionalPaths.push(foundryPath);
    }
    
    // Build the PATH with additional paths first, then original PATH
    if (additionalPaths.length > 0) {
      env.PATH = additionalPaths.join(pathSeparator) + pathSeparator + (process.env.PATH || "");
    } else if (nodeDir) {
      env.PATH = `${nodeDir}${pathSeparator}${process.env.PATH || ""}`;
    }
    
    // Check Node.js version before running
    try {
      const nodePath = nodeDir ? path.join(nodeDir, process.platform === "win32" ? "node.exe" : "node") : "node";
      const nodeVersionOutput = execSync(`"${nodePath}" --version`, { 
        encoding: "utf-8",
        env,
        timeout: 5000,
      }).trim();
      
      const nodeVersion = nodeVersionOutput.replace(/^v/, "");
      const versionParts = nodeVersion.split(".").map(Number);
      const minVersion = [20, 18, 3];
      
      const meetsRequirement = versionParts[0] > minVersion[0] ||
        (versionParts[0] === minVersion[0] && versionParts[1] > minVersion[1]) ||
        (versionParts[0] === minVersion[0] && versionParts[1] === minVersion[1] && versionParts[2] >= minVersion[2]);
      
      if (!meetsRequirement) {
        const errorMsg = `Node.js version ${nodeVersionOutput} is too old. create-eth requires Node.js >= 20.18.3. Please install a newer version of Node.js.`;
        console.error(errorMsg);
        win?.webContents.send("create-eth:log", `\n[ERROR] ${errorMsg}\n`);
        return Promise.reject(new Error(errorMsg));
      }
    } catch (err: any) {
      // If we can't check the version, log a warning but continue
      console.warn("Could not verify Node.js version:", err?.message);
      win?.webContents.send("create-eth:log", `[WARN] Could not verify Node.js version. Continuing...\n`);
    }
    
    // Log the command being run for debugging
    console.log("Running create-eth with args:", npxArgs);
    console.log("Using npx command:", npxCommand);
    console.log("Node directory:", nodeDir);
    win?.webContents.send("create-eth:log", `Running: ${npxCommand} ${npxArgs.join(" ")}\n`);

    return await new Promise<{ ok: true }>((resolve, reject) => {
      const child = spawn(npxCommand, npxArgs, {
        cwd,
        shell: true, // helps on Windows
        env,
      });

      child.stdout.on("data", (buf) =>
        win?.webContents.send("create-eth:log", buf.toString())
      );
      child.stderr.on("data", (buf) =>
        win?.webContents.send("create-eth:log", buf.toString())
      );

      child.on("error", (err) => {
        const errorMsg = `Failed to start create-eth: ${err.message}`;
        console.error(errorMsg, err);
        win?.webContents.send("create-eth:log", `\n[ERROR] ${errorMsg}\n`);
        reject(err);
      });
      child.on("close", async (code) => {
        win?.webContents.send("create-eth:exit", code);
        if (code === 0) {
          // Save project to list
          const projects = await loadProjects();
          const project: Project = {
            id: `${Date.now()}-${projectName}`,
            name: projectName,
            path: path.join(cwd, projectName),
            framework: options?.framework,
            extensions: options?.extensions,
            createdAt: Date.now(),
          };
          projects.push(project);
          await saveProjects(projects);
          resolve({ ok: true });
        } else {
          const errorMsg = `create-eth exited with code ${code}`;
          console.error(errorMsg);
          win?.webContents.send("create-eth:log", `\n[ERROR] ${errorMsg}\n`);
          reject(new Error(errorMsg));
        }
      });
    });
  }
);

// ---- IPC: get projects list ----
ipcMain.handle("get-projects", async () => {
  return await loadProjects();
});

// ---- IPC: get create-eth versions from npm ----
ipcMain.handle("get-create-eth-versions", async () => {
  return new Promise<{ versions: string[]; tags: Record<string, string> }>((resolve, reject) => {
    const url = "https://registry.npmjs.org/create-eth";
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const packageData = JSON.parse(data);
            const versions = Object.keys(packageData.versions || {}).sort((a, b) => {
              // Sort versions in descending order (newest first)
              const partsA = a.split(".").map(Number);
              const partsB = b.split(".").map(Number);
              for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
                const partA = partsA[i] || 0;
                const partB = partsB[i] || 0;
                if (partB !== partA) {
                  return partB - partA;
                }
              }
              return 0;
            });
            const tags = packageData["dist-tags"] || {};
            resolve({ versions, tags });
          } catch (err) {
            console.error("Error parsing npm registry response:", err);
            reject(err);
          }
        });
      })
      .on("error", (err) => {
        console.error("Error fetching npm registry:", err);
        reject(err);
      });
  });
});

// ---- IPC: delete project ----
ipcMain.handle("delete-project", async (_evt, projectId: string) => {
  const projects = await loadProjects();
  const filtered = projects.filter((p) => p.id !== projectId);
  await saveProjects(filtered);
  return { ok: true };
});

// ---- IPC: open project in IDE ----
ipcMain.handle("open-in-ide", async (_evt, args: { projectPath: string; ide: "cursor" | "vscode" }) => {
  const { projectPath, ide } = args;
  try {
    // Check if path exists
    try {
      await fs.access(projectPath);
    } catch {
      return { ok: false, error: "Project path does not exist" };
    }

    const isMac = process.platform === "darwin";
    const isWindows = process.platform === "win32";
    
    if (ide === "cursor") {
      // Try to open with cursor command
      if (isMac) {
        const possiblePaths = [
          "/Applications/Cursor.app/Contents/MacOS/Cursor",
          "/usr/local/bin/cursor",
          "cursor", // Try PATH
        ];
        
        for (const cursorPath of possiblePaths) {
          try {
            if (cursorPath === "cursor") {
              spawn(cursorPath, [projectPath], { detached: true });
              return { ok: true };
            } else {
              await fs.access(cursorPath);
              spawn(cursorPath, [projectPath], { detached: true });
              return { ok: true };
            }
          } catch {
            continue;
          }
        }
      } else if (isWindows) {
        const possiblePaths = [
          "C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\cursor\\Cursor.exe",
          "cursor", // Try PATH
        ];
        
        for (const cursorPath of possiblePaths) {
          try {
            if (cursorPath.includes("%")) {
              const expandedPath = cursorPath.replace("%USERNAME%", process.env.USERNAME || "");
              await fs.access(expandedPath);
              spawn(expandedPath, [projectPath], { detached: true, shell: true });
              return { ok: true };
            } else {
              spawn(cursorPath, [projectPath], { detached: true, shell: true });
              return { ok: true };
            }
          } catch {
            continue;
          }
        }
      } else {
        // Linux
        spawn("cursor", [projectPath], { detached: true, shell: true });
        return { ok: true };
      }
      
      return { ok: false, error: "Could not find Cursor application" };
    } else if (ide === "vscode") {
      // Try to open with VS Code
      if (isMac) {
        const possiblePaths = [
          "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code",
          "/usr/local/bin/code",
          "code", // Try PATH
        ];
        
        for (const codePath of possiblePaths) {
          try {
            if (codePath === "code") {
              spawn(codePath, [projectPath], { detached: true });
              return { ok: true };
            } else {
              await fs.access(codePath);
              spawn(codePath, [projectPath], { detached: true });
              return { ok: true };
            }
          } catch {
            continue;
          }
        }
      } else if (isWindows) {
        const possiblePaths = [
          "C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe",
          "code", // Try PATH
        ];
        
        for (const codePath of possiblePaths) {
          try {
            if (codePath.includes("%")) {
              const expandedPath = codePath.replace("%USERNAME%", process.env.USERNAME || "");
              await fs.access(expandedPath);
              spawn(expandedPath, [projectPath], { detached: true, shell: true });
              return { ok: true };
            } else {
              spawn(codePath, [projectPath], { detached: true, shell: true });
              return { ok: true };
            }
          } catch {
            continue;
          }
        }
      } else {
        // Linux
        spawn("code", [projectPath], { detached: true, shell: true });
        return { ok: true };
      }
      
      return { ok: false, error: "Could not find VS Code application" };
    }
    
    return { ok: false, error: "Invalid IDE specified" };
  } catch (err: any) {
    return { ok: false, error: err?.message || `Failed to open in ${ide === "cursor" ? "Cursor" : "VS Code"}` };
  }
});

// ---- IPC: validate project name ----
ipcMain.handle("validate-project-name", async (_evt, args: { cwd: string; projectName: string }) => {
  const { cwd, projectName } = args;
  
  // Only check if directory already exists
  if (!cwd || !projectName) {
    return { valid: true, error: null };
  }
  
  try {
    const projectPath = path.join(cwd, projectName);
    const stats = await fs.stat(projectPath);
    if (stats.isDirectory()) {
      return { valid: false, error: "A directory with this name already exists" };
    }
    // If it exists but is not a directory (e.g., a file), that's also invalid
    return { valid: false, error: "A file or directory with this name already exists" };
  } catch (err: any) {
    // Directory doesn't exist, which is good
    if (err.code === "ENOENT") {
      return { valid: true, error: null };
    }
    // Some other error occurred
    console.error("Error checking directory:", err);
    return { valid: false, error: "Unable to check directory" };
  }
});
