export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'K';
}

export function parseDate(dateStr: string | undefined): Date {
  if (!dateStr) return new Date(NaN);
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  return new Date(dateStr);
}

export function safeGetTime(dateStr: string | undefined): number {
  const date = parseDate(dateStr);
  const time = date.getTime();
  return isNaN(time) ? 0 : time;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = parseDate(dateString);
  if (isNaN(date.getTime())) return dateString; // Return original string if invalid

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}
