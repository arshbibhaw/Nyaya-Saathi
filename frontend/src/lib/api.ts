import type {
  AuthResponse,
  UserOut,
  Case,
  ChatResponse,
  EvidenceResponse,
  ActionPlan,
  GeneratedDocument,
} from "@/lib/types";

let activeBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const candidateBases = [
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  "http://localhost:8000/api/v1",
  "http://127.0.0.1:8000/api/v1",
  "http://localhost:8002/api/v1",
  "http://127.0.0.1:8002/api/v1",
];

// ── Generic Fetch Wrapper ───────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window === "undefined") {
    return {};
  }
  let token = localStorage.getItem("token");
  
  if (!token) {
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      if ((session as any)?.accessToken) {
        token = (session as any).accessToken as string;
      }
    } catch {
      // Ignore if next-auth is not available
    }
  }

  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  return {};
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {

  const authHeaders = await getAuthHeaders();
  const requestHeaders = {
    "Content-Type": "application/json",
    ...authHeaders,
    ...options.headers,
  };

  // Try current activeBaseUrl first
  const searchBases = Array.from(new Set([activeBaseUrl, ...candidateBases]));

  let res: Response | null = null;
  let lastError: any = null;

  for (const base of searchBases) {
    try {
      const url = `${base}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
      res = await fetch(url, {
        ...options,
        headers: requestHeaders,
      });
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        activeBaseUrl = base; // Cache the responsive base URL
        break;
      }
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  if (!res) {
    throw new Error(
      `Unable to connect to the backend server. Please verify the backend FastAPI server is running on port 8000.`
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.detail ?? body.message ?? `Request failed with status ${res.status}`,
    );
  }

  return (await res.json()) as T;
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
  username: string,
  full_name: string,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, username, full_name }),
  });
}

export async function fetchProfile(): Promise<UserOut> {
  return apiClient<UserOut>("/auth/me");
}

export async function updateProfile(data: {
  username?: string;
  full_name?: string;
}): Promise<UserOut> {
  return apiClient<UserOut>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ── Cases ───────────────────────────────────────────────────────────────────

export async function fetchCases(): Promise<Case[]> {
  return apiClient<Case[]>("/cases/");
}

export async function createCase(initial_issue: string, location?: string): Promise<Case> {
  return apiClient<Case>("/cases/", {
    method: "POST",
    body: JSON.stringify({ initial_issue, location }),
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

export async function getMessages(caseId: string): Promise<{ id: string; role: string; content: string; timestamp: string }[]> {
  return apiClient<{ id: string; role: string; content: string; timestamp: string }[]>(`/cases/${caseId}/messages`);
}

export async function sendChatMessageStream(
  caseId: string,
  message: string,
  onChunk: (chunk: string) => void,
  onSources: (sources: { act: string; section: string; text?: string }[]) => void,
): Promise<void> {
  const url = `${activeBaseUrl}/cases/${caseId}/chat/stream`;
  const authHeaders = await getAuthHeaders();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? "Failed to stream chat");
  }

  if (!res.body) throw new Error("No response body for stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");

    // Process all complete chunks
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i].trim();
      if (part.startsWith("data: ")) {
        try {
          const data = JSON.parse(part.substring(6));
          if (data.type === "sources") {
            const mappedSources = data.sources.map((s: { title?: string; source_url?: string }) => ({
              act: s.title || "Reference",
              section: "",
              text: s.source_url
            }));
            onSources(mappedSources);
          } else if (data.type === "chunk") {
            onChunk(data.text);
          }
        } catch (e) {
          console.error("Failed to parse SSE data:", e);
        }
      }
    }
    buffer = parts[parts.length - 1];
  }
}

// ── Evidence ────────────────────────────────────────────────────────────────

export async function uploadEvidence(
  caseId: string,
  file: File,
): Promise<EvidenceResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const authHeaders = await getAuthHeaders();

  const searchBases = Array.from(new Set([activeBaseUrl, ...candidateBases]));
  let res: Response | null = null;

  for (const base of searchBases) {
    try {
      const url = `${base}/cases/${caseId}/evidence`;
      res = await fetch(url, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      if (res.ok) {
        activeBaseUrl = base;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!res || !res.ok) {
    const body = await res?.json().catch(() => ({}));
    throw new ApiError(
      res?.status || 500,
      body?.detail ?? "Evidence upload failed",
    );
  }

  return res.json() as Promise<EvidenceResponse>;
}

export async function listEvidence(caseId: string): Promise<EvidenceResponse[]> {
  return apiClient<EvidenceResponse[]>(`/cases/${caseId}/evidence`);
}

// ── Action Plan ─────────────────────────────────────────────────────────────

export async function getActionPlan(caseId: string): Promise<ActionPlan> {
  return apiClient<ActionPlan>(`/cases/${caseId}/plan`);
}

// ── Documents ───────────────────────────────────────────────────────────────

export async function getDocument(caseId: string): Promise<GeneratedDocument> {
  return apiClient<GeneratedDocument>(`/cases/${caseId}/document`);
}

export async function listDocuments(caseId: string): Promise<GeneratedDocument[]> {
  return apiClient<GeneratedDocument[]>(`/cases/${caseId}/documents`);
}

export async function generateDocument(
  caseId: string,
  docType: string,
): Promise<GeneratedDocument> {
  return apiClient<GeneratedDocument>(`/cases/${caseId}/documents/generate`, {
    method: "POST",
    body: JSON.stringify({ doc_type: docType }),
  });
}
