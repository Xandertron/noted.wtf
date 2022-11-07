export default function HomePage() {
    return (
        <div>
            noted.wtf
            <p align="right" style={{ margin: "0px", display: "inline", float: "right" }}><a href="/stats">Stats</a></p>
            <hr />

            <form action="api/paste" method="post">
                <textarea id="content" name="content" rows="20" minlength="5" required placeholder="--put paste contents here" />
                <br />
                <label htmlFor="expires">Enter the amount of hours until the paste expires<br /> (max 168 hours / one week)</label>
                <input
                    type="number"
                    id="expires"
                    name="expires"
                    min="0.0083"
                    max="168"
                    step="any"
                    defaultValue="3"
                    required
                />
                paste password will be implemented soon(tm)
                <br />
                <button type="submit">Submit</button>
            </form>
        </div>
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