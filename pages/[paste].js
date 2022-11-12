import Script from 'next/script'
import Head from "next/head"
const hljs = require('highlight.js')
const xss = require("xss")
import { server } from '../config'
import { db } from '../prisma/server.js'

export default function Paste({ paste }) {
    let html = hljs.highlightAuto(paste.content).value
    let disc = encodeURIComponent((paste.content.length > 80) ? paste.content.substring(0, 77) + "..." : paste.content)
    return (
        <>
            <Head>
                <title>noted.wtf | {paste.id}</title>
                <meta property="og:title" content={"noted.wtf | "+paste.id} />
                <meta name="twitter:title" content={"noted.wtf | "+paste.id} />
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
            <form action="api/paste" method="post">
                <button style={{ display: "inline" }} type="submit">Delete</button>
                <input style={{ display: "inline" }} type="text" id="modifykey" name="modifykey" placeholder="paste key" defaultValue={paste.modifyKey} />
                <input type="hidden" id="pasteID" name="pasteID" defaultValue={paste.id} />
                <input type="hidden" id="method" name="method" defaultValue="delete" />
            </form>
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