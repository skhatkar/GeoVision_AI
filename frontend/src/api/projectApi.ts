import { api } from "./client";

export function getProjects() {
  return api("/projects");
}