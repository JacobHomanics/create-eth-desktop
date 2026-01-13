import React, { useState } from "react";
import ProjectsList from "./ProjectsList";
import CreateProject from "./CreateProject";

type Page = "projects" | "create";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("projects");

  // Force start on projects page
  React.useEffect(() => {
    console.log("App mounted, currentPage:", currentPage);
  }, []);

  return (
    <>
      {currentPage === "projects" ? (
        <ProjectsList onCreateNew={() => setCurrentPage("create")} />
      ) : (
        <CreateProject
          onBack={() => setCurrentPage("projects")}
          onProjectCreated={() => setCurrentPage("projects")}
        />
      )}
    </>
  );
}
