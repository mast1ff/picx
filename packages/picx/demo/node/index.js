const { Picx } = require("picx");

const engine = new Picx({
  root: __dirname,
  layouts: "./layouts",
  partials: "./partials",
  globals: { title: "Picx demo" }
});

const ctx = {
  todos: ["fork and clone", "make it better", "make a pull request"]
};

engine.registerTag("header", {
  parse(token) {
    const [key, val] = token.args.split(":");
    this[key] = val;
  },
  async render(scope, emitter) {
    const title = await this.picx.evalValue(this.content, scope);
    emitter.write(`<h1>${title}</h1>`);
  }
});

async function main() {
  console.log("========== renderFile ===========");
  const html = await engine.renderFile("todolist.html", ctx);
  console.log(html);

  console.log("=========== Streamed ===========");
  const tpls = await engine.parseFile("todolist.html");
  engine
    .renderToNodeStream(tpls, ctx)
    .on("data", (data) => process.stdout.write(data))
    .on("end", () => console.log(""));
}

main();
