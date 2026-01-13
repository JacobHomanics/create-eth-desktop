export {};

interface Project {
  id: string;
  name: string;
  path: string;
  framework?: "hardhat" | "foundry";
  extensions?: string[];
  createdAt: number;
}

declare global {
  interface Window {
    api: {
      pickDirectory: (defaultPath?: string) => Promise<string | null>;
      runCreateEth: (
        cwd: string,
        projectName: string,
        options?: {
          framework?: "hardhat" | "foundry";
          extensions?: string[];
          version?: string;
        }
      ) => Promise<{ ok: true }>;
      onLog: (cb: (line: string) => void) => () => void;
      onExit: (cb: (code: number) => void) => () => void;
      getProjects: () => Promise<Project[]>;
      deleteProject: (projectId: string) => Promise<{ ok: true }>;
      validateProjectName: (
        cwd: string,
        projectName: string
      ) => Promise<{ valid: boolean; error: string | null }>;
      openInIDE: (
        projectPath: string,
        ide: "cursor" | "vscode"
      ) => Promise<{ ok: boolean; error?: string }>;
      getCreateEthVersions: () => Promise<{
        versions: string[];
        tags: Record<string, string>;
      }>;
    };
  }
}
