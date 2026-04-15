const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return sessionStorage.getItem("cnab_jwt") || "";
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    sessionStorage.removeItem("cnab_jwt");
    sessionStorage.removeItem("cnab_user");
    window.location.reload();
    throw new Error("Sessão expirada");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erro ${res.status}`);
  }

  if (res.headers.get("content-type")?.includes("application/json")) {
    return res.json();
  }
  return res;
}

// Auth
export async function apiLogin(rawToken) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ token: rawToken }),
  });
  sessionStorage.setItem("cnab_jwt", data.accessToken);
  sessionStorage.setItem("cnab_user", JSON.stringify(data.user));
  return data.user;
}

export function apiLogout() {
  sessionStorage.removeItem("cnab_jwt");
  sessionStorage.removeItem("cnab_user");
}

export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem("cnab_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!sessionStorage.getItem("cnab_jwt");
}

// CNAB
export async function apiGenerateCnab({ empresa, loteInfo, pagamentos }) {
  return request("/cnab/generate", {
    method: "POST",
    body: JSON.stringify({ empresa, loteInfo, pagamentos }),
  });
}

export async function apiListFiles(page = 1, limit = 20) {
  return request(`/cnab/files?page=${page}&limit=${limit}`);
}

export async function apiGetFile(id) {
  return request(`/cnab/files/${id}`);
}

export async function apiDownloadFile(id, filename) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/cnab/files/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Erro ao baixar arquivo");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Admin
export async function apiGetStats() {
  return request("/admin/stats");
}

export async function apiListTokens() {
  return request("/admin/tokens");
}

export async function apiCreateToken(label, role) {
  return request("/admin/tokens", {
    method: "POST",
    body: JSON.stringify({ label, role }),
  });
}

export async function apiRevokeToken(id) {
  return request(`/admin/tokens/${id}/revoke`, { method: "PATCH" });
}

export async function apiActivateToken(id) {
  return request(`/admin/tokens/${id}/activate`, { method: "PATCH" });
}

export async function apiDeleteToken(id) {
  return request(`/admin/tokens/${id}`, { method: "DELETE" });
}
