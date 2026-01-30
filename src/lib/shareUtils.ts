/**
 * Share utilities for Meeting Bingo
 */

export function generateShareText(
  category: string,
  filledCount: number,
  duration: number
): string {
  const minutes = Math.floor(duration / 60000);
  const emoji = filledCount >= 20 ? '🏆' : filledCount >= 15 ? '🎯' : '🎲';

  return `${emoji} Meeting Bingo!
I got BINGO in ${minutes} min playing ${category}!
${filledCount}/24 squares filled

#MeetingBingo`;
}

export async function shareResult(text: string): Promise<boolean> {
  // Try native share API first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return true; // Native share used
    } catch {
      // User cancelled or share failed, fall back to clipboard
    }
  }

  // Fall back to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return false; // Clipboard used
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    throw err;
  }
}
