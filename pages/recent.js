//<p align="right" style={{ margin: "0px", display: "inline", float: "right" }}><a href="/stats">Stats</a></p>
import Head from "next/head"
import { server } from '../config'
export default function Recent({ recent, none }) {
    if (none) {
        return (
            <><Head>
                <title>noted.wtf - recent</title>
                <meta property="og:title" content="noted.wtf - recent" />
                <meta name="twitter:title" content="noted.wtf - recent" />
            </Head><div>
                    <a href="/"><b>noted.wtf</b></a>
                    <hr />
                    there are no recent pastes, please try again later
                </div></>
        )
    }
    return (
        <><Head>
            <title>noted.wtf - recent</title>
            <meta property="og:title" content="noted.wtf - recent" />
            <meta name="twitter:title" content="noted.wtf - recent" />
        </Head><div>
                <a href="/"><b>↩ noted.wtf</b></a>
                <hr />
                {recent.map((r) => (<><a id={r.id} href={`${server}/${r.id}`}>{r.id} - Expires: {r.expires}</a><br/><br/> </>))}
            </div></>
    )
}

export async function getServerSideProps(req) {
    let acclang = req.req.headers["accept-language"] || "en-US"
    let lang = acclang.split(",")
    let locale = lang[0] || "en-US"
    const res = await fetch(`${server}/api/form?method=recent`)
    if (res.status == 404) {
        return { props: { none: true } }
    }
    else {
        let rj = await res.json()
        let recent = []
        rj.forEach(paste => {
            if (Date.now() < new Date(paste.expires)) {
                paste.expires = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'long' }).format(new Date(paste.expires))
                recent.push(paste)
            }
        })
        return { props: { recent } }
    }
} 