import type { Database } from '@/types/database';

type MarketStatus = Database['public']['Enums']['market_status'];
type ResolutionOutcome = Database['public']['Enums']['resolution_outcome'];

type LifecycleTargetStatus = Extract<MarketStatus, 'draft' | 'open' | 'paused' | 'closed'>;

const lifecycleTargetStatuses = new Set<LifecycleTargetStatus>(['draft', 'open', 'paused', 'closed']);
const resolutionOutcomes = new Set<ResolutionOutcome>(['yes', 'no', 'void']);

export function parseLifecycleTargetStatus(value: unknown): LifecycleTargetStatus {
  if (typeof value !== 'string' || !lifecycleTargetStatuses.has(value as LifecycleTargetStatus)) {
    throw new Error('targetStatus must be one of draft, open, paused, or closed');
  }

  return value as LifecycleTargetStatus;
}

export function parseResolutionOutcome(value: unknown): ResolutionOutcome {
  if (typeof value !== 'string' || !resolutionOutcomes.has(value as ResolutionOutcome)) {
    throw new Error('outcome must be yes, no, or void');
  }

  return value as ResolutionOutcome;
}

export function getAllowedLifecycleTransitions({
  status,
  closeTime,
  now = new Date()
}: {
  status: MarketStatus;
  closeTime: string;
  now?: Date;
}): LifecycleTargetStatus[] {
  const closeTimeMs = new Date(closeTime).getTime();
  const closeWindowStillOpen = Number.isFinite(closeTimeMs) && closeTimeMs > now.getTime();

  switch (status) {
    case 'draft':
      return ['open', 'paused', 'closed'];
    case 'open':
      return ['paused', 'closed'];
    case 'paused':
      return ['open', 'closed'];
    case 'closed':
      return closeWindowStillOpen ? ['open'] : [];
    default:
      return [];
  }
}

export function assertLifecycleTransition({
  currentStatus,
  targetStatus,
  closeTime,
  now = new Date()
}: {
  currentStatus: MarketStatus;
  targetStatus: LifecycleTargetStatus;
  closeTime: string;
  now?: Date;
}) {
  if (currentStatus === targetStatus) {
    throw new Error(`market already ${targetStatus}`);
  }

  const allowed = getAllowedLifecycleTransitions({ status: currentStatus, closeTime, now });

  if (!allowed.includes(targetStatus)) {
    if (currentStatus === 'closed' && targetStatus === 'open') {
      throw new Error('closed markets can only reopen before close_time');
    }

    throw new Error(`transition from ${currentStatus} to ${targetStatus} is not allowed`);
  }
}

export function deriveResolutionStatus(outcome: ResolutionOutcome): Extract<MarketStatus, 'resolved' | 'void'> {
  return outcome === 'void' ? 'void' : 'resolved';
}

export function validateEvidenceSummary(value: unknown) {
  const summary = typeof value === 'string' ? value.trim() : '';

  if (summary.length < 12) {
    throw new Error('evidenceSummary must be at least 12 characters');
  }

  if (summary.length > 500) {
    throw new Error('evidenceSummary must be 500 characters or fewer');
  }

  return summary;
}

export function validateEvidenceUrl(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('evidenceUrl must be a valid absolute URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('evidenceUrl must use http or https');
  }

  return url.toString();
}

export function assertResolutionAllowed({
  marketStatus,
  outcome,
  existingOutcome
}: {
  marketStatus: MarketStatus;
  outcome: ResolutionOutcome;
  existingOutcome?: ResolutionOutcome | null;
}) {
  if (marketStatus === 'draft' || marketStatus === 'open' || marketStatus === 'paused') {
    throw new Error('market must be closed before resolution');
  }

  if (marketStatus === 'settled') {
    throw new Error('settled markets cannot be re-resolved');
  }

  if (!existingOutcome && marketStatus !== 'closed') {
    throw new Error('market must be closed before resolution');
  }

  if (existingOutcome && existingOutcome !== outcome) {
    throw new Error(`market already resolved as ${existingOutcome}`);
  }
}
