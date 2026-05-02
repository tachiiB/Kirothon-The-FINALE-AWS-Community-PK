export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function truncateEmail(text: string, maxChars = 8000): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n[...truncated for analysis]";
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function detectUrdu(text: string): boolean {
  const urduUnicode = /[؀-ۿ]/;
  const romanUrduWords = /\b(kaise|mujhe|meri|mera|kya|nahi|hai|hain|aur|bhi|ka|ki|ke|se|ko|yeh|woh|ap|aap|tum|hum|main|jana|karo|kerna|krna|tha|thi|the|hoga|hogi|chahiye|milega|milegi|lagta|lagti)\b/i;
  return urduUnicode.test(text) || romanUrduWords.test(text);
}
