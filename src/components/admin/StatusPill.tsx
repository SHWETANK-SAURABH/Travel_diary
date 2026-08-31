import { Badge } from "@/components/ui";
import type { ContentStatus, VerificationStatus, DateConfidence } from "@prisma/client";

export function ContentStatusPill({ status }: { status: ContentStatus }) {
  if (status === "PUBLISHED") return <Badge variant="success">Published</Badge>;
  if (status === "ARCHIVED") return <Badge variant="neutral">Archived</Badge>;
  return <Badge variant="terracotta">Draft</Badge>;
}

const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  UNVERIFIED: "Unverified",
  AI_GENERATED: "AI-suggested",
  ADMIN_VERIFIED: "Verified",
  ADMIN_OVERRIDDEN: "Admin-overridden",
};

export function VerificationPill({ status }: { status: VerificationStatus }) {
  const variant = status === "ADMIN_VERIFIED" || status === "ADMIN_OVERRIDDEN" ? "success" : status === "AI_GENERATED" ? "navy" : "terracotta";
  return <Badge variant={variant}>{VERIFICATION_LABEL[status]}</Badge>;
}

const DATE_CONFIDENCE_LABEL: Record<DateConfidence, string> = {
  NOT_ANNOUNCED: "Not announced",
  AI_SUGGESTED: "AI-suggested",
  EXPECTED: "Expected",
  CONFIRMED: "Confirmed",
  ADMIN_VERIFIED: "Admin-verified",
};

export function DateConfidencePill({ confidence }: { confidence: DateConfidence }) {
  const variant = confidence === "CONFIRMED" || confidence === "ADMIN_VERIFIED" ? "success" : confidence === "NOT_ANNOUNCED" ? "neutral" : "terracotta";
  return <Badge variant={variant}>{DATE_CONFIDENCE_LABEL[confidence]}</Badge>;
}
