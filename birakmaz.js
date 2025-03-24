const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log("Bot başlatılıyor...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

client.on('qr', qr => {
    console.log('QR kodunu tara:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('WhatsApp botu hazır!');

    let targetNumber = '905319149912'; // Telefon numarası
    let chatId = targetNumber + '@c.us';

    // 📌 Gönderilecek mesajlar listesi
    let messages = [
        'Seven Bırakmaz Biliyorum',
        'Şu An her saniye seni beklediğim gibi seni çok seviyorum',
        'İnnallahe Meas Sabirin.'
    ];

    let firstMessage = messages[0]; // İlk mesaj
    let otherMessages = messages.slice(1); // Diğer mesajlar
    let firstMessageDelivered = false; // İlk mesaj iletilene kadar false

    // 📌 İlk mesajı sürekli gönderen fonksiyon (mesaj iletilene kadar)
    async function sendFirstMessageUntilDelivered() {
        let sentMessage = await client.sendMessage(chatId, firstMessage);
        console.log(`Mesaj gönderildi: ${firstMessage}`);

        // 📌 İlk mesajı her 5 saniyede bir kontrol et
        let checkInterval = setInterval(async () => {
            let chat = await client.getChatById(chatId);
            let messages = await chat.fetchMessages({ limit: 10 });

            let updatedMessage = messages.find(m => m.id.id === sentMessage.id.id);
            if (updatedMessage && updatedMessage.ack === 2) { // "2" çift tik (iletildi)
                console.log("İlk mesaj iletildi! Diğer mesajlara geçiliyor...");
                firstMessageDelivered = true;
                clearInterval(checkInterval);
                sendOtherMessages(); // Diğer mesajları sırayla gönder
            }
        }, 5000);
    }

    // 📌 İlk mesajı sürekli göndermeye başla
    let firstMessageInterval = setInterval(() => {
        if (!firstMessageDelivered) {
            sendFirstMessageUntilDelivered();
        } else {
            clearInterval(firstMessageInterval);
        }
    }, 10000); // 10 saniyede bir tekrar dene

    // 📌 Diğer mesajları sırayla gönderen fonksiyon
    async function sendOtherMessages() {
        for (let msg of otherMessages) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 saniye bekle
            await client.sendMessage(chatId, msg);
            console.log(`Mesaj gönderildi: ${msg}`);
        }
        console.log("Tüm mesajlar gönderildi, bot durduruluyor...");
        process.exit(0); // Botu kapat
    }
});

client.initialize();

