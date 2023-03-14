import { BlitzLayout } from "@blitzjs/next"
import Head from "next/head"
import React from "react"

const Layout: BlitzLayout<{ title?: string; children?: React.ReactNode }> = ({
  title,
  children,
}) => {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta
          name="description"
          content="Discover a world of travel possibilities with <br /> our AI-powered itinerary builder."
        />
        <title>DiscovAI</title>
      </Head>

      {children}
    </>
  )
}

export default Layout
