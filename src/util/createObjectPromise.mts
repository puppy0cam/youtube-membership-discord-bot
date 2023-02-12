
export interface IObjectPromise<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

export function createObjectPromise<T>(): IObjectPromise<T> {
  let resolve: undefined | ((value: T) => void);
  let reject: undefined | ((reason?: any) => void);
  const promise = new Promise<T>((res, rej) => {
    resolve = res as (value: T) => void;
    reject = rej;
  });
  return {
    promise,
    resolve: resolve as (value: T) => void,
    reject: reject as (reason?: any) => void,
  };
}
