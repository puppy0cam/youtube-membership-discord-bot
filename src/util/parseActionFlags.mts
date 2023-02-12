import { parseBigUint36 } from "./parseBigUint36.mjs";

export interface ActionFlagHandler<T> {
  readonly id: bigint;
  parse: (action_flags: bigint) => T;
  encode: (action_flags: T) => bigint;
}

const action_flag_handlers = new Map<bigint, ActionFlagHandler<any>>();

export function parseActionFlags(action_flags_string: string) {
  let action_flags = parseBigUint36(action_flags_string);
  const action_flag_argument_version = action_flags & 0xFFFFFFFFn;
  action_flags >>= 32n;
  const handler = action_flag_handlers.get(action_flag_argument_version);
  if (handler == null) {
    throw new Error("Unknown action flag argument version.");
  }
  return {
    type: action_flag_argument_version,
    value: handler.parse(action_flags),
  };
}

export function registerActionFlagHandler<T>(action_flag_argument_version: bigint, handler: ActionFlagHandler<T>) {
  const existing_handler = action_flag_handlers.get(action_flag_argument_version);
  if (existing_handler != null && existing_handler !== handler) {
    throw new Error("Action flag argument version already registered.");
  }
  action_flag_handlers.set(action_flag_argument_version, handler);
}
