/**
 * Unit tests for the shared Zod form schemas (`lib/schemas.ts`).
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 4.1, 4.2
 *
 * These tests exercise the validation boundaries that the Validator commits to:
 *  - contact: name 1–100 (trimmed), email RFC 5322 ≤254, message 1–5000 (trimmed)
 *  - beta:    fullName 1–100 (trimmed), email, optional organization/role ≤100,
 *             optional message ≤5000, consent strictly === true
 * For each length-constrained field we assert acceptance at the min/max and
 * rejection just outside (0 / max+1), plus trimming, email format, and the
 * consent literal.
 */

import { describe, it, expect } from "vitest";
import {
  contactSchema,
  betaApplicationSchema,
  EMAIL_MAX_LENGTH,
} from "@/lib/schemas";

/** A valid, short email used as filler when testing other fields. */
const VALID_EMAIL = "user@example.com";

/** Build a deliverable email of an exact total length using a long local part. */
function emailOfLength(total: number): string {
  const domain = "@example.com"; // 12 chars
  const local = "a".repeat(total - domain.length);
  return local + domain;
}

describe("contactSchema", () => {
  const base = { name: "Ada Lovelace", email: VALID_EMAIL, message: "Hello there" };

  describe("name (Requirement 3.1: trimmed, 1–100 inclusive)", () => {
    it("accepts a name at the minimum length (1)", () => {
      expect(contactSchema.safeParse({ ...base, name: "A" }).success).toBe(true);
    });

    it("accepts a name at the maximum length (100)", () => {
      expect(
        contactSchema.safeParse({ ...base, name: "n".repeat(100) }).success,
      ).toBe(true);
    });

    it("rejects an empty name (0)", () => {
      expect(contactSchema.safeParse({ ...base, name: "" }).success).toBe(false);
    });

    it("rejects a name one over the maximum (101)", () => {
      expect(
        contactSchema.safeParse({ ...base, name: "n".repeat(101) }).success,
      ).toBe(false);
    });

    it("rejects a whitespace-only name after trimming", () => {
      expect(contactSchema.safeParse({ ...base, name: "   " }).success).toBe(
        false,
      );
    });

    it("trims surrounding whitespace from the parsed name", () => {
      const result = contactSchema.safeParse({ ...base, name: "  Ada  " });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.name).toBe("Ada");
    });

    it("counts length after trimming so padded max+1 still fits", () => {
      // 100 real chars wrapped in whitespace trims back to 100 -> accepted.
      const padded = `  ${"n".repeat(100)}  `;
      expect(contactSchema.safeParse({ ...base, name: padded }).success).toBe(
        true,
      );
    });
  });

  describe("email (Requirement 3.2: RFC 5322, ≤254)", () => {
    it("accepts a well-formed email", () => {
      expect(contactSchema.safeParse({ ...base, email: VALID_EMAIL }).success).toBe(
        true,
      );
    });

    it("accepts an email at the maximum length (254)", () => {
      const email = emailOfLength(EMAIL_MAX_LENGTH);
      expect(email.length).toBe(254);
      expect(contactSchema.safeParse({ ...base, email }).success).toBe(true);
    });

    it("rejects an email one over the maximum (255)", () => {
      const email = emailOfLength(EMAIL_MAX_LENGTH + 1);
      expect(email.length).toBe(255);
      expect(contactSchema.safeParse({ ...base, email }).success).toBe(false);
    });

    it("rejects an empty email", () => {
      expect(contactSchema.safeParse({ ...base, email: "" }).success).toBe(false);
    });

    it.each([
      "plainaddress",
      "missing-at.example.com",
      "no-domain@",
      "@no-local.com",
      "spaces in@example.com",
      "two@@example.com",
    ])("rejects malformed email %j", (email) => {
      expect(contactSchema.safeParse({ ...base, email }).success).toBe(false);
    });
  });

  describe("message (Requirement 3.3: trimmed, 1–5000 inclusive)", () => {
    it("accepts a message at the minimum length (1)", () => {
      expect(contactSchema.safeParse({ ...base, message: "x" }).success).toBe(
        true,
      );
    });

    it("accepts a message at the maximum length (5000)", () => {
      expect(
        contactSchema.safeParse({ ...base, message: "m".repeat(5000) }).success,
      ).toBe(true);
    });

    it("rejects an empty message (0)", () => {
      expect(contactSchema.safeParse({ ...base, message: "" }).success).toBe(
        false,
      );
    });

    it("rejects a message one over the maximum (5001)", () => {
      expect(
        contactSchema.safeParse({ ...base, message: "m".repeat(5001) }).success,
      ).toBe(false);
    });

    it("rejects a whitespace-only message after trimming", () => {
      expect(contactSchema.safeParse({ ...base, message: "\n\t  " }).success).toBe(
        false,
      );
    });
  });

  describe("company honeypot", () => {
    it("accepts a submission when the honeypot is omitted", () => {
      expect(contactSchema.safeParse(base).success).toBe(true);
    });

    it("accepts a submission when the honeypot is an empty string", () => {
      expect(contactSchema.safeParse({ ...base, company: "" }).success).toBe(
        true,
      );
    });
  });
});

describe("betaApplicationSchema", () => {
  const base = {
    fullName: "Grace Hopper",
    email: VALID_EMAIL,
    consent: true as const,
  };

  describe("fullName (Requirement 4.1: trimmed, 1–100 inclusive)", () => {
    it("accepts a full name at the minimum length (1)", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, fullName: "G" }).success,
      ).toBe(true);
    });

    it("accepts a full name at the maximum length (100)", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, fullName: "n".repeat(100) })
          .success,
      ).toBe(true);
    });

    it("rejects an empty full name (0)", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, fullName: "" }).success,
      ).toBe(false);
    });

    it("rejects a full name one over the maximum (101)", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, fullName: "n".repeat(101) })
          .success,
      ).toBe(false);
    });

    it("rejects a whitespace-only full name after trimming", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, fullName: "   " }).success,
      ).toBe(false);
    });
  });

  describe("email (Requirement 4.1: RFC 5322, ≤254)", () => {
    it("accepts an email at the maximum length (254)", () => {
      const email = emailOfLength(EMAIL_MAX_LENGTH);
      expect(betaApplicationSchema.safeParse({ ...base, email }).success).toBe(
        true,
      );
    });

    it("rejects an email one over the maximum (255)", () => {
      const email = emailOfLength(EMAIL_MAX_LENGTH + 1);
      expect(betaApplicationSchema.safeParse({ ...base, email }).success).toBe(
        false,
      );
    });

    it("rejects a malformed email", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, email: "not-an-email" })
          .success,
      ).toBe(false);
    });
  });

  describe("consent (Requirement 4.1: strictly === true)", () => {
    it("accepts consent === true", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, consent: true }).success,
      ).toBe(true);
    });

    it("rejects consent === false", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, consent: false }).success,
      ).toBe(false);
    });

    it("rejects a missing consent value", () => {
      const { consent: _omit, ...withoutConsent } = base;
      expect(betaApplicationSchema.safeParse(withoutConsent).success).toBe(false);
    });

    it("rejects a truthy non-boolean consent value", () => {
      // safeParse accepts `unknown`, so a wrong-typed value is a valid runtime
      // boundary case (no compile-time error / no ts-expect-error needed).
      const wrongTypeConsent: unknown = { ...base, consent: "true" };
      expect(
        betaApplicationSchema.safeParse(wrongTypeConsent).success,
      ).toBe(false);
    });
  });

  describe("optional message (Requirement 4.1: ≤5000, empty permitted)", () => {
    it("accepts an omitted message", () => {
      expect(betaApplicationSchema.safeParse(base).success).toBe(true);
    });

    it("accepts an empty message", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, message: "" }).success,
      ).toBe(true);
    });

    it("accepts a message at the maximum length (5000)", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, message: "m".repeat(5000) })
          .success,
      ).toBe(true);
    });

    it("rejects a message one over the maximum (5001)", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, message: "m".repeat(5001) })
          .success,
      ).toBe(false);
    });
  });

  describe("optional organization & role (Requirement 4.2: ≤100, empty/omitted ok)", () => {
    it("accepts when organization and role are omitted", () => {
      expect(betaApplicationSchema.safeParse(base).success).toBe(true);
    });

    it("accepts empty organization and role", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, organization: "", role: "" })
          .success,
      ).toBe(true);
    });

    it("accepts organization and role at the maximum length (100)", () => {
      expect(
        betaApplicationSchema.safeParse({
          ...base,
          organization: "o".repeat(100),
          role: "r".repeat(100),
        }).success,
      ).toBe(true);
    });

    it("rejects an organization one over the maximum (101)", () => {
      expect(
        betaApplicationSchema.safeParse({
          ...base,
          organization: "o".repeat(101),
        }).success,
      ).toBe(false);
    });

    it("rejects a role one over the maximum (101)", () => {
      expect(
        betaApplicationSchema.safeParse({ ...base, role: "r".repeat(101) })
          .success,
      ).toBe(false);
    });
  });
});
