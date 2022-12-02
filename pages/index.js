//<p align="right" style={{ margin: "0px", display: "inline", float: "right" }}><a href="/stats">Stats</a></p>
import Head from "next/head"
import Script from 'next/script'
export default function HomePage() {
    return (
        <><Head>
            <title>noted.wtf</title>
            <meta property="og:title" content="noted.wtf" />
            <meta name="twitter:title" content="noted.wtf" />
        </Head><div>
                <b>🏠 noted.wtf</b>
                <p align="right" style={{ margin: "0px", display: "inline", float: "right" }}>
                    <a href={`/docs`}><b>api</b></a> | <a href={`/recent`}><b>recent pastes</b></a>
                </p>
                <hr />

                <form action="api/form" method="post">
                    <textarea id="content" name="content" rows="20" minLength="5" required placeholder="--put paste contents here" />
                    <br />
                    <label htmlFor="expires">Enter the amount of time until the paste expires following the format of 0d 0h 0m 0s<br /> (maximum of 720 hours / 30 days)</label>
                    <input
                        type="string"
                        id="expires"
                        name="expires"
                        defaultValue="3h 0m"
                        placeholder="29d10h2m49s"
                        required />
                    <br />
                    <label htmlFor="title">Enter a title for the paste, or leave it blank for random</label>
                    <br/>
                    <input style={{ display: "inline" }} type="text" id="title" name="title" placeholder="my_passwords" pattern="^[A-Za-z0-9_-]+$" maxLength="24" title="Title may only contain letters A to Z, numbers 0 to 9, or characters: _-" />
                    <br /><br/>
                    <label htmlFor="name">(optional) Enter a password and click the button to encrypt the contents above. Requires Javascript.<br />Make sure to save it somewhere!</label>
                    <br />
                    <input style={{ display: "inline" }} type="text" id="password" name="password" placeholder="p@s5w0rd!" />
                    <button style={{ display: "inline" }} id="encrypt" type="button">Encrypt</button>
                    <br /><br />
                    <input type="checkbox" name="public" defaultChecked />
                    <label htmlFor="public">Publicly listed on <a href={`/recent`} target="child"><b>recents</b></a></label>
                    <br />
                    <button type="submit">Submit</button>
                </form>
                <Script src="./triplesec.min.js" />
                <Script
                    id="encryptpaste"
                    dangerouslySetInnerHTML={{
                        __html: `
                        document.getElementById('content').oninput = ()=>{document.getElementById('encrypt').disabled = false}
                        document.getElementById('encrypt').onclick = function(){
                            document.getElementById('encrypt').disabled = true
                            triplesec.encrypt ({
                                data: new triplesec.Buffer(document.getElementById('content').value),
                                key: new triplesec.Buffer(document.getElementById('password').value),
                            }, function(err, buff) {
                                if (! err) { 
                                    var ciphertext = buff.toString('hex');
                                    document.getElementById('content').value = ciphertext
                                }
                            });
                        }`
                    }}
                />
            </div></>
    )
}
//<label htmlFor="name">Enter a password to make it a private paste, or leave it blank to make it public</label>
//<input type="text" id="password" name="password" placeholder="p@s5w0rd!" pattern="^[A-Za-z0-9!@#$%^&*()]+$" title="Your password may only contain letters A to Z, numbers 0 to 9, or characters !@#$%^&*()"/>
//<br/>
/*
<label htmlFor="expires">Enter the amount of hours until the paste expires<br /> (max 168 hours / one week)</label>
                <input
                    type="number"
                    id="expires"
                    name="expires"
                    min="0"
                    max="3"
                    defaultValue="3"
                    required
                />
                */