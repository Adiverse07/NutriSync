import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { getAuthUrl, getAccessToken } from "./src/googlefitapi/auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS (you can restrict to your frontend domain if deployed)
app.use(cors());
app.use(express.json());

// Optional: Serve frontend if you build it with `vite build`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "dist"))); // ← only needed for production

// GET /api/googlefit/url → Returns Google Fit OAuth URL
app.get("/api/googlefit/url", (req, res) => {
  try {
    const url = getAuthUrl();
    res.json({ authUrl: url });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate auth URL", details: error.message });
  }
});

// GET /api/googlefit/callback → Exchanges code for tokens
app.get("/api/googlefit/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is missing" });
  }

  try {
    const tokens = await getAccessToken(code);
    res.json({ tokens });
  } catch (error) {
    console.error("Token exchange error:", error);
    res.status(500).json({ error: "Failed to exchange code for tokens", details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
