import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { put } from "@vercel/blob";

dotenv.config();
const app = express();
app.use(cors());
app.use(cors({
  origin: "https://andylix-landing-page-edud.vercel.app" // Remplace par l'URL de ton site HTML
}));
app.use(express.json());

// url de la BD
const url = "https://rgwltzqanvsmgj3h.public.blob.vercel-storage.com/db.json";
const token="vercel_blob_rw_rGWLTZQANVsmgj3H_SJAVYkepBsrfVB5sc7zgqYig6wpzl1"


/*

ci dessous permet de modifier le code admin
*/
const PORT = process.env.PORT || 4000;
const ADMIN_KEY = process.env.ADMIN_KEY || "andylix123";

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

// Helpers
async function  readDB() {
  const reponse = await fetch(url);
  const data = await reponse.json();
  
  return data;
}

const staticDb = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));

async function writeDB(data) {
  
  const jsonString = JSON.stringify(data||staticDb);
  const blob = await put('db.json', jsonString, {
    access: 'public',
    addRandomSuffix: false, // Important pour garder le même nom de fichier
    allowOverwrite: true, // <--- AJOUTE CETTE LIGNE
    token:token
  });

  return blob.url;
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
app.post("/api/waitlist", async (req, res) => {
  const { name = "", email = "", role = "client" } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "Email invalide." });
  }

  const db = await readDB();
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

// poiint essentiel
  db.waitlist.push(entry);
  await writeDB(db);

  return res.status(201).json({ ok: true, entry });
});

/**
 * SURVEY
 * body: { persona, frequency, pain, intent, service, comment? }
 */
app.post("/api/survey", async (req, res) => {
  const {
    persona,
    frequency,
    pain,
    intent,
    service,
    comment = "",
  } = req.body;

  const validPersona = ["client", "pme", "artisan"];
  const validFrequency = ["rare", "parfois", "souvent"];
  const validPain = ["confiance", "temps", "prix", "délais"];
  const validIntent = ["oui", "peut-être", "non"];

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

  const db =  await readDB()
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

  // point essentiel
  db.surveys.push(entry);
  await writeDB(db);

  return res.status(201).json({ ok: true, entry });
});

/**
 * ADMIN VIEW (simple)
 * GET /api/admin?key=...
 */
// ADMIN VIEW (simple) - key in header: x-admin-key
app.get("/api/admin", async (req, res) => {
  const key = String(req.headers["x-admin-key"] || "");
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
// point essensiel
  const db = await readDB();
  return res.json({
    ok: true,
    totalWaitlist: db.waitlist.length,
    totalSurveys: db.surveys.length,
    waitlist: db.waitlist,
    surveys: db.surveys,
  });
});

// Optional: stats only (lighter)
app.get("/api/stats", async (req, res) => {
  // point essensiel

  const db =  await readDB();

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
