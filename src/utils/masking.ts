/**
 * Utility functions for VIT Student Privacy & Masking
 * Enforces strict campus privacy to prevent unsolicited contact, stalking, and spam.
 */

export function maskRegNumber(regNo: string): string {
  if (!regNo) return 'VITian';
  const clean = regNo.trim().toUpperCase();
  if (clean.length <= 5) return `${clean}****`;
  // e.g. "21BCE1429" -> "21BCE****"
  return `${clean.slice(0, 5)}****`;
}

export function maskEmail(email: string): string {
  if (!email) return '***@vitstudent.ac.in';
  const [local, domain] = email.split('@');
  if (!domain) return '***@vitstudent.ac.in';
  const firstLetter = local[0] || 's';
  return `${firstLetter}****@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return '+91 **********';
  // Keep country code and first two / last two digits
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 8) return '+91 **********';
  return `${clean.slice(0, 5)} **** ${clean.slice(-3)}`;
}

export function maskStudentName(fullName: string, isFinderView: boolean = false): string {
  if (!fullName) return 'Verified VITian';
  if (isFinderView) return fullName; // Finder/claimant can see their own
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || 'Student';
  return `${firstName} (VITian)`;
}
