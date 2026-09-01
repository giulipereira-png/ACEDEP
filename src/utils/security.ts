/**
 * ACEDEP Security & Data Protection Suite
 * Implements AppSec best practices: Sanitization (XSS), Rate Limiting, Bot/Honeypot Protection,
 * Mass Assignment Prevention, Safe Error Handling, and File Upload Validation.
 */

// 1. XSS Prevention & String Sanitization
export function sanitizeText(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);
  
  // Strip dangerous HTML/script tags and javascript: URIs
  sanitized = sanitized
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript pseudo-protocol
    .replace(/data:text\/html/gi, '') // Remove data HTML injections
    .replace(/vbscript:/gi, '')
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, ''); // Strip ASCII control characters

  return sanitized;
}

// 2. Email & Phone Validation
export function validateEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const clean = email.trim();
  if (clean.length < 5 || clean.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(clean);
}

export function validatePhone(phone: unknown): boolean {
  if (typeof phone !== 'string') return false;
  const cleanDigits = phone.replace(/\D/g, '');
  return cleanDigits.length >= 10 && cleanDigits.length <= 15;
}

// 3. ID Validation (Path Variable Hardening / Prevent Traversal & Injection)
export function isValidId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_\-]{1,128}$/.test(id);
}

// 4. Rate Limiter (Throttles rapid actions per client)
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(
  actionKey: string, 
  maxHits = 5, 
  windowMs = 60000
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(actionKey) || [];
  
  // Filter out timestamps outside the sliding window
  const validTimestamps = timestamps.filter((time) => now - time < windowMs);
  
  if (validTimestamps.length >= maxHits) {
    const oldest = validTimestamps[0];
    const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }
  
  validTimestamps.push(now);
  rateLimitMap.set(actionKey, validTimestamps);
  return { allowed: true, retryAfterSeconds: 0 };
}

// 5. Bot & Honeypot Protection
export function isBotSubmission(honeypotField: unknown): boolean {
  // If the hidden honeypot field has any value filled in, it is a bot
  if (typeof honeypotField === 'string' && honeypotField.trim().length > 0) {
    return true;
  }
  return false;
}

// 6. Mass Assignment Prevention (Whitelisting Fields)
export function whitelistFields<T extends Record<string, any>>(
  source: Record<string, any>, 
  allowedKeys: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};
  if (!source || typeof source !== 'object') return result;

  for (const key of allowedKeys) {
    const stringKey = String(key);
    if (stringKey in source && source[stringKey] !== undefined) {
      result[key] = source[stringKey];
    }
  }
  return result;
}

// 7. Safe File Upload Validation
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileUpload(
  file: File, 
  allowedMimeTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxSizeBytes: number = 5 * 1024 * 1024 // 5MB default
): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo selecionado.' };
  }

  // Size limit check
  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return { valid: false, error: `O arquivo ultrapassa o limite máximo permitido de ${maxMb}MB.` };
  }

  // MIME type check
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const fileExt = '.' + fileName.split('.').pop();

  const isAllowedMime = allowedMimeTypes.some((type) => fileType === type.toLowerCase());
  
  // Extension check against dangerous executables
  const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.php', '.js', '.vbs', '.py', '.html', '.htm', '.svg', '.bin'];
  if (dangerousExtensions.some((ext) => fileName.endsWith(ext))) {
    return { valid: false, error: 'Tipo de arquivo não permitido por motivos de segurança.' };
  }

  if (!isAllowedMime) {
    return { valid: false, error: 'Formato de arquivo inválido. Formatos aceitos: JPG, PNG, WEBP ou PDF.' };
  }

  return { valid: true };
}

// 8. Safe Error Presentation (Prevents Information Disclosure / Leaking Stacktraces)
export function getSafeErrorMessage(
  error: unknown, 
  fallbackMessage = 'Ocorreu uma instabilidade ao processar a requisição. Tente novamente em instantes.'
): string {
  if (!error) return fallbackMessage;

  const rawMsg = error instanceof Error ? error.message : String(error);
  
  // Mask sensitive database / internal system errors
  if (
    rawMsg.includes('permission-denied') || 
    rawMsg.includes('PERMISSION_DENIED') ||
    rawMsg.includes('Missing or insufficient permissions')
  ) {
    return 'Acesso não autorizado para esta operação.';
  }

  if (rawMsg.includes('the client is offline') || rawMsg.includes('network-request-failed')) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
  }

  if (rawMsg.includes('quota-exceeded') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
    return 'Limite momentâneo de requisições atingido. Por favor, aguarde alguns instantes.';
  }

  // Do not expose stack traces, SQL syntax, or internal file paths
  if (rawMsg.includes('at ') || rawMsg.includes('/node_modules/') || rawMsg.includes('webpack') || rawMsg.includes('vite')) {
    return fallbackMessage;
  }

  return rawMsg.length > 150 ? fallbackMessage : rawMsg;
}
