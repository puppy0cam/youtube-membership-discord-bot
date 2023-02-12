
export type FunctionArguments<T extends (...args: any[]) => any> = T extends (...args: infer A) => ReturnType<T> ? A : never;
