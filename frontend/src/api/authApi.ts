import { api } from "./client";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role_id?: number;
  department_id?: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthRole {
  id: number;
  name: string;
}

export interface AuthDepartment {
  id: number;
  name: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  role?: AuthRole | null;
  department?: AuthDepartment | null;
}

export function login(data: LoginRequest) {
  const formData = new URLSearchParams();
  formData.append("username", data.username);
  formData.append("password", data.password);

  return api<LoginResponse>("/auth/login", {
    method: "POST",
    body: formData.toString(),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export function register(data: RegisterRequest) {
  return api<AuthUser>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function getMe(token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return api<AuthUser>("/auth/me", { headers });
}
