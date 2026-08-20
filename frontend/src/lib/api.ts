import type {
  AuthResponse,
  Case,
  ChatResponse,
  EvidenceResponse,
  ActionPlan,
  GeneratedDocument,
} from "@/lib/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Generic Fetch Wrapper ───────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.detail ?? body.message ?? `Request failed with status ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(
  email: string,
  password: string,
  full_name: string,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name }),
  });
}

// ── Cases ───────────────────────────────────────────────────────────────────

export async function fetchCases(): Promise<Case[]> {
  return apiClient<Case[]>("/cases/");
}

export async function createCase(initial_issue: string): Promise<Case> {
  return apiClient<Case>("/cases/", {
    method: "POST",
    body: JSON.stringify({ initial_issue }),
  });
}

export async function getCase(caseId: string): Promise<Case> {
  return apiClient<Case>(`/cases/${caseId}`);
}

// ── Chat ────────────────────────────────────────────────────────────────────

export async function sendChatMessage(
  caseId: string,
  message: string,
): Promise<ChatResponse> {
  return apiClient<ChatResponse>(`/cases/${caseId}/chat`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

// ── Evidence ────────────────────────────────────────────────────────────────

export async function uploadEvidence(
  caseId: string,
  file: File,
): Promise<EvidenceResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE}/cases/${caseId}/evidence`;
  const res = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData, // No Content-Type header — browser sets multipart boundary
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.detail ?? "Evidence upload failed",
    );
  }

  return res.json() as Promise<EvidenceResponse>;
}

// ── Action Plan ─────────────────────────────────────────────────────────────

export async function getActionPlan(caseId: string): Promise<ActionPlan> {
  return apiClient<ActionPlan>(`/cases/${caseId}/plan`);
}

// ── Documents ───────────────────────────────────────────────────────────────

export async function getDocument(caseId: string): Promise<GeneratedDocument> {
  return apiClient<GeneratedDocument>(`/cases/${caseId}/document`);
}

export async function generateDocument(
  caseId: string,
  docType: string,
): Promise<GeneratedDocument> {
  return apiClient<GeneratedDocument>(`/cases/${caseId}/document`, {
    method: "POST",
    body: JSON.stringify({ doc_type: docType }),
  });
}
