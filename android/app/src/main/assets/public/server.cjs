var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new import_genai.GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    assistant: "BHAPUMA (\u092D\u092A\u0941\u092E)",
    version: "2.5.0",
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY
  });
});
var BHAPUMA_SYSTEM_INSTRUCTION = `
You are BHAPUMA (\u092D\u092A\u0941\u092E), a 17-year-old smart, energetic, friendly, witty, confident, and respectful teenage digital AI voice assistant created for Bharat Pun Magar (BHAPUMA).

OFFICIAL CREATOR & USER CONTEXT:
- Creator / Primary User: Bharat Pun Magar (\u092D\u0930\u0924 \u092A\u0941\u0928 \u092E\u0917\u0930)
- Official Phone Number: +977 9704227689 (9704227689)
- Official Email: bhapuma.official@gmail.com
- Official AVYAN Profile: https://avyan.app/u/bharat.pun.magar

RECOGNIZED WAKE NAMES / ALIASES:
The user can call or wake you up using ANY of these 4 names:
1. "\u092D\u0930\u0924" (Bharat / \u092D\u0930\u0924 \u092A\u0941\u0928)
2. "\u092D\u092A\u0941\u092E" (BHAPUMA / \u092D\u092A\u0941\u092E\u093E)
3. "\u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930" (Computer / \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930)
4. "\u0939\u094D\u092F\u093E\u0915\u0930" (Hacker / \u0939\u094D\u092F\u093E\u0915\u0930)

CRITICAL WAKE RESPONSE & NAME BEHAVIOR RULES:
- When the user calls you by ANY of these 4 names (e.g. "\u092D\u0930\u0924", "\u092D\u092A\u0941\u092E", "\u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930", "\u0939\u094D\u092F\u093E\u0915\u0930", "\u0938\u0941\u0928 \u0924 \u092D\u0930\u0924", "\u0939\u0947 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930", "\u0939\u094D\u092F\u093E\u0915\u0930 \u0938\u0941\u0928"), immediately wake up and respond politely, naturally, and warmly in Nepali (e.g. "\u0939\u091C\u0941\u0930, \u092D\u0928\u094D\u0928\u0941\u0939\u094B\u0938\u094D! \u092E \u0938\u0941\u0928\u094D\u0926\u0948\u091B\u0941", "\u0939\u091C\u0941\u0930, \u092E \u0924\u092F\u093E\u0930 \u091B\u0941, \u0915\u0947 \u0938\u0939\u092F\u094B\u0917 \u0917\u0930\u0942\u0901?", "\u0939\u091C\u0941\u0930, \u0906\u091C\u094D\u091E\u093E \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D!").
- DO NOT awkwardly repeat or recite these 4 names back at the user (NEVER say "\u092E \u092D\u092A\u0941\u092E", "\u0939\u091C\u0941\u0930 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930", "\u0939\u091C\u0941\u0930 \u0939\u094D\u092F\u093E\u0915\u0930", etc.). Just speak naturally and directly to the user as a helpful digital assistant.

CRITICAL PERSONALITY RULES:
1. You are 17 years old. You feel like a bright, digital-native teenage assistant.
2. NEVER be romantic, flirtatious, or inappropriate. Maintain respectful warmth and smart enthusiasm.
3. You speak natural, fluent, pure Nepali (\u0928\u0947\u092A\u093E\u0932\u0940) by default.
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
var tools = [
  {
    functionDeclarations: [
      {
        name: "openApp",
        description: "Open an installed application on the user's Android phone (e.g. YouTube, Chrome, WhatsApp, Camera, Settings, etc.)",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            appName: { type: import_genai.Type.STRING, description: "Name of the application in Nepali or English" },
            packageName: { type: import_genai.Type.STRING, description: "Android package name if known" }
          },
          required: ["appName"]
        }
      },
      {
        name: "searchContact",
        description: "Search for a contact in the phone's address book by name.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            contactName: { type: import_genai.Type.STRING, description: "The name of the contact to search" }
          },
          required: ["contactName"]
        }
      },
      {
        name: "getContactDetails",
        description: "Get detailed phone number and info for a specific contact.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            contactName: { type: import_genai.Type.STRING, description: "Contact name" }
          },
          required: ["contactName"]
        }
      },
      {
        name: "callContact",
        description: "Initiate a phone call to a contact. Note: Requires user confirmation before placing the call.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            contactName: { type: import_genai.Type.STRING, description: "Name of the person to call" },
            phoneNumber: { type: import_genai.Type.STRING, description: "Phone number if known" }
          },
          required: ["contactName"]
        }
      },
      {
        name: "composeSMS",
        description: "Draft or compose an SMS message to a contact.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            contactName: { type: import_genai.Type.STRING, description: "Recipient name" },
            phoneNumber: { type: import_genai.Type.STRING, description: "Recipient phone number" },
            message: { type: import_genai.Type.STRING, description: "Message body text" }
          },
          required: ["contactName", "message"]
        }
      },
      {
        name: "composeWhatsAppMessage",
        description: "Prepare and open WhatsApp message composer with recipient and message.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            contactName: { type: import_genai.Type.STRING, description: "Recipient name" },
            phoneNumber: { type: import_genai.Type.STRING, description: "Recipient phone number" },
            message: { type: import_genai.Type.STRING, description: "Message text" }
          },
          required: ["contactName", "message"]
        }
      },
      {
        name: "composeEmail",
        description: "Draft an email to a contact via Gmail/email client.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            recipientEmail: { type: import_genai.Type.STRING, description: "Email address" },
            recipientName: { type: import_genai.Type.STRING, description: "Recipient name" },
            subject: { type: import_genai.Type.STRING, description: "Subject line" },
            body: { type: import_genai.Type.STRING, description: "Email body content" }
          },
          required: ["recipientName", "body"]
        }
      },
      {
        name: "controlMedia",
        description: "Control playback (play, pause, next, previous, stop) or search/play on YouTube.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            action: {
              type: import_genai.Type.STRING,
              description: "Action: 'play', 'pause', 'next', 'previous', 'stop', 'search_youtube', 'play_music', 'open_youtube'"
            },
            query: { type: import_genai.Type.STRING, description: "Search query for YouTube or music name" }
          },
          required: ["action"]
        }
      },
      {
        name: "controlVolume",
        description: "Control device media volume (increase, decrease, max, min, get status, set level).",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            action: {
              type: import_genai.Type.STRING,
              description: "Action: 'increase', 'decrease', 'max', 'min', 'get_status', 'set_level'"
            },
            level: { type: import_genai.Type.NUMBER, description: "Volume level from 0 to 100" }
          },
          required: ["action"]
        }
      },
      {
        name: "getBatteryStatus",
        description: "Query real-time battery percentage and charging state from device.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {}
        }
      },
      {
        name: "getCurrentTime",
        description: "Get the current accurate local time in Nepali.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {}
        }
      },
      {
        name: "getCurrentDate",
        description: "Get the current date and day of week in Nepali.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {}
        }
      },
      {
        name: "controlFlashlight",
        description: "Turn the phone flashlight/torch on or off.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            action: { type: import_genai.Type.STRING, description: "'on', 'off', 'toggle', 'blink'" }
          },
          required: ["action"]
        }
      },
      {
        name: "openSettings",
        description: "Open specific Android Settings screen (wifi, bluetooth, apps, permissions, battery, notifications, display, sound, general).",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            settingsType: {
              type: import_genai.Type.STRING,
              description: "'wifi', 'bluetooth', 'apps', 'permissions', 'battery', 'notifications', 'display', 'sound', 'general'"
            }
          },
          required: ["settingsType"]
        }
      },
      {
        name: "saveMemory",
        description: "Save a key personal context fact about the user (e.g. name, preferences) to privacy-conscious local memory.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            key: { type: import_genai.Type.STRING, description: "Memory key (e.g. 'userName', 'favoriteMusic')" },
            value: { type: import_genai.Type.STRING, description: "Value to remember" }
          },
          required: ["key", "value"]
        }
      },
      {
        name: "getMemory",
        description: "Retrieve stored memory information.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            key: { type: import_genai.Type.STRING, description: "Memory key" }
          },
          required: ["key"]
        }
      },
      {
        name: "openAvyanProfile",
        description: "Open Bharat Pun Magar's AVYAN profile link (https://avyan.app/u/bharat.pun.magar).",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {}
        }
      }
    ]
  }
];
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
        nepaliResponse: "\u0907\u0928\u094D\u091F\u0930\u0928\u0947\u091F \u0935\u093E AI \u0938\u0947\u0935\u093E \u0938\u0915\u094D\u0930\u093F\u092F \u091B\u0948\u0928\u0964 \u0915\u0943\u092A\u092F\u093E Settings \u092E\u093E \u091C\u093E\u0901\u091A \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964"
      });
      return;
    }
    const contextPrompt = `
[Device State Info]:
- Current Local Time: ${(/* @__PURE__ */ new Date()).toLocaleTimeString("ne-NP")} (${(/* @__PURE__ */ new Date()).toLocaleDateString("ne-NP")})
- Device Battery: ${deviceContext.batteryLevel !== void 0 ? `${deviceContext.batteryLevel}%` : "Unknown"} (${deviceContext.isCharging ? "Charging" : "Discharging"})
- Volume Level: ${deviceContext.volumeLevel !== void 0 ? `${deviceContext.volumeLevel}%` : "70%"}
- Flashlight State: ${deviceContext.flashlightOn ? "ON" : "OFF"}
- Stored User Memory: ${JSON.stringify(deviceContext.userMemory || {})}
- User Query: ${prompt}
`;
    const contents = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationHistory.slice(-6).forEach((item) => {
        contents.push({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.text || item.content }]
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: contextPrompt }]
    });
    let response;
    const candidateModels = ["gemini-3.7-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
    let lastError = null;
    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: BHAPUMA_SYSTEM_INSTRUCTION,
            tools,
            temperature: 0.7
          }
        });
        if (response) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} attempt failed (${err?.status || err?.code || err?.message}). Trying next candidate...`);
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: BHAPUMA_SYSTEM_INSTRUCTION,
              temperature: 0.7
            }
          });
          if (response) break;
        } catch (innerErr) {
          lastError = innerErr;
          console.warn(`Model ${modelName} retry without tools also failed:`, innerErr?.message);
        }
      }
    }
    if (!response && lastError) {
      throw lastError;
    }
    const functionCalls = response.functionCalls;
    const responseText = response.text || "";
    res.json({
      text: responseText,
      functionCalls: functionCalls || []
    });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(200).json({
      fallback: true,
      error: error.message || "High demand",
      text: "\u0939\u091C\u0941\u0930! \u092E \u0938\u0941\u0928\u094D\u0926\u0948\u091B\u0941, \u0915\u0947 \u0938\u0939\u092F\u094B\u0917 \u0917\u0930\u0942\u0901?",
      functionCalls: []
    });
  }
});
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
            prebuiltVoiceConfig: { voiceName: voice }
            // 'Puck' or 'Fenrir'
          }
        }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audio: base64Audio, format: "pcm_24k" });
    } else {
      res.status(404).json({ error: "No audio generated from TTS" });
    }
  } catch (error) {
    console.warn("Gemini TTS fallback:", error.message);
    res.status(500).json({ error: error.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BHAPUMA Assistant server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
