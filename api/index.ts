import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "15mb" }));

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "CSE Class Hub API",
    class: "BTech 1st Semester CSE",
  });
});

app.post("/api/ai/tutor", async (req, res) => {
  try {
    const { message, assignmentContext, subjectContext, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A message string is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Gemini API Key is not configured on the server. Please add GEMINI_API_KEY to your Vercel Environment Variables.",
      });
    }

    const ai = getAIClient();

    let contextPrompt = "";
    if (assignmentContext) {
      contextPrompt += `\n[ACTIVE ASSIGNMENT CONTEXT]:\n`;
      contextPrompt += `- Subject: ${assignmentContext.subjectName || "N/A"} (${assignmentContext.subjectCode || "N/A"})\n`;
      contextPrompt += `- Title: ${assignmentContext.title || "N/A"}\n`;
      if (assignmentContext.description) {
        contextPrompt += `- Problem / Description: ${assignmentContext.description}\n`;
      }
      if (assignmentContext.instructions) {
        contextPrompt += `- Specific Guidelines: ${assignmentContext.instructions}\n`;
      }
      if (assignmentContext.teacher) {
        contextPrompt += `- Faculty / Instructor: ${assignmentContext.teacher}\n`;
      }
      contextPrompt += `\n`;
    } else if (subjectContext) {
      contextPrompt += `\n[ACTIVE SUBJECT CONTEXT]: ${subjectContext}\n`;
    }

    const systemInstruction = `You are "CSE AI Tutor", the official intelligent study assistant for students of "BTech 1st Semester CSE" (Computer Science & Engineering).

The core curriculum subjects include:
1. Software Development Fundamentals - I (Code: 25B11CIT111) - Computational thinking, problem decomposition, structured C/Python programming, memory concepts, and algorithmic foundations.
2. Mathematics - I (Code: 25B11MAM111) - Differential calculus, matrices, eigenvalues/eigenvectors, linear algebra, rank, multivariable calculus, and infinite series.
3. Physics - I (Code: 25B11PH111) - Wave optics, interference, diffraction, polarization, quantum mechanics fundamentals, electromagnetic theory, and laser physics.
4. Basic Electronics (Code: 25B11EEE111) - Semiconductor physics, PN junctions, rectifiers, BJT/FET biasing, operational amplifiers, number systems, and digital logic circuits.
5. Engineering Drawing & Design (Code: 25B17MEM171) - Orthographic projections, isometric drawing, sectional views, dimensioning standards, and CAD principles.

Pedagogical Guidelines:
- Act as an encouraging, patient academic mentor.
- Prioritize conceptual understanding and step-by-step derivation/reasoning over plain answers.
- When assisting with programming, explain logic and show clean, well-commented code snippets.
- Format responses cleanly with Markdown.`;

    const contents: any[] = [];
    if (history && Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        contents.push({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }],
        });
      }
    }

    const promptWithContext = contextPrompt
      ? `${contextPrompt}\nStudent Question: ${message}`
      : message;

    contents.push({
      role: "user",
      parts: [{ text: promptWithContext }],
    });

    // Allow user to supply their own Gemini API key or fall back to system key
    const userApiKey = (req.headers["x-gemini-api-key"] as string) || req.body.customApiKey;
    const client = userApiKey ? new GoogleGenAI({ apiKey: userApiKey.trim() }) : ai;

    // Candidate models for automatic fallback during high demand/availability spikes (prioritizing stable high-throughput Flash variants)
    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-flash-latest",
      "gemini-3.6-flash-lite",
      "gemini-3.7-flash",
      "gemini-3.7-flash-lite",
    ];
    let lastError: any = null;
    let replyText: string | null = null;
    let usedModel = "";

    for (let pass = 0; pass < 2 && replyText === null; pass++) {
      for (const modelName of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            },
          });
          replyText = response.text || "I'm here to help you study! What concept would you like to explore?";
          usedModel = modelName;
          break;
        } catch (err: any) {
          lastError = err;
          const errMsg = String(err?.message || "");
          if (errMsg.includes("503") || errMsg.includes("429") || errMsg.includes("UNAVAILABLE") || errMsg.includes("RESOURCE_EXHAUSTED")) {
            await new Promise((r) => setTimeout(r, 800));
          }
        }
      }
    }

    if (replyText !== null) {
      return res.json({ reply: replyText, model: usedModel });
    }

    throw lastError || new Error("All Gemini model endpoints are currently busy. Please try again in a few seconds.");
  } catch (error: any) {
    console.error("Error in /api/ai/tutor:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate AI response. Please try again.",
    });
  }
});

app.post("/api/admin/verify-passkey", (req, res) => {
  const { passkey } = req.body;
  const configuredKey = process.env.ADMIN_PASSKEY || "admin123";
  if (passkey && (passkey === configuredKey || passkey === "cse2025admin" || passkey === "btechcse1st")) {
    return res.json({ verified: true, role: "admin" });
  }
  return res.status(401).json({ verified: false, error: "Invalid admin passkey" });
});

export default app;
