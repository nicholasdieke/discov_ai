import { AppProps, ErrorBoundary, ErrorComponent, ErrorFallbackProps } from "@blitzjs/next"
import { AuthenticationError, AuthorizationError } from "blitz"
import { withBlitz } from "src/blitz-client"
import "src/styles/globals.css"

import { ChakraProvider, extendTheme } from "@chakra-ui/react"

const theme = extendTheme({
  components: {
    Button: {
      variants: {
        primary: {
          backgroundImage: "linear-gradient(to right, #623355 40%, #da621a 150%) !important",
          transition: "0.5s ease-in-out",
          transitionDuration: "0.5s",
          color: "white",
          boxShadow: "0 0 20px #00000037",
          _hover: {
            backgroundImage: "linear-gradient(to right, #623355 0%, #da621a 150%) !important",
            color: "#fff",
            textDecoration: "none",
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
