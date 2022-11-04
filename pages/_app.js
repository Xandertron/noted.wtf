import '../public/dark.min.css'
import '../public/a11y-dark.min.css'
import { GoogleAnalytics } from "nextjs-google-analytics";

// This default export is required in a new `pages/_app.js` file.
export default function App({ Component, pageProps }) {
  return (
    <>
      <GoogleAnalytics trackPageViews />
      <Component {...pageProps} />
    </>
  )
}