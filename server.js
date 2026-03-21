
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bookingsRouter from "./src/routes/bookings.js";

dotenv.config();

const app = express();

// Allowed origins for CORS (comma-separated)
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow curl/postman
    const ok = allowed.some(a => origin === a || origin.startsWith(`${a}/`));
    cb(ok ? null : new Error("CORS blocked"), ok);
  },
  credentials: false
}));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/bookings", bookingsRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));
