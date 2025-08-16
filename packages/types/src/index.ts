import { z } from 'zod';

// Enums matching Prisma schema
export const OrgTierSchema = z.enum(['SOLO', 'PRO', 'BUSINESS']);
export const UserRoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);
export const DocumentStatusSchema = z.enum(['PENDING', 'SCANNING', 'PROCESSING', 'COMPLETED', 'FAILED']);
export const AnalysisStatusSchema = z.enum(['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED']);
export const ClauseRiskSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const JobStateSchema = z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']);

// API Request/Response schemas
export const CreateDocumentSchema = z.object({
  title: z.string().min(1).max(255),
  files: z.array(z.instanceof(File)).min(1).max(50),
});

export const AnalyzeDocumentSchema = z.object({
  documentId: z.string(),
  jurisdiction: z.string().optional(),
});

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  tier: OrgTierSchema.default('SOLO'),
});

export const InviteUserSchema = z.object({
  email: z.string().email(),
  role: UserRoleSchema,
});

export const UpdateUserRoleSchema = z.object({
  role: UserRoleSchema,
});

// Clause taxonomy
export const CLAUSE_TYPES = [
  'Governing Law',
  'Venue/Jurisdiction',
  'Term',
  'Termination',
  'Auto-Renewal',
  'Scope/Deliverables',
  'Payment/Fees',
  'Interest/Late Fees',
  'Confidentiality',
  'IP Ownership',
  'Work-Made-For-Hire',
  'Non-Compete',
  'Non-Solicit',
  'Assignment',
  'Warranties',
  'Indemnification',
  'Limitation of Liability',
  'Insurance',
  'Force Majeure',
  'Dispute Resolution/Arbitration',
  'Notices',
  'Privacy/Data Protection',
  'Audit/Inspection',
  'Publicity',
  'Change Orders',
] as const;

export type ClauseType = typeof CLAUSE_TYPES[number];

// Job types
export const JOB_TYPES = {
  VIRUS_SCAN: 'virus_scan',
  OCR_PAGE: 'ocr_page',
  NORMALIZE_TEXT: 'normalize_text',
  DETECT_JURISDICTION: 'detect_jurisdiction',
  EXTRACT_CLAUSES: 'extract_clauses',
  SCORE_RISK: 'score_risk',
  GENERATE_SUGGESTIONS: 'generate_suggestions',
  BUILD_REPORT: 'build_report',
} as const;

export type JobType = typeof JOB_TYPES[keyof typeof JOB_TYPES];

// OCR Provider types
export interface OCRResult {
  text: string;
  confidence: number;
  words: OCRWord[];
}

export interface OCRWord {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// LLM types
export interface ClauseExtraction {
  type: ClauseType;
  text: string;
  startChar: number;
  endChar: number;
  pageIndex: number;
  confidence: number;
}

export interface RiskAssessment {
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rationale: string;
  kbRuleIds: string[];
}

export interface ClauseSuggestion {
  summary: string;
  whyItMatters: string;
  ask: string;
  rewriteOption: string;
  fallbackOption: string;
}

// Storage types
export interface SignedUrlResponse {
  uploadUrl: string;
  downloadUrl: string;
  key: string;
}

// Report types
export interface ReportData {
  document: {
    title: string;
    pageCount: number;
    jurisdiction: string;
  };
  organization: {
    name: string;
  };
  analysis: {
    completedAt: Date;
    clauseCount: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
  clauses: Array<{
    type: string;
    risk: string;
    text: string;
    rationale: string;
    suggestions: ClauseSuggestion;
  }>;
}

// Type exports
export type OrgTier = z.infer<typeof OrgTierSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;
export type AnalysisStatus = z.infer<typeof AnalysisStatusSchema>;
export type ClauseRisk = z.infer<typeof ClauseRiskSchema>;
export type JobState = z.infer<typeof JobStateSchema>;