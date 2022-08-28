import * as path from "path";
import * as fs from "../../src/fs/node";

describe("Fs:node", () => {
  describe("resolve()", () => {
    test("should resolve based on root", () => {
      const filepath = fs.resolve("/foo", "bar", ".html");
      const expected = path.resolve("/foo/bar.html");
      expect(filepath).toEqual(expected);
    });

    test("should add extension if it has no extension", () => {
      const filepath = fs.resolve("/foo", "bar", ".picx");
      const expected = path.resolve("/foo/bar.picx");
      expect(filepath).toEqual(expected);
    });
  });

  describe("existsSync()", () => {
    test("should resolve as false if not exists", () => {
      expect(fs.existsSync("/foo/bar")).toBeFalsy();
    });

    test("should resolve as true if exists", () => {
      expect(fs.existsSync(__filename)).toBeTruthy();
    });
  });

  describe("exists()", () => {
    test("should resolve as false if not exists", async () => {
      expect(await fs.exists("/foo/bar")).toBeFalsy();
    });

    test("should resolve as true if exists", async () => {
      expect(await fs.exists(__filename)).toBeTruthy();
    });
  });

  describe("readFileSync()", () => {
    test("should throw when not exist", () => {
      expect(() => fs.readFileSync("/foo/bar")).toThrow("ENOENT");
    });
    test("should read content if exists", () => {
      const content = fs.readFileSync(__filename);
      expect(content).toContain("should read content if exists");
    });
  });

  describe("readFile()", () => {
    test("should throw when not exist", () => {
      expect(fs.readFile("/foo/bar")).rejects.toThrow("ENOENT");
    });
    test("should read content if exists", async () => {
      const content = await fs.readFile(__filename);
      expect(content).toContain("should read content if exists");
    });
  });
});
