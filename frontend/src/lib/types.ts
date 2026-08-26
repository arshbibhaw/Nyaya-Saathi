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
  state?: string | null;
  city?: string | null;
  address?: string | null;
}

// ── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  is_read: boolean;
  created_at: string;
}

// ── Profile Stats ───────────────────────────────────────────────────────────

export interface ProfileStats {
  active_cases: number;
  generated_notices: number;
  evidence_files: number;
  privacy_standard: string;
}

// ── Cases ───────────────────────────────────────────────────────────────────

export interface Case {
  id: string;
  title?: string;
  description?: string;
  domain: string;
  issue: string;
  subcategory?: string;
  urgency?: string;
  location?: string;
  status: CaseStatus | string;
  summary?: string;
  relevant_laws?: string;
  timeline?: { event: string; time: string; [key: string]: unknown }[];
  created_at: string;
  updated_at?: string;
}

export type CaseStatus =
  | "open"
  | "pending_evidence"
  | "analyzing"
  | "plan_generated"
  | "resolved"
  | "escalated"
  | "ACTIVE"
  | "DRAFT"
  | "ACTION_REQUIRED"
  | "ESCALATED"
  | "RESOLVED"
  | "ARCHIVED";

// ── Evidence ────────────────────────────────────────────────────────────────

export interface ExtractedEntities {
  dates?: string[];
  amounts?: string[];
  parties?: string[];
}

export interface EvidenceResponse {
  id?: string;
  evidence_id?: string;
  file_name: string;
  mime_type: string;
  extracted_text?: string;
  extracted_entities?: ExtractedEntities;
  created_at?: string;
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
  response?: string;
  citations?: Citation[];
  sources?: any[];
  follow_up_questions?: string[];
}

// ── Action Plan ─────────────────────────────────────────────────────────────

export interface ActionPlanStep {
  step: number;
  title: string;
  description: string;
  status?: "pending" | "in_progress" | "done" | "completed" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | string;
}

export interface ActionPlan {
  id?: string;
  case_id: string;
  plan_status?: "generating" | "generated" | "failed" | string;
  status?: string;
  steps: ActionPlanStep[];
}

// ── Documents ───────────────────────────────────────────────────────────────

export interface GeneratedDocument {
  id: string;
  case_id: string;
  doc_type: "complaint" | "notice" | "letter" | "legal_notice" | string;
  content: string;
  generated_at?: string;
}

