import Document, { Head, Html, Main, NextScript } from "next/document"
import { BlitzProvider } from "src/blitz-client"

class MyDocument extends Document {
  // Only uncomment if you need to customize this behaviour
  // static async getInitialProps(ctx: DocumentContext) {
  //   const initialProps = await Document.getInitialProps(ctx)
  //   return {...initialProps}
  // }
  render() {
    return (
      <Html lang="en">
        <Head>
          <script
            async
            defer
            src="https://widget.getyourguide.com/dist/pa.umd.production.min.js"
            data-gyg-partner-id="9WU9RNS"
          ></script>
        </Head>
        <body>
          <BlitzProvider>
            <Main />
            <NextScript />
          </BlitzProvider>
        </body>
      </Html>
    )
  }
}

export default MyDocument
