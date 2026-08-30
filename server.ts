import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  "8742324772:AAEEbdA4ZglCT-lyUt-op1uVw6rmbVfUCgk";

// Helper to call Telegram Bot API
async function callTelegramApi(method: string, body: Record<string, unknown> = {}) {
  if (!BOT_TOKEN) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API error (${method}):`, err);
    return null;
  }
}

// Get the best public HTTPS URL for the Web App
function getPublicAppUrl(): string {
  const envUrl = process.env.APP_URL;
  if (envUrl && envUrl.startsWith("http") && !envUrl.includes("ais-dev-") && !envUrl.includes("aistudio.google.com")) {
    return envUrl.replace(/\/+$/, "");
  }
  // Production Vercel App URL for Telegram WebApp
  return "https://earning-bolt-plus.vercel.app";
}

// Generate the interactive welcome message with web_app button
function buildWelcomePayload(chatId: string | number, firstName: string, appUrl: string, startParam?: string) {
  const effectiveUrl = appUrl || getPublicAppUrl();
  const launchUrl = startParam ? `${effectiveUrl}?startapp=${startParam}` : effectiveUrl;

  const messageText = `⚡️ <b>Welcome to PayPlus Bolt Earning, ${firstName || "Valued User"}!</b> ⚡️

Earn real rewards daily with Adsgram Video Ads, simple social tasks, and instant withdrawals.

💰 <b>Earning Breakdown:</b>
• <b>Watch Ads:</b> $0.30 per completed video
• <b>Daily Tasks:</b> $0.50 - $1.00 per task
• <b>Referral Bonus:</b> $0.50 for every invited friend + 10% commission

👇 <b>Tap the button below to start earning now!</b>`;

  return {
    chat_id: chatId,
    text: messageText,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🚀 Open Mini App & Start Earning",
            web_app: { url: launchUrl },
          },
        ],
        [
          {
            text: "📢 Join News Channel",
            url: "https://t.me/telegram",
          },
          {
            text: "💬 Customer Support",
            url: "https://t.me/telegram",
          },
        ],
        [
          {
            text: "👥 Invite Friends",
            switch_inline_query: "Join PayPlus Bolt Bot and get $0.50 welcome reward instantly!",
          },
        ],
      ],
    },
  };
}

// Process any incoming Telegram Update (from webhook or long-polling)
async function handleTelegramUpdate(update: any) {
  if (!update) return;

  const message = update.message || update.edited_message;
  if (message && message.text) {
    const text = message.text.trim();
    const chatId = message.chat.id;
    const firstName = message.from?.first_name || "Friend";
    const appUrl = getPublicAppUrl();

    console.log(`[Telegram Bot] Message received from ${chatId} (${firstName}): "${text}"`);

    if (text.startsWith("/start") || text.startsWith("/earn") || text.startsWith("/play") || text.toLowerCase() === "start" || text.toLowerCase() === "earn") {
      const parts = text.split(" ");
      const startParam = parts.length > 1 ? parts[1] : undefined;
      const payload = buildWelcomePayload(chatId, firstName, appUrl, startParam);
      const res = await callTelegramApi("sendMessage", payload);
      console.log(`[Telegram Bot] Welcome sent to ${chatId}:`, res?.ok ? "SUCCESS" : res?.description);
    } else if (text.startsWith("/balance") || text.startsWith("/stats") || text.toLowerCase() === "balance") {
      await callTelegramApi("sendMessage", {
        chat_id: chatId,
        text: `📊 <b>Your Bolt Account:</b>\n\nClick below to access your live balance, watched Ads, and pending withdrawals.`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚡️ Open My Dashboard",
                web_app: { url: appUrl },
              },
            ],
          ],
        },
      });
    } else if (text.startsWith("/help") || text.toLowerCase() === "help") {
      await callTelegramApi("sendMessage", {
        chat_id: chatId,
        text: `ℹ️ <b>PayPlus Bolt Help & Guidelines:</b>\n\n• Watch rewarded Adsgram videos completely to claim rewards\n• Withdrawals are processed via USDT (TRC20), PayPal, and Top-Up\n• Need assistance? Contact our support team directly.`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Open Mini App",
                web_app: { url: appUrl },
              },
            ],
          ],
        },
      });
    } else {
      // General fallback reply with start button
      const payload = buildWelcomePayload(chatId, firstName, appUrl);
      await callTelegramApi("sendMessage", payload);
    }
  }
}

// Background Long-Polling Service
let isPollingActive = false;
let lastUpdateOffset = 0;

async function startTelegramLongPolling() {
  if (!BOT_TOKEN || isPollingActive) return;
  isPollingActive = true;

  console.log("[Telegram Bot] Starting background polling service for bot...");

  try {
    // 1. Delete any old/stale webhook so long polling works instantly
    await callTelegramApi("deleteWebhook", { drop_pending_updates: false });

    // 2. Configure Chat Menu Button for the Mini App
    const appUrl = getPublicAppUrl();
    await callTelegramApi("setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text: "⚡️ Earn",
        web_app: { url: appUrl },
      },
    });

    // 3. Set bot commands
    await callTelegramApi("setMyCommands", {
      commands: [
        { command: "start", description: "Start the bot & open earning app" },
        { command: "earn", description: "Open PayPlus Bolt Mini App" },
        { command: "balance", description: "Check your earning stats" },
        { command: "help", description: "Get support & rules" },
      ],
    });

    const botInfo = await callTelegramApi("getMe");
    console.log(`[Telegram Bot] Connected successfully as @${botInfo?.result?.username || "bot"}`);
  } catch (err) {
    console.warn("[Telegram Bot] Init warning:", err);
  }

  // Polling loop
  const pollUpdates = async () => {
    while (isPollingActive) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateOffset}&timeout=15`,
          { method: "GET" }
        );
        const data = await response.json();

        if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
          for (const update of data.result) {
            lastUpdateOffset = update.update_id + 1;
            await handleTelegramUpdate(update);
          }
        }
      } catch (pollErr) {
        // Small delay if network hiccup
        await new Promise((r) => setTimeout(r, 2000));
      }
      // Brief yield
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  pollUpdates().catch((err) => console.error("[Telegram Bot] Polling loop error:", err));
}

// 1. Get Bot Info & Health Check
app.get("/api/bot/status", async (req, res) => {
  try {
    const botInfo = await callTelegramApi("getMe", {});
    const webhookInfo = await callTelegramApi("getWebhookInfo", {});
    res.json({
      success: true,
      bot: botInfo?.result || null,
      webhook: webhookInfo?.result || null,
      appUrl: process.env.APP_URL || `${req.protocol}://${req.get("host")}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
});

// 2. Setup / Refresh Telegram Webhook automatically
app.post("/api/bot/setup-webhook", async (req, res) => {
  try {
    const appUrl = getPublicAppUrl();
    const serverHostUrl = (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
    const webhookUrl = `${serverHostUrl}/api/bot/webhook`;

    const result = await callTelegramApi("setWebhook", {
      url: webhookUrl,
      drop_pending_updates: false,
    });

    // Also configure bot menu button to launch the public Vercel Web App directly
    await callTelegramApi("setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text: "⚡️ Earn",
        web_app: {
          url: appUrl,
        },
      },
    });

    // Set bot commands
    await callTelegramApi("setMyCommands", {
      commands: [
        { command: "start", description: "Start the bot & open earning app" },
        { command: "earn", description: "Open PayPlus Bolt Mini App" },
        { command: "balance", description: "Check your earning stats" },
        { command: "help", description: "Get support & rules" },
      ],
    });

    res.json({ success: true, webhookUrl, appUrl, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
});

// 3. Send test or manual interactive welcome message to any chat
app.post("/api/bot/send-welcome", async (req, res) => {
  try {
    const { chatId, firstName, startParam } = req.body;
    if (!chatId) {
      return res.status(400).json({ error: "chatId is required" });
    }
    const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
    const payload = buildWelcomePayload(chatId, firstName || "User", appUrl, startParam);
    const result = await callTelegramApi("sendMessage", payload);
    res.json({ success: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
});

// 4. Webhook Receiver for live Telegram user events (/start, /earn, etc.)
app.post("/api/bot/webhook", async (req, res) => {
  try {
    const update = req.body;
    if (update) {
      await handleTelegramUpdate(update);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.sendStatus(200);
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
    console.log(`Server running on http://localhost:${PORT}`);
    // Start automated Telegram polling service
    startTelegramLongPolling().catch((err) => {
      console.warn("[Telegram Bot] Long polling initialization error:", err);
    });
  });
}

startServer();
