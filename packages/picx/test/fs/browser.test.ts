import * as sinon from "sinon";
import * as fs from "../../src/fs/browser";

describe("Fs:browser", function () {
  if (+(process.version.match(/^v(\d+)/) as RegExpMatchArray)[1] < 8) {
    console.info("jsdom not supported, skipping template-browser...");
    return;
  }

  const jsdom = require("jsdom");
  const { JSDOM } = jsdom;

  beforeEach(function () {
    const dom = new JSDOM(``, {
      url: "https://example.com/foo/bar/",
      contentType: "text/html",
      includeNodeLocations: true
    });
    (global as any).document = dom.window.document;
  });

  afterEach(function () {
    delete (global as any).document;
  });

  describe("resolve()", function () {
    test("should support relative root", function () {
      expect(fs.resolve("./views/", "foo", "")).toEqual("https://example.com/foo/bar/views/foo");
    });

    test("should treat root as directory", function () {
      expect(fs.resolve("./views", "foo", "")).toEqual("https://example.com/foo/bar/views/foo");
    });

    test("should support absolute root", function () {
      expect(fs.resolve("/views", "foo", "")).toEqual("https://example.com/views/foo");
    });

    test("should support empty root", function () {
      expect(fs.resolve("", "page.html", "")).toEqual("https://example.com/foo/bar/page.html");
    });

    test("should support full url as root", function () {
      expect(fs.resolve("https://example.com/views/", "page.html", "")).toEqual("https://example.com/views/page.html");
    });

    test("should add extname when absent", function () {
      expect(fs.resolve("https://example.com/views/", "page", ".html")).toEqual("https://example.com/views/page.html");
    });

    test("should add extname for urls have searchParams", function () {
      expect(fs.resolve("https://example.com/views/", "page?foo=bar", ".html")).toEqual(
        "https://example.com/views/page.html?foo=bar"
      );
    });

    test("should not add extname when full url is given", function () {
      expect(fs.resolve("https://example.com/views/", "https://google.com/page.php", ".html")).toEqual(
        "https://google.com/page.php"
      );
    });

    test("should not add extname when already have one", function () {
      expect(fs.resolve("https://example.com/views/", "page.php", ".html")).toEqual(
        "https://example.com/views/page.php"
      );
    });
  });

  describe("dirname()", () => {
    test("should return dirname of file", async function () {
      const val = fs.dirname("https://example.com/views/foo/bar");
      expect(val).toEqual("https://example.com/views/foo/");
    });
  });

  describe("exists()", () => {
    test("should always return true", async function () {
      const val = await fs.exists("/foo/bar");
      expect(val).toEqual(true);
    });
  });

  describe("existsSync()", () => {
    test("should always return true", function () {
      expect(fs.existsSync("/foo/bar")).toEqual(true);
    });
  });

  describe("readFile()", () => {
    let server: sinon.SinonFakeServer;
    beforeEach(() => {
      server = sinon.fakeServer.create();
      server.autoRespond = true;
      server.respondWith("GET", "https://example.com/views/hello.html", [
        200,
        { "Content-Type": "text/plain" },
        "hello {{name}}"
      ]);
      (global as any).XMLHttpRequest = sinon.useFakeXMLHttpRequest();
    });

    afterEach(() => {
      server.restore();
      delete (global as any).XMLHttpRequest;
    });

    test("should get corresponding text", async function () {
      const html = await fs.readFile("https://example.com/views/hello.html");
      return expect(html).toEqual("hello {{name}}");
    });

    test("should throw 404", () => {
      return expect(fs.readFile("https://example.com/not/exist.html")).rejects.toThrow("Not Found");
    });

    test("should throw error", function () {
      const result = expect(fs.readFile("https://example.com/views/hello.html")).rejects.toThrow(
        "An error occurred whilst receiving the response."
      );
      server.requests[0].error();
      return result;
    });
  });

  describe("readFileSync()", () => {
    let server: sinon.SinonFakeServer;
    beforeEach(() => {
      server = sinon.fakeServer.create();
      server.autoRespond = true;
      server.respondWith("GET", "https://example.com/views/hello.html", [
        200,
        { "Content-Type": "text/plain" },
        "hello {{name}}"
      ]);
      (global as any).XMLHttpRequest = sinon.useFakeXMLHttpRequest();
    });

    afterEach(() => {
      server.restore();
      delete (global as any).XMLHttpRequest;
    });

    test("should get corresponding text", function () {
      const html = fs.readFileSync("https://example.com/views/hello.html");
      return expect(html).toEqual("hello {{name}}");
    });

    test("should throw 404", () => {
      return expect(() => fs.readFileSync("https://example.com/not/exist.html")).toThrow("Not Found");
    });
  });
});
