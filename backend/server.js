import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const ADMIN_KEY = process.env.ADMIN_KEY || "admin";

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

// Helpers
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { waitlist: [], surveys: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    return { waitlist: [], surveys: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Health
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

/**
 * WAITLIST
 * body: { name?:string, email:string, role?: 'client'|'artisan'|'pme' }
 */
app.post("/api/waitlist", (req, res) => {
  const { name = "", email = "", role = "client" } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "Email invalide." });
  }

  const db = readDB();
  const exists = db.waitlist.some(
    (x) => x.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (exists) {
    return res.status(409).json({ ok: false, error: "Cet email est déjà inscrit." });
  }

  const entry = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    email: String(email).trim(),
    role: ["client", "artisan", "pme"].includes(role) ? role : "client",
    createdAt: new Date().toISOString(),
  };

  db.waitlist.push(entry);
  writeDB(db);

  return res.status(201).json({ ok: true, entry });
});

/**
 * SURVEY
 * body: { persona, frequency, pain, intent, service, comment? }
 */
app.post("/api/survey", (req, res) => {
  const {
    persona,
    frequency,
    pain,
    intent,
    service,
    comment = "",
  } = req.body;

  const validPersona = ["client", "pme", "artisan"];
  const validFrequency = ["rare", "sometimes", "often"];
  const validPain = ["trust", "time", "price", "availability"];
  const validIntent = ["yes", "maybe", "no"];

  if (!validPersona.includes(persona)) {
    return res.status(400).json({ ok: false, error: "persona invalide." });
  }
  if (!validFrequency.includes(frequency)) {
    return res.status(400).json({ ok: false, error: "frequency invalide." });
  }
  if (!validPain.includes(pain)) {
    return res.status(400).json({ ok: false, error: "pain invalide." });
  }
  if (!validIntent.includes(intent)) {
    return res.status(400).json({ ok: false, error: "intent invalide." });
  }
  if (!service || typeof service !== "string") {
    return res.status(400).json({ ok: false, error: "service invalide." });
  }

  const db = readDB();

  const entry = {
    id: crypto.randomUUID(),
    persona,
    frequency,
    pain,
    intent,
    service,
    comment: String(comment).trim(),
    createdAt: new Date().toISOString(),
  };

  db.surveys.push(entry);
  writeDB(db);

  return res.status(201).json({ ok: true, entry });
});

/**
 * ADMIN VIEW (simple)
 * GET /api/admin?key=...
 */
// ADMIN VIEW (simple) - key in header: x-admin-key
app.get("/api/admin", (req, res) => {
  const key = String(req.headers["x-admin-key"] || "");
  if (key !== "12345") {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const db = readDB();
  return res.json({
    ok: true,
    totalWaitlist: db.waitlist.length,
    totalSurveys: db.surveys.length,
    waitlist: db.waitlist,
    surveys: db.surveys,
  });
});

// Optional: stats only (lighter)
app.get("/api/stats", (req, res) => {
  const db = readDB();

  // petit résumé utile
  const byPersona = db.surveys.reduce((acc, s) => {
    acc[s.persona] = (acc[s.persona] || 0) + 1;
    return acc;
  }, {});

  const byService = db.surveys.reduce((acc, s) => {
    acc[s.service] = (acc[s.service] || 0) + 1;
    return acc;
  }, {});
 console.log(byPersona,byService)
  res.json({
    ok: true,
    totalWaitlist: db.waitlist.length,
    totalSurveys: db.surveys.length,
    byPersona,
    byService,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
