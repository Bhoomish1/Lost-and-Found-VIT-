/**
 * Live Time & Dynamic Timestamp Utilities for VIT Lost & Found Portal
 */

export function getCurrentLiveTimeString(date: Date = new Date()): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getCurrentLiveFullTimeString(date: Date = new Date()): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function getCurrentLiveDateTimeString(date: Date = new Date()): string {
  const timeStr = getCurrentLiveTimeString(date);
  return `Today, ${timeStr}`;
}

export function getDynamicTimeOffset(minutesAgo: number): string {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000);
  return getCurrentLiveTimeString(d);
}

export function getDynamicTimeOffsetDateTime(minutesAgo: number): string {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000);
  return `Today, ${getCurrentLiveTimeString(d)}`;
}

export function formatLiveRelativeTime(minutesAgo: number): string {
  if (minutesAgo <= 0) return 'Just now';
  if (minutesAgo === 1) return '1 min ago';
  if (minutesAgo < 60) return `${minutesAgo} mins ago`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours === 1) return '1 hr ago';
  if (hours < 24) return `${hours} hrs ago`;
  return 'Yesterday';
}

export function getSuggestedMeetupTimes(): string[] {
  const now = new Date();
  const times: string[] = [];

  // Suggest next 3 time intervals today relative to live clock
  const slot1 = new Date(now.getTime() + 30 * 60 * 1000);
  const slot1End = new Date(slot1.getTime() + 30 * 60 * 1000);

  const slot2 = new Date(now.getTime() + 60 * 60 * 1000);
  const slot2End = new Date(slot2.getTime() + 30 * 60 * 1000);

  const slot3 = new Date(now.getTime() + 120 * 60 * 1000);

  times.push(`Today, ${getCurrentLiveTimeString(slot1)} – ${getCurrentLiveTimeString(slot1End)}`);
  times.push(`Today, ${getCurrentLiveTimeString(slot2)} – ${getCurrentLiveTimeString(slot2End)}`);
  times.push(`Today, ${getCurrentLiveTimeString(slot3)} (After classes)`);

  return times;
}

/**
 * Gentle two-tone notification sound using standard browser Web Audio API
 */
export function playCampusNotificationChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Two-tone rising chime (F5 -> A5)
    osc.frequency.setValueAtTime(698.46, ctx.currentTime);
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Ignore audio permission or playback restrictions
  }
}
