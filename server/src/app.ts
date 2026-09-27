import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import documentsRouter from "./routes/documents.js";
import healthRouter from "./routes/health.js";
import { errorHandler } from "./middleware/errorHandler.js";

// When built for production, the client's static bundle lives alongside the
// server at ../../client/dist (server/dist/app.js -> repo root -> client/dist).
// Serving it from the same Express process means one deployable service and
// one origin, so the browser's relative `/api/...` fetches keep working
// without any cross-origin configuration.
const CLIENT_DIST_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: config.clientOrigins,
      methods: ["GET", "POST", "DELETE"],
      allowedHeaders: ["Content-Type"]
    })
  );
  app.use(express.json({ limit: "100kb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/documents", documentsRouter);

  const canServeClient = config.isProduction && fs.existsSync(path.join(CLIENT_DIST_DIR, "index.html"));
  if (canServeClient) {
    app.use(express.static(CLIENT_DIST_DIR));
    // SPA fallback: any non-API GET request falls through to index.html so
    // client-side routing (and plain page refreshes) keep working.
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(CLIENT_DIST_DIR, "index.html"));
    });
  }

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found." });
  });

  app.use(errorHandler);

  return app;
}
