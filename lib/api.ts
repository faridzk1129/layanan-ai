// lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  // {/* PERUBAHAN: Deteksi jika body adalah FormData, jangan set Content-Type JSON */}
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...((options.headers as Record<string, string>) || {}),
  };

  // Jika bukan FormData, tambahkan Content-Type JSON secara default
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    let errorMessage = data.message || "Terjadi kesalahan pada server.";
    if (data.errors) {
      const firstError = Object.values(data.errors)[0] as string[];
      errorMessage = firstError[0];
    }
    throw new Error(errorMessage);
  }

  return data;
}
