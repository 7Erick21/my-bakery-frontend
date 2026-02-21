export function formatPrice(price: number | string): string {
  return `${Number(price).toFixed(2)}€`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString();
}

export function getWeekMonday(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diff);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${d}`;
}
