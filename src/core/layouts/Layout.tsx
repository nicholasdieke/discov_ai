import { BlitzLayout } from "@blitzjs/next"
import React from "react"

const Layout: BlitzLayout<{ title?: string; children?: React.ReactNode }> = ({
  title,
  children,
}) => {
  return <>{children}</>
}

export default Layout
