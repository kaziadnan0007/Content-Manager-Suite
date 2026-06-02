import { Router } from "express";
import { db } from "@workspace/db";
import { uploadsTable } from "@workspace/db";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "..", "..", "..", "attached_assets", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

router.post("/upload", async (req, res) => {
  try {
    const { data, filename, mimeType } = req.body as {
      data: string;
      filename: string;
      mimeType: string;
    };

    if (!data || !filename) {
      res.status(400).json({ error: "data and filename are required" });
      return;
    }

    const base64Data = data.replace(/^data:[^;]+;base64,/, "");
    const ext = path.extname(filename) || ".jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

    const url = `/api/uploads/${uniqueName}`;

    await db.insert(uploadsTable).values({
      filename: uniqueName,
      originalName: filename,
      mimeType: mimeType ?? "image/jpeg",
      url,
    });

    res.json({ url, filename: uniqueName });
  } catch (err) {
    req.log.error({ err }, "Upload error");
    res.status(500).json({ error: "Upload failed" });
  }
});

router.get("/uploads/:filename", (req, res) => {
  try {
    const filename = req.params["filename"] as string;
    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    res.sendFile(filePath);
  } catch (err) {
    req.log.error({ err }, "Serve upload error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
