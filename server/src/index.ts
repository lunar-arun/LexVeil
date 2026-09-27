import "dotenv/config";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { sessionStore } from "./services/sessionStore.js";

const app = createApp();
sessionStore.startSweeper();

app.listen(config.port, () => {
  console.log(`LexVeil server listening on port ${config.port}`);
  console.log(`Mode: ${config.mockMode ? "MOCK (no ANTHROPIC_API_KEY set)" : "LIVE"}`);
});
