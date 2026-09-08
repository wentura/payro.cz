/**
 * Parse a request body with a Zod schema and return a Czech error message.
 */
export function parseWithSchema(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Neplatná data",
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
