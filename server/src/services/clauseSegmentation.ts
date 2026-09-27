const MIN_CLAUSE_LENGTH = 25;
const MAX_CLAUSES = 120;
const MAX_BLOCK_LENGTH = 1500;

/**
 * Splits raw extracted document text into clause-like segments.
 *
 * Legal documents vary wildly in formatting, so this uses a layered
 * heuristic rather than assuming a single numbering scheme:
 *  1. Normalize whitespace/line endings.
 *  2. Split on blank lines (paragraph breaks) and on lines that start a
 *     new numbered/lettered clause (e.g. "1.", "2.1", "Section 3", "(a)").
 *  3. Drop fragments too short to be a meaningful clause (e.g. stray
 *     headers or page numbers) and cap the total to keep downstream LLM
 *     calls bounded in size and cost.
 */
export function segmentIntoClauses(rawText: string): string[] {
  const normalized = rawText.replace(/\r\n/g, "\n").replace(/ /g, " ");

  const lines = normalized.split("\n");
  const clauseStartPattern = /^\s*(\d{1,3}(\.\d{1,3})*[.)]|\(?[a-zA-Z]\)|Section\s+\d+|Article\s+\d+)\s+\S/;

  const blocks: string[] = [];
  let current: string[] = [];

  const flush = () => {
    const text = current.join(" ").replace(/\s+/g, " ").trim();
    if (text.length >= MIN_CLAUSE_LENGTH) {
      blocks.push(text);
    }
    current = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      flush();
      continue;
    }

    if (clauseStartPattern.test(line) && current.length > 0) {
      flush();
    }

    current.push(trimmed);
  }
  flush();

  if (blocks.length === 0) {
    return [];
  }

  // Degenerate documents (e.g. an unstructured wall of text with no
  // numbering or paragraph breaks) can produce one giant block; split any
  // oversized block into fixed-size chunks so downstream LLM calls stay
  // bounded and each "clause" stays readable.
  const sizedBlocks = blocks.flatMap((block) =>
    block.length > MAX_BLOCK_LENGTH ? chunkBySize(block, Math.ceil(block.length / MAX_BLOCK_LENGTH)) : [block]
  );

  if (sizedBlocks.length <= MAX_CLAUSES) {
    return sizedBlocks;
  }

  // Far too many tiny clauses (e.g. line-by-line formatting): fall back to
  // fixed-size chunking of the full text to cap the total count.
  return chunkBySize(sizedBlocks.join(" "), MAX_CLAUSES);
}

function chunkBySize(text: string, targetChunks: number): string[] {
  const chunkLength = Math.max(200, Math.ceil(text.length / targetChunks));
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkLength) {
    const chunk = text.slice(i, i + chunkLength).trim();
    if (chunk.length >= MIN_CLAUSE_LENGTH) {
      chunks.push(chunk);
    }
  }
  return chunks;
}
