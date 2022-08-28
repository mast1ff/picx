import { LRU } from "../../src/cache/lru";

describe("Cache:LRU", () => {
  test("should perform read, write", () => {
    const lru = new LRU(2);
    expect(lru.limit).toEqual(2);

    lru.write("test1", "TEST1");
    lru.write("test2", "TEST2");
    expect(lru.read("test1")).toEqual("TEST1");
    expect(lru.read("test2")).toEqual("TEST2");
  });

  test("hould perform clear", () => {
    const lru = new LRU(2);
    lru.write("test1", "TEST1");
    lru.write("test2", "TEST2");
    expect(lru.size).toEqual(2);
    lru.clear();
    expect(lru.size).toEqual(0);
    expect(lru.read("test1")).toBeUndefined();
  });

  test("should remove lrc item when full (limit: -1)", () => {
    const lru = new LRU(-1);
    lru.write("test1", "TEST1");
    lru.write("test2", "TEST2");
    expect(lru.size).toEqual(0);
    expect(lru.read("test1")).toBeUndefined();
    expect(lru.read("test2")).toBeUndefined();
  });

  test("should remove lrc item when full (limit: 1)", () => {
    const lru = new LRU(1);
    lru.write("test1", "TEST1");
    lru.write("test2", "TEST2");
    expect(lru.size).toEqual(1);
    expect(lru.read("test1")).toBeUndefined();
    expect(lru.read("test2")).toEqual("TEST2");
  });

  test("should remove lrc item when full (limit: 2)", () => {
    const lru = new LRU(2);
    expect(lru.size).toEqual(0);
    lru.write("test1", "TEST1");
    expect(lru.size).toEqual(1);
    lru.write("test2", "TEST2");
    expect(lru.size).toEqual(2);
    lru.write("test3", "TEST3");
    expect(lru.size).toEqual(2);
    expect(lru.read("test1")).toBeUndefined();
    expect(lru.read("test2")).toEqual("TEST2");
    expect(lru.read("test3")).toEqual("TEST3");
  });

  test("should overwrite item the with same key", () => {
    const lru = new LRU(2);
    lru.write("test1", "TEST1");
    expect(lru.size).toEqual(1);
    lru.write("test2", "TEST2");
    expect(lru.size).toEqual(2);
    expect(lru.read("test1")).toEqual("TEST1");
  });
});
