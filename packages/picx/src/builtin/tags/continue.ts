import { Emitter, Context } from "../../types";

export default {
  render(ctx: Context, emitter: Emitter) {
    emitter["continue"] = true;
  }
};
