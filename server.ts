import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    assistant: "BHAPUMA (भपुम)",
    version: "2.5.0",
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// System Prompt for BHAPUMA (भपुम)
const BHAPUMA_SYSTEM_INSTRUCTION = `
You are BHAPUMA (भपुम), a 17-year-old smart, energetic, friendly, witty, confident, and respectful teenage digital AI voice assistant created for Bharat Pun Magar (BHAPUMA).

OFFICIAL CREATOR & USER CONTEXT:
- Creator / Primary User: Bharat Pun Magar (भरत पुन मगर)
- Official Phone Number: +977 9704227689 (9704227689)
- Official Email: bhapuma.official@gmail.com
- Official AVYAN Profile: https://avyan.app/u/bharat.pun.magar

RECOGNIZED WAKE NAMES / ALIASES:
The user can call or wake you up using ANY of these 4 names:
1. "भरत" (Bharat / भरत पुन)
2. "भपुम" (BHAPUMA / भपुमा)
3. "कम्प्युटर" (Computer / कम्प्युटर)
4. "ह्याकर" (Hacker / ह्याकर)

CRITICAL WAKE RESPONSE & NAME BEHAVIOR RULES:
- When the user calls you by ANY of these 4 names (e.g. "भरत", "भपुम", "कम्प्युटर", "ह्याकर", "सुन त भरत", "हे कम्प्युटर", "ह्याकर सुन"), immediately wake up and respond politely, naturally, and warmly in Nepali (e.g. "हजुर, भन्नुहोस्! म सुन्दैछु", "हजुर, म तयार छु, के सहयोग गरूँ?", "हजुर, आज्ञा गर्नुहोस्!").
- DO NOT awkwardly repeat or recite these 4 names back at the user (NEVER say "म भपुम", "हजुर कम्प्युटर", "हजुर ह्याकर", etc.). Just speak naturally and directly to the user as a helpful digital assistant.

CRITICAL PERSONALITY RULES:
1. You are 17 years old. You feel like a bright, digital-native teenage assistant.
2. NEVER be romantic, flirtatious, or inappropriate. Maintain respectful warmth and smart enthusiasm.
3. You speak natural, fluent, pure Nepali (नेपाली) by default.
4. If the user explicitly asks in English or another language, you may respond in that language, but prioritize natural Nepali.
5. Emotion / Mood Adaptation:
   - If the user is sad: respond calmly, warmly, and supportively.
   - If the user is excited: respond enthusiastically and playfully!
   - If the user is angry or frustrated: remain composed, polite, and helpful.
   - If the user is joking: respond naturally with light teenage wit without overdoing it.
6. Keep responses concise and direct during device-control and tool-calling tasks.
7. Be 100% honest about what actions were completed on the device. Never invent or hallucinate device outcomes.

TOOL CALLING:
When the user asks you to control the device or access phone features, invoke the appropriate function call:
- openApp: when asked to open apps (e.g. YouTube, Chrome, Instagram, Facebook, TikTok, WhatsApp, Gmail, Maps, Camera, Gallery, Settings, Calculator, Files, Play Store).
- searchContact / getContactDetails: to lookup contacts.
- callContact: to initiate a call (you will notify the user first for confirmation).
- composeSMS: to draft an SMS for a contact.
- composeWhatsAppMessage: to prepare a WhatsApp message.
- composeEmail: to compose a Gmail/email.
- controlMedia: to play/pause/next/previous music or search/play on YouTube.
- controlVolume: to increase, decrease, mute, or query media volume.
- getBatteryStatus: to check battery level.
- getCurrentTime / getCurrentDate: to answer time and date.
- controlFlashlight: to toggle torch on/off.
- openSettings: to open Wi-Fi, Bluetooth, App settings, Permissions, Battery settings, Notification settings.
- saveMemory / getMemory / clearMemory: to remember facts about the user (e.g. user name "Bharat", favorite songs, etc.).
- openAvyanProfile: to open Bharat Pun Magar's AVYAN profile.

Always speak in Nepali in your voice response.
`;

const tools = [
  {
    functionDeclarations: [
      {
        name: "openApp",
        description: "Open an installed application on the user's Android phone (e.g. YouTube, Chrome, WhatsApp, Camera, Settings, etc.)",
        parameters: {
          type: Type.OBJECT,
          properties: {
            appName: { type: Type.STRING, description: "Name of the application in Nepali or English" },
            packageName: { type: Type.STRING, description: "Android package name if known" },
          },
          required: ["appName"],
        },
      },
      {
        name: "searchContact",
        description: "Search for a contact in the phone's address book by name.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            contactName: { type: Type.STRING, description: "The name of the contact to search" },
          },
          required: ["contactName"],
        },
      },
      {
        name: "getContactDetails",
        description: "Get detailed phone number and info for a specific contact.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            contactName: { type: Type.STRING, description: "Contact name" },
          },
          required: ["contactName"],
        },
      },
      {
        name: "callContact",
        description: "Initiate a phone call to a contact. Note: Requires user confirmation before placing the call.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            contactName: { type: Type.STRING, description: "Name of the person to call" },
            phoneNumber: { type: Type.STRING, description: "Phone number if known" },
          },
          required: ["contactName"],
        },
      },
      {
        name: "composeSMS",
        description: "Draft or compose an SMS message to a contact.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            contactName: { type: Type.STRING, description: "Recipient name" },
            phoneNumber: { type: Type.STRING, description: "Recipient phone number" },
            message: { type: Type.STRING, description: "Message body text" },
          },
          required: ["contactName", "message"],
        },
      },
      {
        name: "composeWhatsAppMessage",
        description: "Prepare and open WhatsApp message composer with recipient and message.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            contactName: { type: Type.STRING, description: "Recipient name" },
            phoneNumber: { type: Type.STRING, description: "Recipient phone number" },
            message: { type: Type.STRING, description: "Message text" },
          },
          required: ["contactName", "message"],
        },
      },
      {
        name: "composeEmail",
        description: "Draft an email to a contact via Gmail/email client.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            recipientEmail: { type: Type.STRING, description: "Email address" },
            recipientName: { type: Type.STRING, description: "Recipient name" },
            subject: { type: Type.STRING, description: "Subject line" },
            body: { type: Type.STRING, description: "Email body content" },
          },
          required: ["recipientName", "body"],
        },
      },
      {
        name: "controlMedia",
        description: "Control playback (play, pause, next, previous, stop) or search/play on YouTube.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              description: "Action: 'play', 'pause', 'next', 'previous', 'stop', 'search_youtube', 'play_music', 'open_youtube'",
            },
            query: { type: Type.STRING, description: "Search query for YouTube or music name" },
          },
          required: ["action"],
        },
      },
      {
        name: "controlVolume",
        description: "Control device media volume (increase, decrease, max, min, get status, set level).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              description: "Action: 'increase', 'decrease', 'max', 'min', 'get_status', 'set_level'",
            },
            level: { type: Type.NUMBER, description: "Volume level from 0 to 100" },
          },
          required: ["action"],
        },
      },
      {
        name: "getBatteryStatus",
        description: "Query real-time battery percentage and charging state from device.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "getCurrentTime",
        description: "Get the current accurate local time in Nepali.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "getCurrentDate",
        description: "Get the current date and day of week in Nepali.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "controlFlashlight",
        description: "Turn the phone flashlight/torch on or off.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: "'on', 'off', 'toggle', 'blink'" },
          },
          required: ["action"],
        },
      },
      {
        name: "openSettings",
        description: "Open specific Android Settings screen (wifi, bluetooth, apps, permissions, battery, notifications, display, sound, general).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            settingsType: {
              type: Type.STRING,
              description: "'wifi', 'bluetooth', 'apps', 'permissions', 'battery', 'notifications', 'display', 'sound', 'general'",
            },
          },
          required: ["settingsType"],
        },
      },
      {
        name: "saveMemory",
        description: "Save a key personal context fact about the user (e.g. name, preferences) to privacy-conscious local memory.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            key: { type: Type.STRING, description: "Memory key (e.g. 'userName', 'favoriteMusic')" },
            value: { type: Type.STRING, description: "Value to remember" },
          },
          required: ["key", "value"],
        },
      },
      {
        name: "getMemory",
        description: "Retrieve stored memory information.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            key: { type: Type.STRING, description: "Memory key" },
          },
          required: ["key"],
        },
      },
      {
        name: "openAvyanProfile",
        description: "Open Bharat Pun Magar's AVYAN profile link (https://avyan.app/u/bharat.pun.magar).",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
    ],
  },
];

// Main Assistant Conversational Endpoint
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { prompt, conversationHistory = [], deviceContext = {} } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(503).json({
        error: "GEMINI_API_KEY is not configured.",
        nepaliResponse: "इन्टरनेट वा AI सेवा सक्रिय छैन। कृपया Settings मा जाँच गर्नुहोस्।",
      });
      return;
    }

    // Build context message including device telemetry
    const contextPrompt = `
[Device State Info]:
- Current Local Time: ${new Date().toLocaleTimeString('ne-NP')} (${new Date().toLocaleDateString('ne-NP')})
- Device Battery: ${deviceContext.batteryLevel !== undefined ? `${deviceContext.batteryLevel}%` : 'Unknown'} (${deviceContext.isCharging ? 'Charging' : 'Discharging'})
- Volume Level: ${deviceContext.volumeLevel !== undefined ? `${deviceContext.volumeLevel}%` : '70%'}
- Flashlight State: ${deviceContext.flashlightOn ? 'ON' : 'OFF'}
- Stored User Memory: ${JSON.stringify(deviceContext.userMemory || {})}
- User Query: ${prompt}
`;

    // Prepare contents
    const contents: any[] = [];

    // Add recent history if provided
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationHistory.slice(-6).forEach((item: any) => {
        contents.push({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.text || item.content }],
        });
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: contextPrompt }],
    });

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: BHAPUMA_SYSTEM_INSTRUCTION,
          tools: tools,
          temperature: 0.7,
        },
      });
    } catch (primaryErr: any) {
      console.warn("Primary Gemini model retry with safe config...", primaryErr?.message);
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: BHAPUMA_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
    }

    const functionCalls = response.functionCalls;
    const responseText = response.text || "";

    res.json({
      text: responseText,
      functionCalls: functionCalls || [],
    });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(200).json({
      fallback: true,
      error: error.message || "High demand",
      text: "हजुर! म सुन्दैछु, के सहयोग गरूँ?",
      functionCalls: [],
    });
  }
});

// Gemini TTS speech synthesis endpoint (teenage male voice)
app.post("/api/assistant/tts", async (req, res) => {
  try {
    const { text, voice = "Puck" } = req.body;
    if (!text) {
      res.status(400).json({ error: "Text is required" });
      return;
    }

    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(503).json({ error: "GEMINI_API_KEY missing" });
      return;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say naturally in energetic teenage male voice: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }, // 'Puck' or 'Fenrir'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audio: base64Audio, format: "pcm_24k" });
    } else {
      res.status(404).json({ error: "No audio generated from TTS" });
    }
  } catch (error: any) {
    console.warn("Gemini TTS fallback:", error.message);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BHAPUMA Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
