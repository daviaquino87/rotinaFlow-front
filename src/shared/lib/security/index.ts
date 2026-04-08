/**
 * Security utility functions for the RotinaFlow frontend.
 * Provides input sanitization and validation helpers used across the app.
 */

/**
 * Whitelist pattern for CSS color values.
 * Allows: hex, rgb/rgba, hsl/hsla, CSS variables (var(--x)), and named colors.
 * Rejects anything that could break out of a CSS declaration (e.g. semicolons, braces).
 */
const CSS_COLOR_SAFE_PATTERN =
  /^(#[0-9a-fA-F]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)|hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(?:0|1|0?\.\d+)\s*\)|var\(--[a-zA-Z0-9-]+\)|transparent|currentColor|inherit|initial|unset|[a-zA-Z]{3,30})$/;

/**
 * Validates and sanitizes a CSS color value before injection into a style block.
 * Prevents CSS injection via dangerouslySetInnerHTML or style props.
 *
 * @returns The original value if safe, otherwise `'transparent'`.
 */
export function sanitizeCssColorValue(value: string): string {
  const trimmed = value.trim();
  if (!CSS_COLOR_SAFE_PATTERN.test(trimmed)) {
    return "transparent";
  }
  return trimmed;
}

/**
 * Sanitizes a CSS custom property key so only valid identifier characters remain.
 * Prevents CSS variable-name injection inside generated `--color-X` declarations.
 */
export function sanitizeCssVarKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9-_]/g, "");
}

/**
 * Validates a redirect path to prevent open-redirect attacks.
 * Only relative paths starting with a single `/` are accepted.
 *
 * @returns The sanitized path, or `'/'` if the input is invalid.
 */
export function sanitizeRedirectPath(path: string): string {
  if (!path || typeof path !== "string") return "/";
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path.replace(/\/{2,}/g, "/");
}

/**
 * Returns a generic, user-safe error message.
 * Use this whenever surfacing errors from network/API calls to the UI,
 * to avoid leaking implementation details, stack traces, or DB info.
 */
export function getGenericErrorMessage(
  _error?: unknown,
  fallback = "Ocorreu um erro. Tente novamente.",
): string {
  return fallback;
}
