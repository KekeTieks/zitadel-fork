import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { buildCSP } from "./csp";

describe("buildCSP", () => {
  const originalEnv = process.env.CUSTOM_CONNECT_SRC;

  beforeEach(() => {
    delete process.env.CUSTOM_CONNECT_SRC;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.CUSTOM_CONNECT_SRC;
    } else {
      process.env.CUSTOM_CONNECT_SRC = originalEnv;
    }
  });

  test("returns all base directives with safe defaults", () => {
    const csp = buildCSP();

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("font-src 'self'");
    expect(csp).toContain("img-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test("adds serviceUrl to img-src only", () => {
    const csp = buildCSP({ serviceUrl: "https://my-instance.zitadel.cloud" });

    expect(csp).toContain("img-src 'self' https://my-instance.zitadel.cloud");
    expect(csp).toMatch(/font-src 'self'(?:;| |$)/);
  });

  test("keeps frame-ancestors as 'none' when iframeOrigins is empty", () => {
    const csp = buildCSP({ iframeOrigins: [] });

    expect(csp).toContain("frame-ancestors 'none'");
  });

  test("overrides frame-ancestors when iframeOrigins are provided", () => {
    const csp = buildCSP({
      iframeOrigins: ["https://app.example.com", "https://other.example.com"],
    });

    expect(csp).toContain("frame-ancestors https://app.example.com https://other.example.com");
    expect(csp).not.toContain("frame-ancestors 'none'");
  });

  test("combines serviceUrl and iframeOrigins", () => {
    const csp = buildCSP({
      serviceUrl: "https://zitadel.mycompany.com",
      iframeOrigins: ["https://portal.mycompany.com"],
    });

    expect(csp).toContain("img-src 'self' https://zitadel.mycompany.com");
    expect(csp).toContain("frame-ancestors https://portal.mycompany.com");
    expect(csp).not.toContain("frame-ancestors 'none'");
  });

  test("base directives are preserved when options are set", () => {
    const csp = buildCSP({
      serviceUrl: "https://example.com",
      iframeOrigins: ["https://embed.example.com"],
    });

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("object-src 'none'");
  });

  test("extends connect-src from CUSTOM_CONNECT_SRC env var (single origin)", () => {
    process.env.CUSTOM_CONNECT_SRC = "https://app.example.com";
    const csp = buildCSP();

    expect(csp).toContain("connect-src 'self' https://app.example.com");
  });

  test("extends connect-src from CUSTOM_CONNECT_SRC env var (multiple, whitespace-separated)", () => {
    process.env.CUSTOM_CONNECT_SRC = "https://a.example.com  https://b.example.com\thttps://c.example.com";
    const csp = buildCSP();

    expect(csp).toContain("connect-src 'self' https://a.example.com https://b.example.com https://c.example.com");
  });

  test("keeps connect-src 'self' only when CUSTOM_CONNECT_SRC is empty or unset", () => {
    process.env.CUSTOM_CONNECT_SRC = "   ";
    const csp = buildCSP();

    expect(csp).toMatch(/connect-src 'self'(?:;| |$)/);
  });
});
