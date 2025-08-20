const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session')

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true // sirf pehli dafa local pe chalega
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            console.log('Connection closed, reconnecting...')
            startBot()
        } else if(connection === 'open') {
            console.log('✅ Bot connected!')
        }
    })

    sock.ev.on('messages.upsert', async (msg) => {
        const m = msg.messages[0]
        if(!m.message || m.key.fromMe) return

        const sender = m.pushName || "User"
        const jid = m.key.remoteJid

        await sock.sendMessage(jid, {
            text: `Welcome 🤗 ${sender}\nTo watch ads and earn now!\n\nHave you joined our community?`,
            buttons: [
                { buttonId: 'yes_joined', buttonText: { displayText: '✅ Yes' }, type: 1 },
                { buttonId: 'no_joined', buttonText: { displayText: '❌ No' }, type: 1 }
            ],
            headerType: 1
        })
    })
}

startBot()
