import { describe, it, expect } from "vitest";
import { generateCard } from "../cardGenerator";
import { CATEGORIES } from "../../data/categories";
import { CategoryId } from "../../types";

describe("generateCard", () => {
  describe("grid structure", () => {
    it("generates a 5x5 grid", () => {
      const card = generateCard("agile");
      expect(card.squares).toHaveLength(5);
      card.squares.forEach((row) => {
        expect(row).toHaveLength(5);
      });
    });

    it("returns exactly 25 squares total", () => {
      const card = generateCard("agile");
      const totalSquares = card.squares.flat().length;
      expect(totalSquares).toBe(25);
    });
  });

  describe("free space", () => {
    it("has free space at center (2,2)", () => {
      const card = generateCard("agile");
      const centerSquare = card.squares[2][2];
      expect(centerSquare.isFreeSpace).toBe(true);
      expect(centerSquare.isFilled).toBe(true);
      expect(centerSquare.word).toBe("FREE");
    });

    it("has filledAt timestamp for free space", () => {
      const card = generateCard("agile");
      const centerSquare = card.squares[2][2];
      expect(centerSquare.filledAt).not.toBeNull();
      expect(typeof centerSquare.filledAt).toBe("number");
    });

    it("only has one free space", () => {
      const card = generateCard("agile");
      const freeSpaces = card.squares.flat().filter((s) => s.isFreeSpace);
      expect(freeSpaces).toHaveLength(1);
    });
  });

  describe("words selection", () => {
    it("has 24 unique words plus free space", () => {
      const card = generateCard("agile");
      const words = card.squares
        .flat()
        .filter((s) => !s.isFreeSpace)
        .map((s) => s.word);

      expect(words).toHaveLength(24);
      expect(new Set(words).size).toBe(24); // All unique
    });

    it("returns words array matching squares (excluding free space)", () => {
      const card = generateCard("agile");
      expect(card.words).toHaveLength(24);
      
      // All words in card.words should appear in squares
      const squareWords = card.squares
        .flat()
        .filter((s) => !s.isFreeSpace)
        .map((s) => s.word);
      
      card.words.forEach((word) => {
        expect(squareWords).toContain(word);
      });
    });

    it("uses words from correct category - agile", () => {
      const card = generateCard("agile");
      const agileCategory = CATEGORIES.find((c) => c.id === "agile");
      const categoryWords = agileCategory!.words;
      
      card.words.forEach((word) => {
        expect(categoryWords).toContain(word);
      });
    });

    it("uses words from correct category - corporate", () => {
      const card = generateCard("corporate");
      const corpCategory = CATEGORIES.find((c) => c.id === "corporate");
      const categoryWords = corpCategory!.words;
      
      card.words.forEach((word) => {
        expect(categoryWords).toContain(word);
      });
    });

    it("uses words from correct category - tech", () => {
      const card = generateCard("tech");
      const techCategory = CATEGORIES.find((c) => c.id === "tech");
      const categoryWords = techCategory!.words;
      
      card.words.forEach((word) => {
        expect(categoryWords).toContain(word);
      });
    });
  });

  describe("randomization", () => {
    it("produces different cards on each call", () => {
      const card1 = generateCard("agile");
      const card2 = generateCard("agile");

      const words1 = card1.squares.flat().map((s) => s.word).join(",");
      const words2 = card2.squares.flat().map((s) => s.word).join(",");

      // Cards should be different (shuffled)
      // Note: There is a very small probability this could fail due to random chance
      expect(words1).not.toBe(words2);
    });

    it("shuffles word positions across multiple calls", () => {
      const positions: Record<string, Set<string>> = {};
      
      // Generate 10 cards and track positions of each word
      for (let i = 0; i < 10; i++) {
        const card = generateCard("agile");
        card.squares.flat().forEach((square) => {
          if (!square.isFreeSpace) {
            if (!positions[square.word]) {
              positions[square.word] = new Set();
            }
            positions[square.word].add(square.id);
          }
        });
      }

      // At least some words should appear in multiple positions
      const wordsInMultiplePositions = Object.values(positions).filter(
        (posSet) => posSet.size > 1
      );
      expect(wordsInMultiplePositions.length).toBeGreaterThan(0);
    });
  });

  describe("square properties", () => {
    it("assigns unique IDs to each square", () => {
      const card = generateCard("agile");
      const ids = card.squares.flat().map((s) => s.id);
      expect(new Set(ids).size).toBe(25);
    });

    it("assigns correct row and column to each square", () => {
      const card = generateCard("agile");
      card.squares.forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
          expect(square.row).toBe(rowIndex);
          expect(square.col).toBe(colIndex);
          const expectedId=rowIndex+"-"+colIndex;expect(square.id).toBe(expectedId);
        });
      });
    });

    it("initializes non-free squares as not filled", () => {
      const card = generateCard("agile");
      card.squares.flat().forEach((square) => {
        if (!square.isFreeSpace) {
          expect(square.isFilled).toBe(false);
        }
      });
    });

    it("initializes all squares with isAutoFilled as false", () => {
      const card = generateCard("agile");
      card.squares.flat().forEach((square) => {
        expect(square.isAutoFilled).toBe(false);
      });
    });

    it("initializes non-free squares with null filledAt", () => {
      const card = generateCard("agile");
      card.squares.flat().forEach((square) => {
        if (!square.isFreeSpace) {
          expect(square.filledAt).toBeNull();
        }
      });
    });
  });

  describe("all categories", () => {
    it("generates cards for all categories", () => {
      const categories: CategoryId[] = ["agile", "corporate", "tech"];

      categories.forEach((category) => {
        const card = generateCard(category);
        expect(card.squares).toHaveLength(5);
        expect(card.squares[2][2].isFreeSpace).toBe(true);
        expect(card.words).toHaveLength(24);
      });
    });
  });

  describe("error handling", () => {
    it("throws error for unknown category", () => {
      expect(() => generateCard("unknown" as CategoryId)).toThrow(
        "Unknown category: unknown"
      );
    });
  });
});
