import { AppProps, ErrorBoundary, ErrorComponent, ErrorFallbackProps } from "@blitzjs/next"
import { AuthenticationError, AuthorizationError } from "blitz"
import { withBlitz } from "src/blitz-client"
import "src/styles/globals.css"

import { ChakraProvider, extendTheme } from "@chakra-ui/react"

const theme = extendTheme({
  colors: {
    primary: "#ecf0f1",
    border: "#2c3e50,",
  },
  components: {
    Button: {
      variants: {
        primary: {
          background: "#3498db",
          transition: "0.2s ease-in-out",
          transitionDuration: "0.2s",
          color: "#ecf0f1",
          boxShadow: "0 0 20px #00000037",
          _hover: {
            background: "#76acd0",
          },
        },
        secondary: {
          background: "#2ecc71",
          transition: "0.2s ease-in-out",
          transitionDuration: "0.2s",
          color: "white",
          boxShadow: "0 0 20px #00000037",
          _hover: {
            background: "#8ddeb0",
          },
        },
        outline: {
          _hover: {
            bg: "gray.700",
          },
        },
      },
    },
  },
})

function RootErrorFallback({ error }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return <div>Error: You are not authenticated</div>
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent
        statusCode={(error as any)?.statusCode || 400}
        title={error.message || error.name}
      />
    )
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)
  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary FallbackComponent={RootErrorFallback}>
        {getLayout(<Component {...pageProps} />)}
      </ErrorBoundary>
    </ChakraProvider>
  )
}

export default withBlitz(MyApp)
