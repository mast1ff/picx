import { StreamedEmitter } from "../../src/emitters/streamed-emitter-browser";

describe("Emitters:StreamedEmitter (browser)", () => {
  test("should throw when try to constructing", () => {
    expect(() => new StreamedEmitter()).toThrow(/streaming not supported/);
  });
});
