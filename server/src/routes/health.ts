import { Router } from "express";
import { config } from "../config.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    mode: config.mockMode ? "mock" : "live",
    time: new Date().toISOString()
  });
});

export default router;
