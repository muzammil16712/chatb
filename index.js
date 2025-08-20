require("dotenv").config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state
  });

  // 🔑 Pairing code system
  if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER;
    console.log("📲 Pairing code generate ho raha hai...");
    const code = await sock.requestPairingCode(phoneNumber);
    console.log("👉 Apna WhatsApp kholo > Linked Devices > Link with phone number");
    console.log("✅ Pairing code: ", code);
  }

  sock.ev.on("creds.update", saveCreds);

  // 👇 Messages handle karo
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const name = msg.pushName || "User";

    // First Welcome Message with Buttons
    const buttons = [
      { buttonId: "yes_joined", buttonText: { displayText: "✅ Yes" }, type: 1 },
      { buttonId: "no_joined", buttonText: { displayText: "❌ No" }, type: 1 }
    ];

    await sock.sendMessage(from, {
      text: `👋 *${name}*, Welcome 🤗 to *Watch Ads and Earn!* 💰\n\n❓ Kiya ap ne Hamari community join ki hai?`,
      footer: "Online Earning With Ads",
      buttons,
      headerType: 1
    });
  });

  // 👇 Buttons ka jawab
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const btn = msg.message.buttonsResponseMessage?.selectedButtonId;

    if (btn === "yes_joined") {
      await sock.sendMessage(from, { text: "🎉 Thanks for joining! Kindly save my number and send screenshot please." });
    }

    if (btn === "no_joined") {
      await sock.sendMessage(from, { text: "📌 Please join our community here: https://chat.whatsapp.com/XXXXXXX" });
    }
  });
}

connectBot();
