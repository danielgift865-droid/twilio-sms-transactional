import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (d: string) => format(new Date(d), 'MMM d, yyyy HH:mm');
export const timeAgo = (d: string) => formatDistanceToNow(new Date(d), { addSuffix: true });

export const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    delivered: 'badge-green',
    sent:      'badge-blue',
    queued:    'badge-yellow',
    failed:    'badge-red',
    undelivered: 'badge-red',
  };
  return map[status] ?? 'badge-gray';
};
