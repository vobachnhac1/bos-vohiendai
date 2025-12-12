export const DecimalColumnTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null): number | null =>
    value === null ? null : parseFloat(value),
};
