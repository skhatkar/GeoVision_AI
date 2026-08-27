const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_BASE_URL = (configuredApiUrl || "http://127.0.0.1:8000").replace(
  /\/$/,
  ""
);

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers = new Headers(options?.headers);
  const isFormData =
    typeof FormData !== "undefined" && options?.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Attach JWT token from localStorage if present
  if (typeof window !== "undefined" && !headers.has("Authorization")) {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      const hadToken = !!localStorage.getItem("access_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_user");
      // Show session expiry toast before redirecting
      if (hadToken) {
        // Dynamic import to avoid SSR issues
        import("@/components/ui/toast").then(({ toast }) => {
          toast({
            type: "warning",
            title: "Session Expired",
            description: "Your session has timed out. Please sign in again.",
            duration: 5000,
          });
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    }
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `API Error: ${response.status} ${response.statusText}${errorText ? ` — ${errorText}` : ""}`
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
