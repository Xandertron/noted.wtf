import Script from 'next/script'
const hljs = require('highlight.js')
const xss = require("xss")
import { server } from '../config'
export default function Paste({ paste }) {

    let html = hljs.highlightAuto(paste.content).value
    return (
        <>
            <a href={server}>noted.wtf</a>
            <hr />
            <pre>
                <code dangerouslySetInnerHTML={{ __html: html }} />
            </pre>
            <hr />
            <form action="api/paste" method="delete">
                <input type="text" id="modifykey" name="modifykey" placeholder="paste key" /> <button type="submit">Delete</button>
            </form>
            <Script id="show-key">document.getElementById("modifykey").value = (new URL(document.location)).searchParams.get("key")</Script>
        </>
    )
}
export async function getStaticPaths() {
    return {
        paths: [],
        fallback: 'blocking',
    }
}
export async function getStaticProps({ params }) {
    console.log(params)
    const res = await fetch(`${server}/api/paste?id=${params.paste}`)
    const paste = await res.json()
    return { props: { paste } }
} 