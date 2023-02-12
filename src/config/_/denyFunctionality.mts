"use strict";

export function denyFunctionality(): never {
  "use strict";
  throw new Error("This is too dangerous to make accessible.");
}
