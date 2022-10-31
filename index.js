const express = require("express")
const bodyParser = require('body-parser')
const path = require('path')
const crypto = require("crypto")
const xss = require('xss');

var app = express();

let pastes = {}


app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')));
app.post("/v1/paste/", (req, res) => {
    try {
        console.log(req.body)
        id = crypto.randomBytes(4).toString("base64url")
        if (req.body.content.length > 3) {
            pastes[id] = { content: req.body.content }
        }
        res.status(200).json({
            link: `http://localhost:8080/` + id,
            key: "not implemented"
        })
    }
    catch (err) {
        res.status(500).end()
        console.log(err)
    }
})
app.get("/v1/paste/", (req, res) => {
    try {
        console.log(req.query.content.length)
        id = crypto.randomBytes(4).toString("base64url")
        if (req.query.content.length > 3) {
            pastes[id] = { content: req.query.content }
        }
        res.status(200).json({
            link: `http://localhost:8080/` + id,
            key: "not implemented"
        })
    }
    catch (err) {
        res.status(500).end()
        console.log(err)
    }
})
app.get("/:pasteid", (req, res) => {
    try {
        content = pastes[req.params.pasteid].content
        //safe = xss(content)
        safe = content
        res.status(200).send("<!DOCTYPE html><link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/water.css@2/out/dark.min.css\"><link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/a11y-dark.min.css\"><script src=\"https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js\"></script><script>hljs.highlightAll();</script><pre><code>"+safe+"</code></pre>")
    }
    catch (err) {
        res.status(500).end()
        console.log(err)
    }
})

app.listen(8080);
console.log('listening on port 8080');

