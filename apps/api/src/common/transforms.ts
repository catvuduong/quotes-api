// Trims text values and turns blank ones into undefined, so `?author=` means "no filter".
export const trimmed = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || undefined : value;
