'use client';

export function requestNotifyPermission(): void {
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function notifyDone(count: number): void {
  try {
    new Audio('/notify.wav').play().catch(() => {});
  } catch {
    // ignore
  }
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification('MEV Radar', { body: `Búsqueda terminada — ${count} coincidencia(s)` });
  }
}
