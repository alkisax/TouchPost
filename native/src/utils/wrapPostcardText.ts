const MIN_LINE_LENGTH = 25;
const MAX_LINE_LENGTH = 30;
const MAX_LINES = 10;

export const wrapPostcardText = (text: string): string[] => {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word !== '');

  const lines: string[] = [];
  let currentLine = '';

  while (words.length > 0 && lines.length < MAX_LINES) {
    const word = words.shift();

    if (!word) {
      break;
    }

    if (currentLine === '') {
      if (word.length <= MAX_LINE_LENGTH) {
        currentLine = word;
        continue;
      }

      const firstPart = `${word.slice(0, MAX_LINE_LENGTH - 1)}-`;
      const remainingPart = word.slice(MAX_LINE_LENGTH - 1);

      lines.push(firstPart);
      words.unshift(remainingPart);

      continue;
    }

    const candidateLine = `${currentLine} ${word}`;

    if (candidateLine.length <= MAX_LINE_LENGTH) {
      currentLine = candidateLine;
      continue;
    }

    if (
      currentLine.length >= MIN_LINE_LENGTH &&
      currentLine.length <= MAX_LINE_LENGTH
    ) {
      lines.push(currentLine);
      currentLine = '';
      words.unshift(word);

      continue;
    }

    const availableChars =
      MAX_LINE_LENGTH - currentLine.length - 1;

    if (availableChars <= 1) {
      lines.push(currentLine);
      currentLine = '';
      words.unshift(word);

      continue;
    }

    const firstPart = word.slice(0, availableChars - 1);
    const remainingPart = word.slice(availableChars - 1);

    currentLine = `${currentLine} ${firstPart}-`;
    lines.push(currentLine);

    currentLine = '';

    if (remainingPart !== '') {
      words.unshift(remainingPart);
    }
  }

  if (
    currentLine !== '' &&
    lines.length < MAX_LINES
  ) {
    lines.push(currentLine);
  }

  return lines;
};