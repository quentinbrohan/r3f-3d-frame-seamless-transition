import { PROJECTS } from "@/app/data";

export const useNextProject = (currentProjectId: string) => {
  const currentProjectIndex = PROJECTS.findIndex(
    (project) => project.id === currentProjectId
  );
  const nextProjectIndex = (currentProjectIndex + 1) % PROJECTS.length;

  return {
    nextProject: PROJECTS[nextProjectIndex],
    nextProjectTitle: PROJECTS[nextProjectIndex]?.name ?? "",
  };
};
