import { AppProps, ErrorBoundary, ErrorComponent, ErrorFallbackProps } from "@blitzjs/next"
import { AuthenticationError, AuthorizationError } from "blitz"
import { withBlitz } from "src/blitz-client"
import "src/styles/globals.css"

import { Alert } from "src/components/ui/alert"
import { Provider } from "src/components/ui/provider"

/* const theme = extendTheme({
  colors: {
    primary: "#ecf0f1",
    border: "#2c3e50,",
  },
  components: {
    Button: {
      variants: {
        primary: {
          background: "#3498db",
          transition: "0.1s ease-in-out",
          transitionDuration: "0.1s",
          color: "#ecf0f1",
          //boxShadow: "0 0 20px #00000037",
          _hover: {
            background: "#76acd0",
          },
        },
        secondary: {
          background: "#2ecc71",
          transition: "0.1s ease-in-out",
          transitionDuration: "0.1s",
          color: "white",
          //boxShadow: "0 0 20px #00000037",
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
}) */

function RootErrorFallback({ error }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="100vh"
        width="100vw"
        title="You are not authenticated. Please login to view this page."
      />
    )
  } else if (error instanceof AuthorizationError) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="100vh"
        width="100vw"
        title={"You are not authorised. " + error.statusCode}
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
    <Provider>
      <ErrorBoundary FallbackComponent={RootErrorFallback}>
        {getLayout(<Component {...pageProps} />)}
      </ErrorBoundary>
    </Provider>
  )
}

export default withBlitz(MyApp)
