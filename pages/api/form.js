import { server } from '../../config'
const crypto = require("crypto")
var parse = require('parse-duration')
import { db } from '../../prisma/server.js'
//content: "Hi, welcome to noted.wtf\n\nCredits:\nhttps://github.com/kognise/water.css\nhighlight.js\nnext.js"

const { WebhookClient } = require("discord.js")
const log = new WebhookClient({ url: "https://discord.com/api/webhooks/1038121597074145310/yARH_7qWrLTy73ZG3oi-Ns4y9mc2QAL50mYqrlpRYPOMA5xOqxxFELwN3VOADvtqT8_B" });

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
let recent = []

export default async function handler(req, res) {
    try {
        if (req.method === "POST") {
            if (req.body.method == "delete") {
                const paste = await db.paste.findUnique({
                    where: {
                        id: req.body.pasteID
                    }
                })
                if (paste === null) {
                    res.status(404).json({ error: "invalid or expired paste" })
                }
                if (paste.modifyKey === req.body.modifykey) {
                    await db.paste.delete({
                        where: {
                            id: req.body.pasteID,
                        }
                    })
                    res.redirect(302, `${server}`)
                }
                else {
                    res.status(401).json({ error: "invalid paste key, please go back using your browser's back button" })
                }
            }
            if (req.body.content.length >= 5) {
                let id = crypto.randomBytes(4).toString("base64url")
                let modkey = crypto.randomBytes(10).toString("base64url")
                let expires = new Date(Date.now() + clamp(parse(req.body.expires), 30000, 2592000000))
                const paste = await db.paste.create({
                    data: {
                        id: id,
                        expiresAt: expires,
                        content: req.body.content,
                        modifyKey: modkey
                    }
                })
                if (req.body.public) {
                    if (recent.length >= 10) {
                        recent.shift()
                    }
                    recent.push({ id: id, expires: expires })
                }
                log.send(`new ${req.body.public ? "public" : "private"} paste created!\n${server}/${id}`)
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
        else if(req.method=="GET"){
            if (req.query.method === "recent") {
                if (recent.length == 0) {
                    res.status(404).json({ error: "no recent pastes" })
                }
                else {
                    res.status(200).json(recent)
                }
            }
        }
    }
    catch (err) {
        res.status(500).end()
        console.log(err)
    }
}
