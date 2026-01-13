"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("api", {
    pickDirectory: (defaultPath) => electron_1.ipcRenderer.invoke("pick-directory", defaultPath),
    runCreateEth: (cwd, projectName, options) => electron_1.ipcRenderer.invoke("run-create-eth", { cwd, projectName, options }),
    onLog: (cb) => {
        const listener = (_, line) => cb(line);
        electron_1.ipcRenderer.on("create-eth:log", listener);
        return () => electron_1.ipcRenderer.removeListener("create-eth:log", listener);
    },
    onExit: (cb) => {
        const listener = (_, code) => cb(code);
        electron_1.ipcRenderer.on("create-eth:exit", listener);
        return () => electron_1.ipcRenderer.removeListener("create-eth:exit", listener);
    },
    getProjects: () => electron_1.ipcRenderer.invoke("get-projects"),
    deleteProject: (projectId) => electron_1.ipcRenderer.invoke("delete-project", projectId),
    validateProjectName: (cwd, projectName) => electron_1.ipcRenderer.invoke("validate-project-name", { cwd, projectName }),
    openInIDE: (projectPath, ide) => electron_1.ipcRenderer.invoke("open-in-ide", { projectPath, ide }),
    getCreateEthVersions: () => electron_1.ipcRenderer.invoke("get-create-eth-versions"),
});
