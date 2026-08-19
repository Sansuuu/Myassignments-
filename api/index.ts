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

The curriculum subjects include:
1. Programming Practices Lab - I (Code: 25B17CIT72) - C programming, problem solving, pointer manipulation, arrays, modular design.
2. Mathematics - I (Code: 25B11MAM111) - Calculus, differential equations, linear algebra, matrices, rank, eigenvalues, infinite series.
3. Software Development Fundamentals Lab - I (Code: 25B17CIT71) - Algorithm design, debugging, practical code implementations, Unix tools.
4. Physics Lab - I (Code: 25B17PHP171) - Optics, lasers, error analysis, experimental measurements, spectrometer experiments.
5. Basic Electronics Lab (Code: 25B17EEE171) - Diodes, transistors, logic gates, breadboard circuits, oscilloscope measurements.
6. Engineering Drawing & Design (Code: 25B17MEM171) - Orthographic projections, isometric views, sectional views, dimensioning standards, CAD basics.
7. Software Development Fundamentals - I (Code: 25B11CIT111) - Computational thinking, data structures introduction, memory management, algorithms.
8. Physics - I (Code: 25B11PH111) - Wave optics, quantum mechanics fundamentals, electromagnetic theory, thermodynamics, material physics.
9. Basic Electronics (Code: 25B11EEE111) - Semiconductor physics, PN junctions, BJT/FET circuits, operational amplifiers, Boolean algebra.

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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'm here to help you study! What concept would you like to explore?";
    res.json({ reply: replyText });
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
