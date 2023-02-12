import { createShieldedProxy } from "./createShieldedProxy.mjs";

export function getterFunctionality<T extends object>(target: T, p: keyof T): unknown {
  "use strict";
  const value = target[p as keyof T];
  if (typeof value === "function" || typeof value === "object" && value !== null) {
    return createShieldedProxy(value);
  }
  return value;
}
