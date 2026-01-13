import React, { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  path: string;
  framework?: "hardhat" | "foundry";
  extensions?: string[];
  createdAt: number;
}

interface ProjectsListProps {
  onCreateNew: () => void;
}

export default function ProjectsList({ onCreateNew }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIDE, setSelectedIDE] = useState<"cursor" | "vscode">(() => {
    const saved = localStorage.getItem("selectedIDE");
    return saved === "cursor" || saved === "vscode" ? saved : "cursor";
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedIDE", selectedIDE);
  }, [selectedIDE]);

  async function loadProjects() {
    setLoading(true);
    try {
      if (!window.api || !window.api.getProjects) {
        console.error("API not available");
        setLoading(false);
        return;
      }
      const projs = await window.api.getProjects();
      setProjects(projs);
    } catch (e) {
      console.error("Failed to load projects:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(projectId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (
      !confirm("Are you sure you want to delete this project from the list?")
    ) {
      return;
    }
    try {
      await window.api.deleteProject(projectId);
      await loadProjects();
    } catch (e) {
      console.error("Failed to delete project:", e);
    }
  }

  async function handleOpenInIDE(projectPath: string) {
    try {
      const result = await window.api.openInIDE(projectPath, selectedIDE);
      if (!result.ok) {
        alert(
          result.error ||
            `Failed to open project in ${
              selectedIDE === "cursor" ? "Cursor" : "VS Code"
            }`
        );
      }
    } catch (e) {
      console.error("Failed to open in IDE:", e);
      alert(
        `Failed to open project in ${
          selectedIDE === "cursor" ? "Cursor" : "VS Code"
        }`
      );
    }
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }

  return (
    <div className="wrap">
      <header className="header">
        <h1>Create ETH Desktop</h1>
        <p>Manage your Ethereum projects</p>
      </header>

      <section className="projects-section">
        <div className="projects-header">
          <h2>Your Projects</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <label
              style={{
                fontSize: "13px",
                opacity: 0.8,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              IDE:
              <select
                value={selectedIDE}
                onChange={(e) =>
                  setSelectedIDE(e.target.value as "cursor" | "vscode")
                }
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #2a2f3a",
                  background: "#0f1117",
                  color: "#e7e7e7",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <option value="cursor">Cursor</option>
                <option value="vscode">VS Code</option>
              </select>
            </label>
            <button onClick={onCreateNew} className="create-button">
              + Create New Project
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create your first project to get started!</p>
            <button onClick={onCreateNew} className="create-button">
              Create New Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => handleOpenInIDE(project.path)}
                style={{ cursor: "pointer" }}
              >
                <div className="project-card-header">
                  <h3>{project.name}</h3>
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    className="delete-button"
                    title="Delete from list"
                  >
                    ×
                  </button>
                </div>
                <div className="project-card-body">
                  <div className="project-info">
                    <div className="project-info-row">
                      <span className="label">Path:</span>
                      <span className="value" title={project.path}>
                        {project.path}
                      </span>
                    </div>
                    {project.framework && (
                      <div className="project-info-row">
                        <span className="label">Framework:</span>
                        <span className="value">{project.framework}</span>
                      </div>
                    )}
                    {project.extensions && project.extensions.length > 0 && (
                      <div className="project-info-row">
                        <span className="label">Extensions:</span>
                        <span className="value">
                          {project.extensions.join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="project-info-row">
                      <span className="label">Created:</span>
                      <span className="value">
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
