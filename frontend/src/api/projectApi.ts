import { api } from "./client";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
}

export function getProjects() {
  return api<Project[]>("/projects");
}

export function getProject(id: number) {
  return api<Project>(`/projects/${id}`);
}

export function createProject(data: ProjectCreate) {
  return api<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProject(id: number, data: ProjectUpdate) {
  return api<Project>(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProject(id: number) {
  return api<void>(`/projects/${id}`, { method: "DELETE" });
}