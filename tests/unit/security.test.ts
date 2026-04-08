import { describe, it, expect } from "vitest";
import {
  sanitizeCssColorValue,
  sanitizeCssVarKey,
  sanitizeRedirectPath,
  getGenericErrorMessage,
} from "@lib/security";

// ─── sanitizeCssColorValue ────────────────────────────────────────────────────

describe("sanitizeCssColorValue", () => {
  describe("allows valid color values", () => {
    const valid = [
      "#fff",
      "#ffffff",
      "#ffffffff",
      "#3B82F6",
      "rgb(255, 0, 0)",
      "rgb(0,0,0)",
      "rgba(255, 0, 0, 0.5)",
      "rgba(255,0,0,1)",
      "hsl(120, 100%, 50%)",
      "hsla(120, 100%, 50%, 0.3)",
      "transparent",
      "currentColor",
      "inherit",
      "initial",
      "unset",
      "red",
      "blue",
      "var(--color-primary)",
      "var(--my-color-token)",
    ];

    valid.forEach((color) => {
      it(`allows "${color}"`, () => {
        expect(sanitizeCssColorValue(color)).toBe(color.trim());
      });
    });
  });

  describe("blocks CSS injection payloads", () => {
    const malicious = [
      "red; } body { background: red",
      "#fff; font-family: x",
      "url(javascript:alert(1))",
      'expression(alert("xss"))',
      "red} .evil{color:red",
      "};alert(1)//",
      "<script>alert(1)</script>",
      'url("data:text/html,<script>alert(1)</script>")',
    ];

    malicious.forEach((payload) => {
      it(`blocks "${payload}"`, () => {
        expect(sanitizeCssColorValue(payload)).toBe("transparent");
      });
    });
  });

  it("returns transparent for empty string", () => {
    expect(sanitizeCssColorValue("")).toBe("transparent");
  });

  it("trims whitespace before validation", () => {
    expect(sanitizeCssColorValue("  #fff  ")).toBe("#fff");
  });
});

// ─── sanitizeCssVarKey ────────────────────────────────────────────────────────

describe("sanitizeCssVarKey", () => {
  it("allows alphanumeric, hyphens and underscores", () => {
    expect(sanitizeCssVarKey("color-primary")).toBe("color-primary");
    expect(sanitizeCssVarKey("my_var_1")).toBe("my_var_1");
    expect(sanitizeCssVarKey("ABC123")).toBe("ABC123");
  });

  it("strips unsafe characters that could break CSS var names", () => {
    expect(sanitizeCssVarKey("evil}@import")).toBe("evil@import".replace(/[^a-zA-Z0-9-_]/g, ""));
    expect(sanitizeCssVarKey("key; color: red")).toBe("keycolorred");
    expect(sanitizeCssVarKey("foo<script>")).toBe("fooscript");
    expect(sanitizeCssVarKey("--color")).toBe("--color");
  });

  it("returns empty string for fully unsafe input", () => {
    expect(sanitizeCssVarKey("!@#$%^&*()")).toBe("");
  });
});

// ─── sanitizeRedirectPath ─────────────────────────────────────────────────────

describe("sanitizeRedirectPath", () => {
  it("allows valid relative paths", () => {
    expect(sanitizeRedirectPath("/routine")).toBe("/routine");
    expect(sanitizeRedirectPath("/proposals/123")).toBe("/proposals/123");
    expect(sanitizeRedirectPath("/")).toBe("/");
  });

  it("blocks open-redirect via protocol-relative URLs", () => {
    expect(sanitizeRedirectPath("//evil.com")).toBe("/");
    expect(sanitizeRedirectPath("//example.com/steal")).toBe("/");
  });

  it("blocks absolute URLs that could redirect offsite", () => {
    expect(sanitizeRedirectPath("https://evil.com")).toBe("/");
    expect(sanitizeRedirectPath("http://attacker.com")).toBe("/");
    expect(sanitizeRedirectPath("javascript:alert(1)")).toBe("/");
  });

  it("blocks triple-slash path that starts with //", () => {
    expect(sanitizeRedirectPath("///evil.com")).toBe("/");
  });

  it("returns / for empty or non-string input", () => {
    expect(sanitizeRedirectPath("")).toBe("/");
    // @ts-expect-error - testing invalid type
    expect(sanitizeRedirectPath(null)).toBe("/");
    // @ts-expect-error - testing invalid type
    expect(sanitizeRedirectPath(undefined)).toBe("/");
  });
});

// ─── getGenericErrorMessage ───────────────────────────────────────────────────

describe("getGenericErrorMessage", () => {
  it("always returns a user-safe fallback message", () => {
    const result = getGenericErrorMessage(new Error("SELECT * FROM users WHERE id=1"));
    expect(result).not.toContain("SELECT");
    expect(result).not.toContain("users");
  });

  it("does not leak stack traces", () => {
    const err = new Error("Internal server error at /api/auth.ts:42");
    const result = getGenericErrorMessage(err);
    expect(result).not.toContain("/api/auth.ts");
    expect(result).not.toContain(":42");
  });

  it("uses provided fallback text", () => {
    const custom = "Algo deu errado.";
    expect(getGenericErrorMessage(undefined, custom)).toBe(custom);
  });

  it("returns default fallback when no custom message provided", () => {
    const result = getGenericErrorMessage();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
