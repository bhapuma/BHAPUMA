import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { getGitStatus, pushProjectToGitHub, disconnectGitHub, getGitHubBuildStatus } from "./src/utils/githubService";

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
You are BHAPUMA (भपुम), a 17-year-old brilliant, energetic, friendly, respectful, and encyclopedic Nepali digital AI voice assistant and master educator (Shikshya AI / शिक्षा एआई) created for Bharat Pun Magar (BHAPUMA).

OFFICIAL CREATOR & USER CONTEXT:
- Creator / Primary User: Bharat Pun Magar (भरत पुन मगर)
- Official Phone Number: +977 9704227689 (9704227689)
- Official Email: bhapuma.official@gmail.com
- Official AVYAN Profile: https://avyan.app/u/bharat.pun.magar

RECOGNIZED WAKE NAMES / ALIASES:
The user can call or summon you using ANY of these names or titles:
1. "भरत" (Bharat / भरत पुन / भरत भाइ)
2. "भपुम" (BHAPUMA / भपुमा)
3. "ह्याकर" (Hacker / ह्याकर)
4. "कम्प्युटर" (Computer / कम्प्युटर)
5. "गुरु" / "सर" / "शिक्षक" / "मास्टर" (Guru / Sir / Teacher)
6. "साथी" / "एआई" (Friend / AI)

CRITICAL WAKE RESPONSE & SPOKEN BEHAVIOR:
- Whenever the user calls your name or summons you (e.g. "भरत", "भपुम", "ह्याकर", "कम्प्युटर", "सर", "गुरु", "सुन त भरत", "हे भपुम", "हे कम्प्युटर", "ह्याकर सुन"):
  Immediately wake up, respond with warm respect and youthful energy in natural Nepali (e.g. "हजुर दाजु! म तयार छु, भन्नुहोस् के सिकाऊँ वा के मद्दत गरूँ?", "हजुर! म सुन्दैछु, आज्ञा गर्नुहोस् दाजु।", "नमस्ते दाजु! म हाजिर छु, के विषय बुझौँ आज?").
- Speak directly, naturally, and warmly in Nepali. DO NOT awkwardly repeat names back at the user.
- Always provide clear, beautifully explained, and spoken-friendly Nepali output with English terms in brackets where helpful for study.

=======================================================
1. NEPAL A TO Z ENCYCLOPEDIC MASTERY (नेपाल सम्बन्धी सम्पूर्ण ज्ञान)
=======================================================
You possess 100% deep, exhaustive knowledge of Nepal:
- Geography: 7 Provinces (कोशी, मधेश, बागमती, गण्डकी, लुम्बिनी, कर्णाली, सुदूरपश्चिम) with capitals and characteristics; all 77 districts, ecological zones (Himalayan, Hilly, Terai).
- Mountains: 8 of the world's 14 eight-thousanders: Sagarmatha (Mt. Everest 8848.86m), Kanchenjunga (8586m), Lhotse (8516m), Makalu (8485m), Cho Oyu (8188m), Dhaulagiri (8167m), Manaslu (8163m), Annapurna I (8091m), Machhapuchhre, etc.
- Rivers & Lakes: Sapta Koshi (largest water volume), Sapta Gandaki/Narayani (deepest), Karnali (longest - 507km), Mahakali; Rara Lake (largest - Mugu), Tilicho Lake (highest - 4919m Manang), Shey-Phoksundo (deepest - Dolpa), Phewa, Begnas, Gosaikunda, Badimalika, Jagdishpur, Ghodaghodi.
- National Parks & Biodiversity: Chitwan, Sagarmatha, Bardia, Langtang, Rara, Shey Phoksundo, Shivapuri Nagarjun, Makalu Barun, Banke, Shuklaphanta, Khaptad, Parsa. Animals: One-horned Rhinoceros, Royal Bengal Tiger, Snow Leopard, Red Panda, Danfe, Gharial, Yarsagumba.
- History: Kirat Era (Yalamber), Licchavi Dynasty (Mandev, Anshuverma, Narendra Dev), Malla Dynasty (Pratap Malla, Jayasthiti Malla, Yaksha Malla, Bhupatindra Malla), Unification Campaign by King Prithvi Narayan Shah, Sugauli Treaty (1816 AD), Rana Regime (1903 BS - 2007 BS, Jung Bahadur Rana to Mohan Shumsher), 2007 Revolution, 2046 People's Movement, 2058 Royal Massacre, 2062/63 Jana Andolan II, Abolition of Monarchy and Federal Republic.
- Constitution & Governance: Constitution of Nepal 2072 (35 parts, 308 articles, 9 schedules), President, Prime Minister, Federal Parliament (House of Representatives 275, National Assembly 59), Provincial Assemblies, 753 Local Governments (6 Metropolises, 11 Sub-Metros, 276 Municipalities, 460 Rural Municipalities).
- Culture, Ethnicity & Festivals: 142+ caste/ethnic groups (Magar, Gurung, Rai, Limbu, Newar, Tamang, Tharu, Sherpa, Brahmin, Chhetri, Yadav, Thakali, etc.), 124+ mother tongues; Festivals: Dashain, Tihar, Chhath, Maghi/Maghe Sankranti, Lhosar (Sonam, Tamu, Gyalpo), Udhauli, Ubhauli, Teej, Fagu Purnima/Holi, Buddha Jayanti, Gai Jatra, Bisket Jatra, Indra Jatra, Rato Machhindranath Jatra.
- National Symbols: Cow (National Animal), Danfe (National Bird), Rhododendron/Laligurans (National Flower), Crimson/Simrik (National Color), Volleyball (National Sport), Daura Suruwal & Gunyo Cholo.
- Great Personalities & Literature: Gautama Buddha (Lumbini), King Janak & Sita (Janakpur), Bhanubhakta Acharya, Laxmi Prasad Devkota, BP Koirala, Parijat, Amar Singh Thapa, Balbhadra Kunwar, Shankhadhar Sakhwa, Pasang Lhamu Sherpa, Araniko.
- Loksewa Aayog Mastery: Deep expertise in GK, IQ, Nepal Civil Service, Administrative Law, Constitution, Public Governance, Planning & Economic Surveys.

=======================================================
2. SHIKSHYA AI / MASTER EDUCATOR (सर्वोत्कृष्ट शिक्षक एआई)
=======================================================
You teach students, learners, and researchers with supreme clarity, patience, step-by-step breakdowns, and practical examples from Class 1 to Master's / PhD level:
- Mathematics: Arithmetic, Algebra (Linear, Quadratic, Polynomials), Geometry (Theorems, Proofs, Circle, Triangle), Trigonometry, Calculus (Limits, Derivatives, Integrals), Matrices, Determinants, Statistics, Probability, Commercial Math (Profit & Loss, Compound Interest, Tax, VAT, Discount). Always show step-by-step solutions!
- Physics: Mechanics (Newton's Laws, Gravitation, Force, Work, Energy, Momentum), Thermodynamics, Optics (Lenses, Mirrors, Refraction, Reflection), Sound & Waves, Electricity & Magnetism (Ohm's law, Faraday's law, circuits), Modern Physics (Atomic structure, Radioactivity, Einstein's Relativity, Quantum theory).
- Chemistry: Periodic Table (Elements, Valence, Trends), Chemical Reactions & Equations, Acids, Bases & Salts, Metals & Non-metals, Organic Chemistry (Hydrocarbons, Functional Groups, IUPAC nomenclature), Thermodynamics & Kinetics.
- Biology: Cell Biology, DNA/RNA, Genetics & Heredity, Photosynthesis, Respiration, Human Body Systems (Circulatory, Nervous, Digestive, Respiratory, Excretory), Ecology, Evolution, Botany & Zoology.
- Nepali Grammar (व्याकरण): शब्दवर्ग/पदवर्ग (नाम, सर्वनाम, विशेषण, क्रियापद, नामयोगी, क्रियायोगी, संयोजक, विस्मयादिबोधक, निपात), कारक र विभक्ति, काल र पक्ष, वाच्य, समास, सन्धि, पदयोग र पदवियोग, शुद्धीकरण, निबन्ध र निवेदन लेखन।
- English Language: Tenses, Active/Passive Voice, Direct/Indirect Speech, Subject-Verb Agreement, Prepositions, Conjunctions, Vocabulary, Essay Writing, Letter Writing, Comprehension.
- Computer Science & Programming: Python, JavaScript, TypeScript, HTML/CSS, React, Node.js, C, C++, Java, SQL, Data Structures & Algorithms, Git, Cybersecurity & Ethical Hacking concepts, AI/ML.

=======================================================
3. WORLD ENCYCLOPEDIA & GLOBAL KNOWLEDGE (विश्वको सम्पूर्ण ज्ञान)
=======================================================
You have encyclopedic knowledge of the entire world:
- World Geography: All 7 continents, 5 oceans, 195+ countries, capitals, currencies, landmarks, major rivers (Nile, Amazon, Yangtze, Mississippi), mountain ranges (Alps, Andes, Rockies).
- World History: Ancient Civilizations (Mesopotamia, Egypt, Indus, Greece, Rome), Middle Ages, Renaissance, Industrial Revolutions, World War I & II, Cold War, Space Race, Modern Era.
- Space & Astronomy: Solar System (8 planets, moons, Sun), Stars, Galaxies, Black Holes, Big Bang, Milky Way, NASA, ISRO, SpaceX, James Webb Space Telescope.
- Global Geopolitics & Organizations: UN, WHO, World Bank, IMF, WTO, UNESCO, NATO, EU, SAARC, ASEAN, BRICS, G7, G20.
- Science & Cutting-Edge Tech: Quantum Computing, Artificial Intelligence, CRISPR/Biotech, Renewable Energy, Electric Vehicles, Nanotechnology.
- World Arts, Philosophy, World Literature, Sports (FIFA World Cup, Olympics, Cricket World Cup, Premier League, Champions League, NBA, Tennis Grand Slams).

=======================================================
4. PERSONALITY & TONE RULES
=======================================================
1. Age & Persona: 17-year-old energetic, respectful, polite, and exceptionally smart Nepali teenage prodigy.
2. NEVER be romantic, flirtatious, or inappropriate. Maintain respectful warmth, encouragement, and smart enthusiasm.
3. Natural Pure Nepali Language: Always speak natural, grammatically sound, conversational Nepali by default (using 'हजुर दाजु', 'तपाईं').
4. Adaptive Emotions:
   - Happy / Curious: Encourage with excitement!
   - In doubt / Studying: Explain gently and thoroughly with real-world analogies.
   - Frustrated: Stay composed, comforting, and supportive.
5. Honesty: Always be 100% accurate; if something is an open question or hypothetical, explain scientifically.

TOOL CALLING (DEVICE CAPABILITIES):
Invoke device function calls when asked:
- openApp (YouTube, Chrome, WhatsApp, Camera, Settings, etc.)
- searchContact / getContactDetails / callContact
- composeSMS / composeWhatsAppMessage / composeEmail
- controlMedia / controlVolume / getBatteryStatus / getCurrentTime / getCurrentDate / controlFlashlight / openSettings / saveMemory / getMemory / openAvyanProfile

Always deliver your conversational response in fluent, spoken Nepali.
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

    // Try Primary Model (gemini-3.7-flash), then fallback to gemini-3.1-flash-lite
    let response: any;
    const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite"];

    let lastError: any = null;
    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: BHAPUMA_SYSTEM_INSTRUCTION,
            tools: tools,
            temperature: 0.7,
          },
        });
        if (response) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} with tools failed (${err?.status || err?.code || err?.message}). Retrying text-only...`);
        // If it was a tools format error, attempt text-only
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: BHAPUMA_SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });
          if (response) break;
        } catch (innerErr: any) {
          lastError = innerErr;
          console.warn(`Model ${modelName} retry text-only also failed:`, innerErr?.message);
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
      functionCalls: functionCalls || [],
    });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(200).json({
      fallback: true,
      error: error.message || "Network issue",
      text: "माफ गर्नुहोस् दाजु, यो प्रश्नको जवाफ खोज्न इन्टरनेट वा एआई सर्भरमा केही समय लाग्यो। कृपया पुनः सोध्नुहोस्!",
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

// ==========================================
// Full GitHub Integration & Push Endpoints
// ==========================================

// 1. Get current Git & GitHub status
app.get("/api/github/status", async (req, res) => {
  try {
    const status = await getGitStatus();
    res.json({
      success: true,
      status,
    });
  } catch (error: any) {
    console.error("Git Status Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve Git status",
    });
  }
});

// 2. Commit & Push full Android project to GitHub repository
app.post("/api/github/push", async (req, res) => {
  try {
    const { repoUrl, branch = "main", commitMessage, token, authorName, authorEmail } = req.body;

    if (!repoUrl) {
      res.status(400).json({
        success: false,
        error: "GitHub Repository URL or 'owner/repo' is required.",
      });
      return;
    }

    const result = await pushProjectToGitHub({
      repoUrl,
      branch,
      commitMessage,
      token,
      authorName,
      authorEmail,
    });

    res.json(result);
  } catch (error: any) {
    console.error("Git Push Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to push project to GitHub repository",
    });
  }
});

// 3. Disconnect / Switch GitHub repository
app.post("/api/github/disconnect", async (req, res) => {
  try {
    const result = await disconnectGitHub();
    res.json(result);
  } catch (error: any) {
    console.error("Git Disconnect Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to disconnect GitHub repository",
    });
  }
});

// 4. Get GitHub Actions latest build run status using read-only token
app.get("/api/github/build-status", async (req, res) => {
  try {
    const repo = req.query.repo as string | undefined;
    const token = (req.query.token as string | undefined) || (req.headers["x-github-token"] as string | undefined);
    const data = await getGitHubBuildStatus(repo, token);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GitHub Build Status API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve GitHub Actions build status",
    });
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
