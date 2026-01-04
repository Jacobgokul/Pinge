import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

/**
 * Merge Tailwind classes with clsx
 * Handles conditional classes and prevents conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format message timestamp for chat display
 * Today: "10:24"
 * Yesterday: "Yesterday 10:24"
 * Older: "Jan 5, 10:24"
 */
export function formatMessageTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isToday(d)) {
    return format(d, 'HH:mm');
  }

  if (isYesterday(d)) {
    return `Yesterday ${format(d, 'HH:mm')}`;
  }

  return format(d, 'MMM d, HH:mm');
}

/**
 * Format conversation list timestamp
 * Shows time for today, day for this week, date for older
 */
export function formatConversationTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isToday(d)) {
    return format(d, 'HH:mm');
  }

  if (isYesterday(d)) {
    return 'Yesterday';
  }

  // Within last 7 days - show day name
  const daysDiff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return format(d, 'EEEE');
  }

  return format(d, 'dd/MM/yyyy');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get initials from a name (for avatar fallback)
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
