
export function parseBigUint36(value: string) {
  let result = 0n;
  for (let i = 0; i < value.length; i++) {
    const digit = BigInt(Number.parseInt(value[i], 36));
    result = result * 36n + digit;
  }
  return result;
}
