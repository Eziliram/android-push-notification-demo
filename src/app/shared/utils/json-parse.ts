export function JSONParse<ReturnType = Record<string, unknown>>(str: string): ReturnType | null {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.log('💩 ~ Json parse error:', error);

    return null;
  }
}
