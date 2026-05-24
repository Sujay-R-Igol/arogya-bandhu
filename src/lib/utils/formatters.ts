export function formatCaseId(uuid: string, regionCode: string = 'BGD'): string {
  if (!uuid) return `${regionCode}-0000`;
  // Extract numbers from UUID or hash it simply
  let numericPart = '';
  for (let i = 0; i < uuid.length; i++) {
    const code = uuid.charCodeAt(i);
    if (code >= 48 && code <= 57) {
      numericPart += uuid[i];
    }
  }
  // If we don't have enough numbers, pad with derived numbers
  if (numericPart.length < 4) {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
      hash = ((hash << 5) - hash) + uuid.charCodeAt(i);
      hash |= 0;
    }
    numericPart += Math.abs(hash).toString().padStart(4, '0');
  }
  
  return `${regionCode}-${numericPart.slice(0, 4)}`;
}
