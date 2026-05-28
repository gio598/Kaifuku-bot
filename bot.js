const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

// --- KONFIGURASI (ISI DISINI) ---
const token = '8264599904:AAE4YyNRgR6iOru-AYEpfl82HfGQS6r1KsI'; // Dapatkan dari @BotFather
const adminChatId = '7710930589'; // Cek di @userinfobot
const pteroUrl = 'https://michie48.web.id'; // Link panel pterodactyl
const pteroKey = 'ptla_bwOdCOiEHSAyWjc8xlrrR9k6r5n3n53KdOipsksNk1r'; // API Key Admin dari Panel

const bot = new TelegramBot(token, {polling: true});
console.log('Bot Kaifuku Store Aktif...');

// 1. Menerima Pesan Order dari Web
bot.onText(/order Node: (.*) seharga Rp(.*)/, (msg, match) => {
    const chatId = msg.chat.id;
    const item = match[1];
    const price = match[2];
    bot.sendMessage(chatId, `🚀 *Pesanan Diterima!*\nProduk: ${item}\nHarga: Rp${price}\n\nSilakan transfer ke QRIS berikut dan kirim bukti transfer.`, {parse_mode: 'Markdown'});
    if (fs.existsSync('./qris.jpg')) {
        bot.sendPhoto(chatId, './qris.jpg', {caption: 'Scan QRIS untuk pembayaran'});
    } else {
        bot.sendMessage(chatId, 'Gagal mengirim QRIS. Silakan hubungi admin.');
    }
    bot.sendMessage(adminChatId, `🔔 *ADA PESANAN!*\nUser: @${msg.from.username || 'Tanpa Username'}\nID: ${chatId}\nItem: ${item}`);
});

// 2. Command ACC Admin
// Format: /acc [ID_CHAT] [USERNAME] [EMAIL]
bot.onText(/\/acc (\d+) (\w+) (.+)/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const [_, targetChatId, userName, userEmail] = match;
    bot.sendMessage(adminChatId, '⏳ Sedang memproses ke panel...');
    try {
        const response = await axios.post(`${pteroUrl}/api/application/users`, {
            username: userName, email: userEmail, first_name: userName, last_name: 'Customer', password: 'User123!'
        }, {
            headers: { 'Authorization': `Bearer ${pteroKey}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }
        });
        bot.sendMessage(targetChatId, `✅ *ORDER DI-ACC!*\n\nAkses Panel:\n🌐 URL: ${pteroUrl}\n📧 Email: ${userEmail}\n🔑 Pass: User123!\n\nSegera ganti password!`, {parse_mode: 'Markdown'});
        bot.sendMessage(adminChatId, '✅ Berhasil dibuatkan akun.');
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
        bot.sendMessage(adminChatId, '❌ Gagal. Periksa API Key atau URL Panel.');
    }
});