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
        <title>DiscovAI</title>
        <link rel="icon" href="/world_resized.png" />
        <link rel="apple-touch-icon" href="/world_resized.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta
          name="description"
          content="Discover a world of travel possibilities with <br /> our AI-powered itinerary builder."
        />
      </Head>

      {children}
    </>
  )
}

export default Layout
