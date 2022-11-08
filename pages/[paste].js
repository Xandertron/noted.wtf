import Script from 'next/script'
const hljs = require('highlight.js')
const xss = require("xss")
import { server } from '../config'
import { db } from '../prisma/server.js'

export default function Paste({ paste }) {
    if (paste.content === undefined) {
        paste = { content: "404, Paste not found!\nEither an error occured or the paste does not exist" }
    }
    let html = hljs.highlightAuto(paste.content).value
    return (
        <>
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
    let lang = req.req.headers["accept-language"].split(",")
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