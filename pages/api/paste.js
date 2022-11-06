import { server } from '../../config'
const crypto = require("crypto")
import { db } from '../../prisma/server.js'
//content: "Hi, welcome to noted.wtf\n\nCredits:\nhttps://github.com/kognise/water.css\nhighlight.js\nnext.js"
const { WebhookClient } = require("discord.js")
const log = new WebhookClient({ url: "https://discord.com/api/webhooks/1038121597074145310/yARH_7qWrLTy73ZG3oi-Ns4y9mc2QAL50mYqrlpRYPOMA5xOqxxFELwN3VOADvtqT8_B" });

export default async function handler(req, res) {
    try {
        if (req.method === "POST") {
            let id = crypto.randomBytes(4).toString("base64url")
            let modkey = crypto.randomBytes(10).toString("base64url")
            if (req.body.content.length > 5) {
                const newPaste = await db.paste.create({
                    data: {
                        id: id,
                        expiresAt: new Date(Date.now() + req.body.expires * 60 * 60 * 1000),
                        content: req.body.content,
                        modifyKey: modkey
                    }
                    //id String @id @unique
                    //createdAt DateTime @default(now())
                    //expiresAt DateTime
                    //content String
                    //modifyKey String
                })
                log.send(`new paste created!\n${server}/${id}`)
                if (req.headers["content-type"] == "application/x-www-form-urlencoded") {
                    res.redirect(302, `${server}/${id}?key=${modkey}`)
                }
                else {
                    res.status(200).json(paste)
                }
            }
            else {
                res.status(400).json({ error: "content length must be more than 5 characters" })
            }
        }
        else if (req.method === "GET") {
            try {
                const paste = await db.paste.findUnique({
                    where: {
                        id: req.query.id
                    }
                })
                console.log(paste)
                if (paste === null) {
                    res.status(404).json({ error: "invalid or expired paste" })
                }
                else if (Date.now() > paste.expiresAt){
                    res.status(404).json({ error: "invalid or expired paste" })
                }
                else if (req.query.raw == "true") {
                    res.setHeaders('Content-Type', 'text/plain')
                    res.status(200).send(paste.content)
                }
                else {
                    res.status(200).json({
                        content: paste.content,
                        created: paste.createdAt,
                        expires: paste.expiresAt,
                        id: paste.id
                    })
                }

            }
            catch (err) {
                res.status(500).end()
                console.log(err)
            }
        }
        else if (req.method === "DELETE") {
            console.log(req)
        }
        else {
            res.status(404).send("bruh you fucking stupid or something?")
        }
    }
    catch (err) {
        res.status(500).end()
        console.log(err)
    }
}
