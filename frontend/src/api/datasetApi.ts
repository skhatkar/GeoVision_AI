import { api } from "./client";

export interface Dataset {
  id: number;
  name: string;
  description: string | null;
  source: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  geometry_type: string | null;
  crs: string | null;
  feature_count: number;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export function getDatasets() {
  return api<Dataset[]>("/datasets");
}

export function uploadDataset(projectId: number, file: File) {
  const formData = new FormData();
  formData.append("project_id", String(projectId));
  formData.append("file", file);

  return api<Dataset>("/datasets/upload", {
    method: "POST",
    body: formData,
  });
}

export function deleteDataset(datasetId: number) {
  return api<{ message: string }>(`/datasets/${datasetId}`, {
    method: "DELETE",
  });
}
