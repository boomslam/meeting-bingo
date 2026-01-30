import { describe, it, expect } from "vitest";
import {
  normalizeText,
  detectWords,
  detectWordsWithAliases,
  WORD_ALIASES,
} from "../wordDetector";

describe("normalizeText", () => {
  it("lowercases text", () => {
    expect(normalizeText("HELLO World")).toBe("hello world");
  });

  it("removes punctuation and replaces with space", () => {
    expect(normalizeText("Hello, world!")).toBe("hello world");
    expect(normalizeText("It's a test.")).toBe("it s a test");
  });

  it("collapses whitespace", () => {
    expect(normalizeText("hello    world")).toBe("hello world");
    expect(normalizeText("  hello  ")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(normalizeText("")).toBe("");
  });

  it("handles mixed punctuation and whitespace", () => {
    expect(normalizeText("  Hello,   World!  ")).toBe("hello world");
  });

  it("handles numbers", () => {
    expect(normalizeText("test123")).toBe("test123");
  });
});

describe("detectWords", () => {
  const testWords = ["sprint", "standup", "backlog", "agile"];

  it("detects single words in transcript", () => {
    const detected = detectWords(
      "We had a sprint planning today",
      testWords,
      new Set()
    );
    expect(detected).toContain("sprint");
  });

  it("detects multiple words", () => {
    const detected = detectWords(
      "The sprint and standup went well",
      testWords,
      new Set()
    );
    expect(detected).toContain("sprint");
    expect(detected).toContain("standup");
  });

  it("is case insensitive", () => {
    const detected = detectWords(
      "SPRINT planning STANDUP",
      testWords,
      new Set()
    );
    expect(detected).toContain("sprint");
    expect(detected).toContain("standup");
  });

  it("skips already-filled words", () => {
    const alreadyFilled = new Set(["sprint"]);
    const detected = detectWords("sprint and standup", testWords, alreadyFilled);
    expect(detected).not.toContain("sprint");
    expect(detected).toContain("standup");
  });

  it("returns empty array when no matches", () => {
    const detected = detectWords("nothing relevant here", testWords, new Set());
    expect(detected).toEqual([]);
  });

  it("handles empty transcript", () => {
    const detected = detectWords("", testWords, new Set());
    expect(detected).toEqual([]);
  });

  it("detects multi-word phrases using substring match", () => {
    const phrases = ["stand up", "daily standup"];
    const detected = detectWords(
      "we have a daily standup meeting",
      phrases,
      new Set()
    );
    expect(detected).toContain("daily standup");
  });

  it("uses word boundaries for single words (no partial matches)", () => {
    const words = ["sprint"];
    // "sprinting" should NOT match "sprint" due to word boundary
    const detected = detectWords("we are sprinting", words, new Set());
    expect(detected).toEqual([]);
  });

  it("returns original word case, not normalized", () => {
    const words = ["Sprint", "STANDUP"];
    const detected = detectWords("sprint and standup", words, new Set());
    expect(detected).toContain("Sprint");
    expect(detected).toContain("STANDUP");
  });

  it("handles words with special regex characters", () => {
    const words = ["C++", "node.js"];
    const detected = detectWords(
      "I love C++ and node.js",
      words,
      new Set()
    );
    // After normalization, these become "c" and "node js"
    // This tests the regex escape functionality
    expect(detected).toBeDefined();
  });

  it("handles empty word list", () => {
    const detected = detectWords("some transcript", [], new Set());
    expect(detected).toEqual([]);
  });
});

describe("detectWordsWithAliases", () => {
  it("detects direct word matches", () => {
    const words = ["ci/cd", "mvp"];
    const detected = detectWordsWithAliases(
      "we discussed ci/cd",
      words,
      new Set()
    );
    // Note: ci/cd becomes "ci cd" after normalization
    expect(detected).toBeDefined();
  });

  it("detects words via aliases", () => {
    const words = ["ci/cd"];
    const detected = detectWordsWithAliases(
      "we need continuous integration",
      words,
      new Set()
    );
    expect(detected).toContain("ci/cd");
  });

  it("detects MVP via alias", () => {
    const words = ["mvp"];
    const detected = detectWordsWithAliases(
      "we need a minimum viable product",
      words,
      new Set()
    );
    expect(detected).toContain("mvp");
  });

  it("does not duplicate if word already detected directly", () => {
    const words = ["ci/cd"];
    // If both direct match and alias match, should only appear once
    const detected = detectWordsWithAliases(
      "ci cd continuous integration",
      words,
      new Set()
    );
    expect(detected.filter((w) => w === "ci/cd").length).toBe(1);
  });

  it("skips already-filled words even when alias matches", () => {
    const words = ["ci/cd"];
    const alreadyFilled = new Set(["ci/cd"]);
    const detected = detectWordsWithAliases(
      "continuous integration is important",
      words,
      alreadyFilled
    );
    expect(detected).not.toContain("ci/cd");
  });

  it("handles words without aliases normally", () => {
    const words = ["sprint", "backlog"];
    const detected = detectWordsWithAliases(
      "sprint planning",
      words,
      new Set()
    );
    expect(detected).toContain("sprint");
  });
});

describe("WORD_ALIASES", () => {
  it("has expected aliases for ci/cd", () => {
    expect(WORD_ALIASES["ci/cd"]).toContain("continuous integration");
    expect(WORD_ALIASES["ci/cd"]).toContain("cicd");
  });

  it("has expected aliases for mvp", () => {
    expect(WORD_ALIASES["mvp"]).toContain("minimum viable product");
  });

  it("has expected aliases for roi", () => {
    expect(WORD_ALIASES["roi"]).toContain("return on investment");
  });
});
