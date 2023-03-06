import { AppProps, ErrorBoundary, ErrorComponent, ErrorFallbackProps } from "@blitzjs/next"
import { AuthenticationError, AuthorizationError } from "blitz"
import { withBlitz } from "src/blitz-client"
import "src/styles/globals.css"

import { ChakraProvider, extendTheme } from "@chakra-ui/react"

const theme = extendTheme({
  // colors: {
  //   primary: "#EEA38B",
  //   secondary: "#4BA2D3",
  // },

  components: {
    Button: {
      variants: {
        primary: {
          bg: "black",
          color: "white",
          _hover: {
            bg: "gray.900",
          },
        },
        secondary: {
          bg: "#4BA2D3",
          color: "white",
        },
        outline: {
          _hover: {
            bg: "gray.700",
          },
        },
      },
    },
  },

  fonts: {
    heading: `'Plus Jakarta Sans', sans-serif`,
    body: `'Plus Jakarta Sans', sans-serif`,
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
