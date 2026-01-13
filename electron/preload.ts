import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  pickDirectory: (defaultPath?: string) =>
    ipcRenderer.invoke("pick-directory", defaultPath),
  runCreateEth: (
    cwd: string,
    projectName: string,
    options?: {
      framework?: "hardhat" | "foundry";
      extensions?: string[];
    }
  ) => ipcRenderer.invoke("run-create-eth", { cwd, projectName, options }),

  onLog: (cb: (line: string) => void) => {
    const listener = (_: unknown, line: string) => cb(line);
    ipcRenderer.on("create-eth:log", listener);
    return () => ipcRenderer.removeListener("create-eth:log", listener);
  },

  onExit: (cb: (code: number) => void) => {
    const listener = (_: unknown, code: number) => cb(code);
    ipcRenderer.on("create-eth:exit", listener);
    return () => ipcRenderer.removeListener("create-eth:exit", listener);
  },

  getProjects: () => ipcRenderer.invoke("get-projects"),
  deleteProject: (projectId: string) =>
    ipcRenderer.invoke("delete-project", projectId),
  validateProjectName: (cwd: string, projectName: string) =>
    ipcRenderer.invoke("validate-project-name", { cwd, projectName }),
  openInIDE: (projectPath: string, ide: "cursor" | "vscode") =>
    ipcRenderer.invoke("open-in-ide", { projectPath, ide }),
  getCreateEthVersions: () => ipcRenderer.invoke("get-create-eth-versions"),
});
