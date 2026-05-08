/**
 * Generate a short, human-friendly ticket code: 6S-XXXX
 * Uses uppercase alphanumeric chars, excluding ambiguous ones (0, O, I, L, 1)
 */
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateTicketCode() {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return `6S-${code}`;
}
