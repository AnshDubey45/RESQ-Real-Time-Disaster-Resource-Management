import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
  }
  return num.toLocaleString();
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-resq-critical';
    case 'high': return 'text-resq-warning';
    case 'medium': return 'text-resq-accent';
    case 'low': return 'text-resq-accent-secondary';
    default: return 'text-resq-text-secondary';
  }
}

export function getSeverityBg(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-resq-critical/12';
    case 'high': return 'bg-resq-warning/12';
    case 'medium': return 'bg-resq-accent/12';
    case 'low': return 'bg-resq-accent-secondary/12';
    default: return 'bg-resq-surface';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'operational':
    case 'approved':
    case 'completed':
    case 'delivered':
    case 'success':
    case 'healthy':
    case 'clear':
      return 'text-resq-success';
    case 'pending':
    case 'pending_approval':
    case 'recommended':
    case 'monitoring':
    case 'warning':
    case 'in_transit':
    case 'dispatched':
    case 'delayed':
      return 'text-resq-warning';
    case 'critical':
    case 'rejected':
    case 'blocked':
    case 'error':
    case 'offline':
    case 'degraded':
      return 'text-resq-critical';
    default:
      return 'text-resq-accent';
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'active':
    case 'operational':
    case 'approved':
    case 'completed':
    case 'delivered':
    case 'success':
    case 'healthy':
    case 'clear':
      return 'bg-emerald-500/12';
    case 'pending':
    case 'pending_approval':
    case 'recommended':
    case 'monitoring':
    case 'warning':
    case 'in_transit':
    case 'dispatched':
    case 'delayed':
      return 'bg-resq-warning/12';
    case 'critical':
    case 'rejected':
    case 'blocked':
    case 'error':
    case 'offline':
    case 'degraded':
      return 'bg-resq-critical/12';
    default:
      return 'bg-resq-accent/12';
  }
}

export function calculatePriorityScore(factors: {
  severity: number;
  populationImpact: number;
  medicalUrgency: number;
  resourceShortage: number;
  accessibility: number;
}): number {
  return (
    factors.severity * 0.3 +
    factors.populationImpact * 0.25 +
    factors.medicalUrgency * 0.2 +
    factors.resourceShortage * 0.15 +
    factors.accessibility * 0.1
  );
}

export function getPriorityLevel(score: number): string {
  if (score >= 85) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
