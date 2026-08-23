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

async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window === "undefined") {
    return {};
  }
  
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const authHeaders = await getAuthHeaders();

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...options.headers,
      },
    });
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error("Unable to connect to the server. Is the backend running on port 8000?");
    }
    throw err;
  }

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

export async function sendChatMessageStream(
  caseId: string,
  message: string,
  onChunk: (chunk: string) => void,
  onSources: (sources: { act: string; section: string; text?: string }[]) => void,
): Promise<void> {
  const url = `${API_BASE}/cases/${caseId}/chat`;
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
            // Map backend sources to frontend Citation type
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
    // Keep the incomplete part in the buffer
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

  const url = `${API_BASE}/cases/${caseId}/evidence`;
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders,
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
