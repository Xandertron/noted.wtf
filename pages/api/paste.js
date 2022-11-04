import { server } from '../../config'
const crypto = require("crypto")
const { WebhookClient } = require("discord.js")
let pastes = {
    "about": {
        content: "Hi, welcome to noted.wtf\n\nCredits:\nhttps://github.com/kognise/water.css\nhighlight.js\nnext.js"
    }
}
const log = new WebhookClient({ url: "https://discord.com/api/webhooks/1038121597074145310/yARH_7qWrLTy73ZG3oi-Ns4y9mc2QAL50mYqrlpRYPOMA5xOqxxFELwN3VOADvtqT8_B" });
export default function handler(req, res) {
    try {
        if (req.method === "POST") {
            let id = crypto.randomBytes(4).toString("base64url")
            let modkey = crypto.randomBytes(10).toString("base64url")
            if (req.body.content.length > 5) {
                let paste
                if (pastes[req.query.id] === undefined) {
                    paste = pastes[id] = {
                        content: req.body.content,
                        modifykey: modkey,
                        id: id,
                        link: `${server}/${id}`
                    }
                }
                else {
                    //this probably wont happen, but if it does, just make it longer l o l
                    let id = crypto.randomBytes(5).toString("base64url")
                    paste = pastes[id] = {
                        content: req.body.content,
                        modifykey: modkey,
                        id: id,
                        link: server + id
                    }
                }
                log.send(`new paste created!\n${paste.link}`)
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
                if (pastes[req.query.id] === undefined) {
                    res.status(404).json({ error: "invalid or expired paste" })
                }
                else if (req.query.raw == "true") {
                    let paste = pastes[req.query.id]
                    if (paste === undefined) {
                        res.status(404).json({ error: "invalid or expired paste" })
                    }
                    else {
                        res.setHeaders('Content-Type', 'text/plain')
                        res.status(200).send(paste.content)
                    }
                }
                else {
                    res.status(200).json(pastes[req.query.id])
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
