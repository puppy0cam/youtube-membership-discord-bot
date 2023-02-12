import { denyFunctionality } from "./denyFunctionality.mjs";
import { getterFunctionality } from "./getterFunctionality.mjs";

const shieldCache = new WeakMap<object, object>();

export function createShieldedProxy<T extends Record<any, any>>(value: T): T {
  "use strict";
  const cached = shieldCache.get(value) as T | undefined;
  if (cached) {
    return cached;
  }
  const shield = new Proxy(value, {
    apply: denyFunctionality,
    construct: denyFunctionality,
    defineProperty: denyFunctionality,
    deleteProperty: denyFunctionality,
    get: getterFunctionality,
    getOwnPropertyDescriptor: denyFunctionality,
    getPrototypeOf: denyFunctionality,
    has: denyFunctionality,
    isExtensible: denyFunctionality,
    ownKeys: denyFunctionality,
    preventExtensions: denyFunctionality,
    set: denyFunctionality,
    setPrototypeOf: denyFunctionality,
  });
  shieldCache.set(value, shield).set(shield, shield);
  return shield;
}
