export function JSONParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('💩 ~ Json parse error:', error);

    return null;
  }
}
