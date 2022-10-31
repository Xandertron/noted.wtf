const hljs = require("highlight.js")
const xss = require("xss")
import { server } from '../config'
export default function Paste({ paste }) {
    let html = hljs.highlightAuto(paste.content).value
    return (
        <>balls<hr /><pre>
            <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre></>
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