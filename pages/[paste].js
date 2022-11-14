import Script from 'next/script'
import Head from "next/head"
const hljs = require('highlight.js')
const xss = require("xss")
import { server } from '../config'
import { db } from '../prisma/server.js'

export default function Paste({ paste }) {
    let html = hljs.highlightAuto(paste.content).value
    let title = "noted.wtf | "+paste.id
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta property="og:title" content={"noted.wtf | " + paste.id} />
                <meta name="twitter:title" content={"noted.wtf | " + paste.id} />
            </Head>
            <br />
            <a href={server}><b>noted.wtf</b></a>
            <p align="right" style={{ margin: "0px", display: "inline", float: "right" }}>
                <a href={`${server}/api/paste?id=${paste.id}&raw=true`}><b>raw</b> </a>
                |
                <a href={`${server}/${paste.id}`}> <b>share {(paste.modifyKey.length > 10) ? "without key" : ""}</b></a>
            </p>
            <hr />
            <br />
            Created: {paste.created}<br />
            Expires on: {paste.expires}<br />
            Views: {paste.views}
            <pre>
                <code id="code" dangerouslySetInnerHTML={{ __html: html }} />
            </pre>

            <input style={{ display: "inline" }} id="password" type="text" placeholder="p@s5w0rd!" />
            <button style={{ display: "inline" }} id="decrypt" type="button">Decrypt</button>
            <input type="hidden" id="rawcontent" defaultValue={paste.content} />

            <form action="api/paste" method="post">
                <input style={{ display: "inline" }} type="text" id="modifykey" name="modifykey" placeholder="paste key" defaultValue={paste.modifyKey} />
                <button style={{ display: "inline" }} type="submit">Delete</button>
                <input type="hidden" id="pasteID" name="pasteID" defaultValue={paste.id} />
                <input type="hidden" id="method" name="method" defaultValue="delete" />
            </form>
            <Script src="./triplesec-min.js" />
            <Script src="./xss.js" />
            <Script
                id="decryptpaste"
                dangerouslySetInnerHTML={{
                    __html: `
                        document.getElementById('decrypt').onclick = function(){
                            document.getElementById('decrypt').disabled = true
                            triplesec.decrypt ({
                                data: new triplesec.Buffer(document.getElementById('rawcontent').value, "hex"),
                                key: new triplesec.Buffer(document.getElementById('password').value),
                            }, function(err, buff) {
                                if (! err) { 
                                    document.getElementById('code').innerHTML = filterXSS(buff.toString())
                                    hljs.highlightAll()
                                }
                                else{
                                    alert(err)
                                    document.getElementById('decrypt').disabled = false
                                }
                            });
                        }`
                }}
            />
            <Script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js" />
        </>
    )
}

export async function getServerSideProps(req) {
    console.log(req.resolvedUrl)
    let acclang = req.req.headers["accept-language"] || "en-US"
    let lang = acclang.split(",")
    let locale = lang[0] || "en-US"
    const paste = await db.paste.findUnique({
        where: {
            id: req.query.paste
        }
    })
    console.log(paste)
    if (paste === null) {
        return {
            notFound: true,
        }
    }
    else if (Date.now() > paste.expiresAt) {
        await db.paste.delete({
            where: {
                id: req.query.paste,
            },
        })
        return {
            notFound: true,
        }
    }
    await db.paste.update({
        where: { id: req.query.paste },
        data: { views: { increment: 1 } }
    })
    return {
        props: {
            paste: {
                created: new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'long' }).format(paste.createdAt),
                expires: new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'long' }).format(paste.expiresAt),
                content: paste.content,
                modifyKey: req.query.key || "",
                views: paste.views,
                id: req.query.paste
            }
        }
    }
} 