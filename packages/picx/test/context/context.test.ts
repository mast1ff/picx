import { Context } from "../../src/context/context";
import type { Scope } from "../../src/context/scope";

describe("Context:context", () => {
  let ctx: Context;
  let scope: Scope;
  beforeEach(() => {
    scope = {
      str: "str",
      one: 1,
      obj1: { first: "f", last: "l" },
      map: new Map([["test", "TEST"]]),
      func: () => "Func",
      objFunc: () => ({ p: "p" }),
      obj2: { "Mr.Smith": "John", arr: ["a", "b"] },
      arr: ["a", "b", "c", "d"]
    };

    ctx = new Context(scope);
  });

  describe("get()", () => {
    test("should get direct property", () => {
      expect(ctx.get(["str"])).toEqual("str");
    });

    test("should read nested property", () => {
      expect(ctx.get(["obj1", "first"])).toEqual("f");
      expect(ctx.get(["obj1", "last"])).toEqual("l");
    });

    test("undefined property should yield undefined", () => {
      expect(ctx.get(["undefined"])).toEqual(undefined);
      expect(ctx.get([false as any])).toEqual(undefined);
    });

    test("should respect to toPicx", () => {
      const scope = new Context({
        foo: {
          toPicx: () => ({ bar: "BAR" }),
          bar: "bar"
        }
      });
      expect(scope.get(["foo", "bar"])).toEqual("BAR");
    });

    test("should undefined when not exist", () => {
      expect(ctx.get(["test1", "test2", "test3"])).toEqual(undefined);
    });

    test("should string length as size", () => {
      expect(ctx.get(["str", "size"])).toEqual(3);
    });

    test("should array length as size", () => {
      expect(ctx.get(["obj2", "arr", "size"])).toEqual(2);
    });

    test("should map size as size", () => {
      expect(ctx.get(["map", "size"])).toEqual(1);
    });

    test("should undefined if not have a size", () => {
      expect(ctx.get(["one", "size"])).toEqual(undefined);
      expect(ctx.get(["nonexist", "size"])).toEqual(undefined);
    });

    test("should read .first of array", () => {
      expect(ctx.get(["obj2", "arr", "first"])).toEqual("a");
    });

    test("should read .last of array", () => {
      expect(ctx.get(["obj2", "arr", "last"])).toEqual("b");
    });

    test("should read element of array", () => {
      expect(ctx.get(["arr", 1])).toEqual("b");
    });

    test("should read element of array from end", () => {
      expect(ctx.get(["arr", -2])).toEqual("c");
    });

    test("should call function", () => {
      expect(ctx.get(["func"])).toEqual("Func");
    });

    test("should call function before read nested property", () => {
      expect(ctx.get(["objFunc", "p"])).toEqual("p");
    });
  });

  describe("getFromScope()", () => {
    test("should support string", () => {
      expect(ctx.getFromScope({ obj: { foo: "FOO" } }, "obj.foo")).toEqual("FOO");
    });
  });

  describe("strictVariables", () => {
    beforeEach(() => {
      ctx = new Context(ctx, {
        strictVariables: true
      } as any);
    });

    test("should throw when variable not defined", () => {
      expect(() => ctx.get(["undefined"])).toThrow(/undefined variable: undefined/);
    });

    test("should throw when deep variable not exist", () => {
      ctx.push({ foo: "FOO" });
      expect(() => ctx.get(["foo", "bar", "not", "defined"])).toThrow(/undefined variable: foo.bar/);
    });

    test("should throw when itself not defined", () => {
      ctx.push({ foo: "FOO" });
      expect(() => ctx.get(["foo", "BAR"])).toThrow(/undefined variable: foo.BAR/);
    });

    test("should find variable in parent scope", () => {
      ctx.push({ foo: "foo" });
      ctx.push({
        bar: "bar"
      });
      expect(ctx.get(["foo"])).toEqual("foo");
    });
  });

  describe("ownPropertyOnly", () => {
    let ctx: Context;
    beforeEach(() => {
      ctx = new Context(ctx, {
        ownPropertyOnly: true
      } as any);
    });

    test("should undefined for prototype object property", () => {
      ctx.push({ foo: Object.create({ bar: "BAR" }) });
      expect(ctx.get(["foo", "bar"])).toEqual(undefined);
    });

    test("should undefined for Array.prototype.reduce", () => {
      ctx.push({ foo: [] });
      expect(ctx.get(["foo", "reduce"])).toEqual(undefined);
    });

    test("should undefined for function prototype property", () => {
      function Foo() {}
      Foo.prototype.bar = "BAR";
      ctx.push({ foo: new (Foo as any)() });
      expect(ctx.get(["foo", "bar"])).toEqual(undefined);
    });

    test("should allow function constructor properties", () => {
      function Foo(this: any) {
        this.bar = "BAR";
      }
      ctx.push({ foo: new (Foo as any)() });
      expect(ctx.get(["foo", "bar"])).toEqual("BAR");
    });

    test("should undefined for class method", () => {
      class Foo {
        bar() {}
      }
      ctx.push({ foo: new Foo() });
      expect(ctx.get(["foo", "bar"])).toEqual(undefined);
    });

    test("should allow class property", () => {
      class Foo {
        bar = "BAR";
      }
      ctx.push({ foo: new Foo() });
      expect(ctx.get(["foo", "bar"])).toEqual("BAR");
    });

    test("should allow Array.prototype.length", () => {
      ctx.push({ foo: [1, 2] });
      expect(ctx.get(["foo", "length"])).toEqual(2);
    });

    test("should allow size to access Array.prototype.length", () => {
      ctx.push({ foo: [1, 2] });
      expect(ctx.get(["foo", "size"])).toEqual(2);
    });

    test("should allow size to access Set.prototype.size", () => {
      ctx.push({ foo: new Set([1, 2]) });
      expect(ctx.get(["foo", "size"])).toEqual(2);
    });

    test("should allow size to access Object key count", () => {
      ctx.push({ foo: { bar: "BAR", coo: "COO" } });
      expect(ctx.get(["foo", "size"])).toEqual(2);
    });

    test("should throw when property is hidden and strictVariables is true", () => {
      ctx = new Context(ctx, {
        ownPropertyOnly: true,
        strictVariables: true
      } as any);
      ctx.push({ foo: Object.create({ bar: "BAR" }) });
      expect(() => ctx.get(["foo", "bar"])).toThrow(/undefined variable: foo.bar/);
    });
  });

  describe(".getAll()", () => {
    test("should get all properties when arguments empty", () => {
      expect(ctx.getAll()).toEqual(scope);
    });
  });

  describe(".push()", () => {
    test("should push scope", () => {
      ctx.push({ bar: "bar" });
      ctx.push({
        foo: "foo"
      });
      expect(ctx.get(["foo"])).toEqual("foo");
      expect(ctx.get(["bar"])).toEqual("bar");
    });

    test("should hide deep properties by push", () => {
      ctx.push({ bar: { bar: "bar" } });
      ctx.push({ bar: { foo: "foo" } });
      expect(ctx.get(["bar", "foo"])).toEqual("foo");
      expect(ctx.get(["bar", "bar"])).toEqual(undefined);
    });
  });

  describe(".pop()", () => {
    test("should pop scope", () => {
      ctx.push({
        foo: "foo"
      });
      ctx.pop();
      expect(ctx.get(["foo"])).toEqual(undefined);
    });
  });
});
