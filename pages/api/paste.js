import { server } from '../../config'
const crypto = require("crypto")
var parse = require('parse-duration')
import { db } from '../../prisma/server.js'
import { Prisma } from '@prisma/client'
const azoneniner = new RegExp("^[A-Za-z0-9_-]+$")
const test = (title) => {
    if (azoneniner.test(title)) {
        if(title.length > 24) {
            return false
        }
        return true
    }
}
const { WebhookClient } = require("discord.js")
const log = new WebhookClient({ url: "https://discord.com/api/webhooks/1038121597074145310/yARH_7qWrLTy73ZG3oi-Ns4y9mc2QAL50mYqrlpRYPOMA5xOqxxFELwN3VOADvtqT8_B" });
const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
export default async function handler(req, res) {
    try {
        if (req.method === "POST") {
            if (req.body.content.length >= 5) {
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
                }
                log.send(`new paste created via post!\n${server}/${paste.id}`)
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
                        await db.paste.delete({
                            where: {
                                id: req.query.paste,
                            },
                        })
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
                        if (req.query.content.length >= 5) {
                            let modkey = crypto.randomBytes(10).toString("base64url")
                            let expires = new Date(Date.now() + clamp(parse(req.query.expires), 30000, 2592000000))
                            let paste
                            let title
                            if (req.query.title === "") {
                                title = crypto.randomBytes(4).toString("base64url")
                            }
                            else {
                                if (test(req.query.title)) {
                                    title = req.query.title
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
                                        content: req.query.content,
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
                                                content: req.query.content,
                                                modifyKey: modkey
                                            }
                                        })
                                    }
                                }
                            }
                            log.send(`new paste created via get!\n${server}/${paste.id}`)
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
                    id: req.body.id
                }
            })
            if (paste === null) {
                res.status(404).json({ error: "invalid or expired paste" })
            }
            if (paste.modifyKey === req.body.modifyKey) {
                await db.paste.delete({
                    where: {
                        id: req.body.pasteID,
                    }
                })
                res.status(200).json(paste)
            }
        }
        else {
            res.status(404).send("bruh")
        }
    }
    catch (err) {
        res.status(500).end()
        console.log(err)
    }
}
