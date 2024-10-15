import { AppProps, ErrorBoundary, ErrorComponent, ErrorFallbackProps } from "@blitzjs/next"
import { AuthenticationError, AuthorizationError } from "blitz"
import { withBlitz } from "src/blitz-client"
import "src/styles/globals.css"

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  ChakraProvider,
  extendTheme,
} from "@chakra-ui/react"

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
})

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
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          You are not authenticated
        </AlertTitle>
        <AlertDescription maxWidth="sm">Please login to view this page.</AlertDescription>
      </Alert>
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
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          You are not authorised
        </AlertTitle>
        <AlertDescription maxWidth="sm">{error.statusCode}</AlertDescription>
      </Alert>
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
