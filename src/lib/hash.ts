async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function generateVerificationHash(
  requestId: string,
  donorId: string,
  score: number,
  timestamp: string
): Promise<string> {
  return sha256(requestId + donorId + score + timestamp);
}

export async function verifyHash(
  requestId: string,
  donorId: string,
  score: number,
  timestamp: string,
  expectedHash: string
): Promise<boolean> {
  const computed = await generateVerificationHash(requestId, donorId, score, timestamp);
  return computed === expectedHash;
}
