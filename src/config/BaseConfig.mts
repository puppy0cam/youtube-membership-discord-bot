import { inspect } from "node:util";
import { denyFunctionality } from "./_/denyFunctionality.mjs";

export class BaseConfig {

}

for (const key of [inspect.custom, "toString", "toJSON", "hasOwnProperty", "propertyIsEnumerable", "toLocaleString", "valueOf"] as const) {
  Object.defineProperty(BaseConfig.prototype, key, {
    value: denyFunctionality,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}

Object.freeze(BaseConfig.prototype);
Object.freeze(BaseConfig);
