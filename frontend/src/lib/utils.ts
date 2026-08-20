/**
  * Safely parse an ISO date string as a UTC Date object.
  */
export function parseUTC(dateStr?: string | null): Date {
  if (!dateStr) return new Date();
  let s = String(dateStr).trim();
  if (!s.includes('Z') && !s.includes('+') && !s.includes('-')) {
    s = s.replace(' ', 'T') + 'Z';
  } else {
    s = s.replace(' ', 'T');
  }
  return new Date(s);
}

/**
 * Format an ISO datetime string to a human-readable date (DD Mon YYYY).
 */
export function formatDate(isoString?: string | null): string {
  if (!isoString) return '—';
  const date = parseUTC(isoString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format an ISO datetime string to time (HH:MM AM/PM).
 */
export function formatTime(isoString?: string | null): string {
  if (!isoString) return '—';
  const date = parseUTC(isoString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format an ISO datetime string to "DD Mon, HH:MM AM/PM".
 */
export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '—';
  return `${formatDate(isoString)}, ${formatTime(isoString)}`;
}

/**
 * Format duration in minutes to "Xh Ym" string.
 */
export function formatDuration(minutes?: number | null): string {
  if (minutes === undefined || minutes === null) return '—';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Format hour (0-23) to "6 AM", "2 PM" etc.
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Get elapsed time object from start ISO string.
 */
export function getElapsedTime(startIso: string) {
  const start = parseUTC(startIso);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - start.getTime());
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  return {
    hours,
    minutes,
    seconds,
    display: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
  };
}

/**
 * Get occupancy level info based on percentage.
 */
export function getOccupancyLevel(percentage: number) {
  if (percentage <= 40) return { label: 'Plenty of space', class: 'low', color: '#10b981' };
  if (percentage <= 70) return { label: 'Getting busy', class: 'moderate', color: '#f59e0b' };
  if (percentage <= 90) return { label: 'Crowded', class: 'high', color: '#f97316' };
  return { label: 'Almost full', class: 'full', color: '#ef4444' };
}

/**
 * Format date string (YYYY-MM-DD) and hour into relative/friendly label e.g., "Today · 5:00 PM", "Tomorrow · 5:00 PM", "Wed, 14 Aug · 5:00 PM".
 */
export function formatDateContext(dateStr: string, hour: number): string {
  if (!dateStr) return `${formatHour(hour)}`;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  const tomorrow = new Date(now.getTime() + 86400000);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(
    tomorrow.getDate()
  ).padStart(2, '0')}`;

  let datePart = '';
  if (dateStr === todayStr) {
    datePart = 'Today';
  } else if (dateStr === tomorrowStr) {
    datePart = 'Tomorrow';
  } else {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        const dt = new Date(y, m - 1, d);
        datePart = dt.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });
      } else {
        datePart = dateStr;
      }
    } else {
      datePart = dateStr;
    }
  }

  return `${datePart} · ${formatHour(hour)}`;
}

/**
 * Get visual density blocks count (out of 10) based on percentage.
 */
export function getDensityBlocks(percentage: number): { filled: number; total: number } {
  const total = 10;
  const pct = Math.min(100, Math.max(0, percentage));
  const filled = pct > 0 ? Math.min(total, Math.max(1, Math.round(pct / 10))) : 0;
  return { filled, total };
}

/**
 * Client-side CSV exporter.
 */
export function exportToCSV<T extends Record<string, unknown>>(data: T[], filename = 'export.csv'): boolean {
  if (!data || !data.length) return false;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((h) => {
          let val = row[h] ?? '';
          if (typeof val === 'string') {
            if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
              val = `"${val.replace(/"/g, '""')}"`;
            }
          }
          return val;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
  return true;
}


