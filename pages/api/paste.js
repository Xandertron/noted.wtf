import { server } from '../../config'
const crypto = require("crypto")
let pastes = {
    "about": {
        content: "Hi, welcome to noted.wtf\n\nCredits:\nhttps://github.com/kognise/water.css\nhighlight.js\nnext.js"
    }
}

export default function handler(req, res) {
    try {
        if (req.method === "POST") {
            console.log(req.body)
            let id = crypto.randomBytes(4).toString("base64url")
            let modkey = crypto.randomBytes(10).toString("base64url")
            if (req.body.content.length > 3) {
                pastes[id] = {
                    content: req.body.content,
                    modifykey: modkey
                }
            }
            res.redirect(302, `${server}/${id}?key=${modkey}`)
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
