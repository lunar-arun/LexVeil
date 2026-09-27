import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";

let client: Anthropic | null = null;

/** Lazily constructs the Anthropic client only when a key is present. */
export function getAnthropicClient(): Anthropic {
  if (config.mockMode) {
    throw new Error("getAnthropicClient() called while running in mock mode");
  }
  if (!client) {
    client = new Anthropic({ apiKey: config.anthropicApiKey });
  }
  return client;
}

export const MODEL = config.anthropicModel;
