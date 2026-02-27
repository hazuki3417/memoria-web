export const defineFieldObject = <T extends readonly string[]>(
  fields: T,
): { readonly [K in T[number]]: K } => {
  return Object.fromEntries(fields.map((field) => [field, field])) as {
    readonly [K in T[number]]: K;
  };
};
