import '../public/dark.min.css'
import '../public/a11y-dark.min.css'
import { GoogleAnalytics } from "nextjs-google-analytics";
import Head from "next/head"
// This default export is required in a new `pages/_app.js` file.
export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>noted.wtf</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />

        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="noted, but wtf" />

        <meta property="og:url" content="https://noted.wtf" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="noted.wtf" />
        <meta property="og:description" content="noted, but wtf" />
        <meta property="og:image" content="https://noted.wtf/siteimage.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="noted.wtf" />
        <meta property="twitter:url" content="https://noted.wtf" />
        <meta name="twitter:title" content="noted.wtf" />
        <meta name="twitter:description" content="noted, but wtf" />
        <meta name="twitter:image" content="https://noted.wtf/siteimage.png" />

      </Head>

      <GoogleAnalytics trackPageViews />
      <Component {...pageProps} />
    </>
  )
}