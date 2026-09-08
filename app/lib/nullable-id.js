/**
 * Convert empty form values to null before writing smallint/uuid columns.
 */
export function toNullableInt(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toNullableUuid(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return value;
}
