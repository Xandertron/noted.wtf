import { server } from '../../config'
const crypto = require("crypto")
var parse = require('parse-duration')
import { db } from '../../prisma/server.js'
//content: "Hi, welcome to noted.wtf\n\nCredits:\nhttps://github.com/kognise/water.css\nhighlight.js\nnext.js"

const { WebhookClient } = require("discord.js")
const log = new WebhookClient({ url: "https://discord.com/api/webhooks/1038121597074145310/yARH_7qWrLTy73ZG3oi-Ns4y9mc2QAL50mYqrlpRYPOMA5xOqxxFELwN3VOADvtqT8_B" });

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
export default async function handler(req, res) {
    try {
        if (req.method === "POST") {
            if (req.body.content.length >= 5) {
                let id = crypto.randomBytes(4).toString("base64url")
                let modkey = crypto.randomBytes(10).toString("base64url")
                const paste = await db.paste.create({
                    data: {
                        id: id,
                        expiresAt: new Date(Date.now() + clamp(parse(req.body.expires), 30000, 2592000000)),
                        content: req.body.content,
                        modifyKey: modkey
                    }
                })
                log.send(`new paste created!\n${server}/${id}`)
                res.status(200).json(paste)
            }
            else {
                res.status(400).json({ error: "content length must be more than 5 characters" })
            }
        }
        else if (req.method === "GET") {
            try {
                if (req.query.method === undefined) {
                    const paste = await db.paste.findUnique({
                        where: {
                            id: req.query.id
                        }
                    })
                    console.log(paste)
                    if (paste === null) {
                        res.status(404).json({ error: "invalid or expired paste" })
                    }
                    else if (Date.now() > paste.expiresAt) {
                        res.status(404).json({ error: "invalid or expired paste" })
                    }
                    else if (req.query.raw == "true") {
                        res.setHeader('Content-Type', 'text/plain')
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
                else {
                    if (req.query.method === "post") {
                        let id = crypto.randomBytes(4).toString("base64url")
                        let modkey = crypto.randomBytes(10).toString("base64url")
                        if (req.query.content.length >= 5) {
                            const paste = await db.paste.create({
                                data: {
                                    id: id,
                                    expiresAt: new Date(Date.now() + clamp(req.query.expires || 3, 0.0083, 720) * 60 * 60 * 1000),
                                    content: req.query.content,
                                    modifyKey: modkey
                                }
                            })
                            log.send(`new paste created!\n${server}/${id}`)
                            res.status(200).json(paste)
                        }
                        else {
                            res.status(400).json({ error: "content length must be more than 5 characters" })
                        }
                    }
                    else {
                        res.status(400).json({ error: "wrong usage dummy" })
                    }
                }
            }
            catch (err) {
                res.status(500).end()
                console.log(err)
            }
        }
        else if (req.method === "DELETE") {
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
                res.status(200).json(paste)
            }
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
