import { server } from '../../config'
const crypto = require("crypto")
var parse = require('parse-duration')
import { db } from '../../prisma/server.js'
import { Prisma } from '@prisma/client'
const azoneniner = new RegExp("^[A-Za-z0-9_-]+$")
const test = (title) => {
    if (azoneniner.test(title)) {
        if (title.length > 24) {
            return false
        }
        return true
    }
}
const { WebhookClient } = require("discord.js")
const log = new WebhookClient({ url: "https://discord.com/api/webhooks/1038121597074145310/yARH_7qWrLTy73ZG3oi-Ns4y9mc2QAL50mYqrlpRYPOMA5xOqxxFELwN3VOADvtqT8_B" });

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
const recent = {
    recents: new Array(),
    get: () => {
        return recent.recents
    },
    add: (id, expires) => {
        if (recent.recents.length >= 10) {
            recent.recents.shift()
        }
        recent.recents.push({id: id, expires: expires})
    }
}

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
                if (req.body.modifykey === paste.modifyKey) {
                    await db.paste.delete({
                        where: {
                            id: req.body.pasteID,
                        }
                    })
                    res.redirect(302, `${server}`)
                }
                else if (req.body.modifykey === process.env.ADMINPASS) {
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
            else if (req.body.content.length >= 5) {
                let modkey = crypto.randomBytes(10).toString("base64url")
                let expires = new Date(Date.now() + clamp(parse(req.body.expires), 30000, 2592000000))
                let paste
                let title
                if (req.body.title === "") {
                    title = crypto.randomBytes(4).toString("base64url")
                }
                else {
                    if (test(req.body.title)) {
                        title = req.body.title
                    }
                    else {
                        res.status(400).json({ error: "wrong format dummy, dont try and bypass this" })
                    }
                }
                try {
                    paste = await db.paste.create({
                        data: {
                            id: title,
                            expiresAt: expires,
                            content: req.body.content,
                            modifyKey: modkey
                        }
                    })
                }
                catch (e) {
                    if (e instanceof Prisma.PrismaClientKnownRequestError) {
                        if (e.code === "P2002") {
                            paste = await db.paste.create({
                                data: {
                                    id: title + "_" + crypto.randomBytes(4).toString("base64url"),
                                    expiresAt: expires,
                                    content: req.body.content,
                                    modifyKey: modkey
                                }
                            })
                        }
                    }
                    else{
                        console.log(e)
                    }
                }
                if (req.body.public === "on") {
                    recent.add(paste.id, expires)
                }
                log.send(`new ${req.body.public === "on" ? "public" : "private"} paste created!\n${server}/${paste.id}`)
                if (req.headers["content-type"] == "application/x-www-form-urlencoded") {
                    res.redirect(302, `${server}/${paste.id}?key=${modkey}`)
                }
                else {
                    res.status(200).json(paste)
                }
            }
            else {
                res.status(400).json({ error: "content length must be more than 5 characters" })
            }
        }
        else if (req.method == "GET") {
            if (req.query.method === "recent") {
                if (recent.get() == 0) {
                    res.status(404).json({ error: "no recent pastes" })
                }
                else {
                    res.status(200).json(recent.get())
                }
            }
        }
    }
    catch (err) {
        res.status(500).end()
        console.log(err)
    }
}
