const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:59588/api";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Auth ----
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  department: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: ApiCurrentUser;
}

export interface ApiCurrentUser {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  userRole: "employee" | "manager" | "admin";
  totalPoints: number;
  avatar: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  register: (data: RegisterRequest) =>
    apiFetch<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  me: () => apiFetch<ApiCurrentUser>("/auth/me"),
};

// ---- Employees ----
export interface ApiEmployee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  totalPoints: number;
  avatar: string;
}

export const employeesApi = {
  getAll: () => apiFetch<ApiEmployee[]>("/employees"),
};

// ---- Award Categories ----
export interface ApiAwardCategory {
  id: number;
  name: string;
  description: string;
  points: number;
  icon: string;
  managerOnly: boolean;
}

export const categoriesApi = {
  getAll: () => apiFetch<ApiAwardCategory[]>("/awardcategories"),
};

// ---- Recognitions ----
export interface ApiRecognition {
  id: number;
  fromEmployeeId: number;
  toEmployeeId: number;
  fromEmployee: ApiEmployee;
  toEmployee: ApiEmployee;
  message: string;
  categoryId?: number;
  category?: ApiAwardCategory;
  points: number;
  createdAt: string;
  type: "appreciation" | "nomination";
  status: "approved" | "pending" | "rejected";
}

export interface CreateRecognitionRequest {
  toEmployeeId: number;
  message: string;
  categoryId?: number;
  type: "appreciation" | "nomination";
}

export const recognitionsApi = {
  getAll: (params?: { status?: string; type?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.type) query.set("type", params.type);
    const qs = query.toString();
    return apiFetch<ApiRecognition[]>(`/recognitions${qs ? `?${qs}` : ""}`);
  },

  getMy: () => apiFetch<ApiRecognition[]>("/recognitions/my"),

  create: (data: CreateRecognitionRequest) =>
    apiFetch<ApiRecognition>("/recognitions", { method: "POST", body: JSON.stringify(data) }),

  approve: (id: number) =>
    apiFetch<void>(`/recognitions/${id}/approve`, { method: "PUT" }),

  reject: (id: number) =>
    apiFetch<void>(`/recognitions/${id}/reject`, { method: "PUT" }),
};
