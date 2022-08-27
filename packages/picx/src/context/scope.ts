import { Drop } from "../drop/drop";

export interface PlainObject {
  [key: string]: any;
  toPicx?: () => any;
}

export type Scope = PlainObject | Drop;
