'use client';

export function requestNotifyPermission(): void {
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function notifyDone(count: number): void {
  // Sonido de aviso (puede estar throttleado por el navegador si la pestaña
  // estuvo mucho tiempo en segundo plano; la notificación es el aviso principal).
  try {
    const audio = new Audio('/notify.wav');
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }

  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

  const body =
    count === 0
      ? 'La búsqueda terminó. No hubo coincidencias exactas.'
      : `Búsqueda terminada — ${count} coincidencia${count === 1 ? '' : 's'}. Tocá para ver.`;

  const notification = new Notification('MEV Radar', {
    body,
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'mev-radar-busqueda', // reemplaza una notificación anterior en vez de apilar
    requireInteraction: true, // queda visible hasta que la cierren (para verla al volver)
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}
