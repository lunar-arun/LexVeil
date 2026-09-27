import type Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";
import { getAnthropicClient, MODEL } from "./llmClient.js";
import { retrieveRelevantClauses } from "./retrieval.js";
import { mockAnswerQuestion } from "../mock/mockQa.js";
import type { ChatCitation, ChatMessage, Clause } from "../types.js";

const QA_TOOL_NAME = "record_grounded_answer";

const qaTool = {
  name: QA_TOOL_NAME,
  description: "Records a grounded answer to the user's question about their document, with citations.",
  input_schema: {
    type: "object" as const,
    properties: {
      answer: {
        type: "string",
        description: "A clear, plain-language answer grounded only in the provided clauses."
      },
      citedClauseIndexes: {
        type: "array",
        items: { type: "integer" },
        description: "Indexes (from the provided numbered clauses) that support the answer."
      },
      lowConfidence: {
        type: "boolean",
        description: "True if the provided clauses do not clearly answer the question, or it needs a professional."
      }
    },
    required: ["answer", "citedClauseIndexes", "lowConfidence"]
  }
};

const SYSTEM_PROMPT = `You answer questions about a specific legal document (lease, gig platform terms, or \
similar contract) for a non-lawyer. You must ONLY use the numbered clauses provided to you as context - do not \
rely on general knowledge about "typical" contracts, and do not invent clauses. If the provided clauses do not \
contain a clear answer, say so plainly and set lowConfidence to true rather than guessing. Always cite the \
clause numbers your answer relies on. You are not a lawyer and must not present your answer as definitive legal \
advice; suggest professional review for anything consequential or ambiguous.`;

export async function answerQuestion(question: string, clauses: Clause[]): Promise<ChatMessage> {
  const relevant = retrieveRelevantClauses(question, clauses, 6);

  if (config.mockMode) {
    return mockAnswerQuestion(question, clauses);
  }

  if (relevant.length === 0) {
    return {
      role: "assistant",
      content: "This document doesn't seem to contain any clauses, so I have nothing to ground an answer in.",
      lowConfidence: true,
      createdAt: new Date().toISOString()
    };
  }

  const numberedContext = relevant.map((c) => `[${c.index}] ${c.text}`).join("\n\n");

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [qaTool],
    tool_choice: { type: "tool", name: QA_TOOL_NAME },
    messages: [
      {
        role: "user",
        content: `Relevant clauses from the document:\n\n${numberedContext}\n\nQuestion: ${question}`
      }
    ]
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    return {
      role: "assistant",
      content: "I wasn't able to generate a grounded answer for that question. Please try rephrasing it.",
      lowConfidence: true,
      createdAt: new Date().toISOString()
    };
  }

  const parsed = toolUse.input as {
    answer: string;
    citedClauseIndexes: number[];
    lowConfidence: boolean;
  };

  const clauseByIndex = new Map(clauses.map((c) => [c.index, c]));
  const citations: ChatCitation[] = parsed.citedClauseIndexes
    .map((idx) => clauseByIndex.get(idx))
    .filter((c): c is Clause => Boolean(c))
    .map((c) => ({ clauseId: c.id, snippet: c.text.slice(0, 240) }));

  return {
    role: "assistant",
    content: parsed.answer,
    citations,
    lowConfidence: parsed.lowConfidence,
    createdAt: new Date().toISOString()
  };
}
