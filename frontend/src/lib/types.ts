// API response and domain types for Nyaya Saathi

// ── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserOut;
}

export interface UserOut {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
}

// ── Cases ───────────────────────────────────────────────────────────────────

export interface Case {
  id: string;
  domain: string;
  issue: string;
  status: CaseStatus;
  summary?: string;
  created_at: string;
}

export type CaseStatus =
  | "open"
  | "pending_evidence"
  | "analyzing"
  | "plan_generated"
  | "resolved"
  | "escalated";

// ── Evidence ────────────────────────────────────────────────────────────────

export interface ExtractedEntities {
  dates: string[];
  amounts: string[];
  parties: string[];
}

export interface EvidenceResponse {
  evidence_id: string;
  file_name: string;
  mime_type: string;
  extracted_entities: ExtractedEntities;
}

// ── Chat ────────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  citations?: Citation[];
  timestamp: string;
}

export interface Citation {
  section: string;
  act: string;
  text?: string;
}

export interface ChatResponse {
  reply: string;
  citations?: Citation[];
}

// ── Action Plan ─────────────────────────────────────────────────────────────

export interface ActionPlanStep {
  step: number;
  title: string;
  description: string;
  status?: "pending" | "in_progress" | "done";
}

export interface ActionPlan {
  case_id: string;
  plan_status: "generating" | "generated" | "failed";
  steps: ActionPlanStep[];
}

// ── Documents ───────────────────────────────────────────────────────────────

export interface GeneratedDocument {
  id: string;
  case_id: string;
  doc_type: "complaint" | "notice" | "letter";
  content: string;
  generated_at: string;
}
