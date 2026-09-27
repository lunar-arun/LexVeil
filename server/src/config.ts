import { z } from "zod";

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().optional().default(""),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-5"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(8 * 1024 * 1024),
  SESSION_TTL_MINUTES: z.coerce.number().int().positive().default(60),
  NODE_ENV: z.string().default("development")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast and loud rather than starting with silently-wrong config.
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const config = {
  anthropicApiKey: parsed.data.ANTHROPIC_API_KEY,
  anthropicModel: parsed.data.ANTHROPIC_MODEL,
  port: parsed.data.PORT,
  clientOrigins: parsed.data.CLIENT_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean),
  maxUploadBytes: parsed.data.MAX_UPLOAD_BYTES,
  sessionTtlMinutes: parsed.data.SESSION_TTL_MINUTES,
  isProduction: parsed.data.NODE_ENV === "production",
  mockMode: parsed.data.ANTHROPIC_API_KEY.trim().length === 0
};
