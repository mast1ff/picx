/**
 * The date interface Picx uses inherited from Picx.
 * Basically a subset of JavaScript Date,
 * it's defined abstractly here to allow different implementation
 */
export interface PicxDate {
  getTime(): number;
  getMilliseconds(): number;
  getSeconds(): number;
  getMinutes(): number;
  getHours(): number;
  getDay(): number;
  getDate(): number;
  getMonth(): number;
  getFullYear(): number;
  getTimezoneOffset(): number;
  toLocaleTimeString(): string;
  toLocaleDateString(): string;
}
