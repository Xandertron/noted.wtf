import { server } from '../../config'
const crypto = require("crypto")
let pastes = {}

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
                else {
                    res.status(200).json(pastes[req.query.id])
                }
                //res.set('Content-Type', 'text/plain')
                //res.status(200).send(content)
            }
            catch (err) {
                res.status(500).end()
                console.log(err)
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
