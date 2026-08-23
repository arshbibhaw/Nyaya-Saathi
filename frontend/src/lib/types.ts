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
  full_name: string | null;
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
  status: string;
  summary?: string;
  location?: string;
  created_at: string;
}

// ── Evidence ────────────────────────────────────────────────────────────────

export interface ExtractedEntities {
  dates: string[];
  amounts: string[];
  parties: string[];
}

export interface EvidenceResponse {
  id: string;
  file_name: string;
  mime_type: string;
  extracted_text?: string;
  extracted_entities: ExtractedEntities;
  created_at: string;
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
  status?: string;
}

export interface ActionPlan {
  id: string;
  case_id: string;
  status: string;
  steps: ActionPlanStep[];
}

// ── Documents ───────────────────────────────────────────────────────────────

export interface GeneratedDocument {
  id: string;
  case_id: string;
  doc_type: "complaint" | "notice" | "letter" | "legal_notice";
  content: string;
  generated_at: string;
}
