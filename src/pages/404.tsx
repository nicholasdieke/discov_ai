import { Routes } from "@blitzjs/next"
import { Box, Button, Flex, Heading } from "@chakra-ui/react"
import { useRouter } from "next/router"
import "react-datepicker/dist/react-datepicker.css"
import Header from "src/core/components/Header"

// ------------------------------------------------------
// This page is rendered if a route match is not found
// ------------------------------------------------------
export default function Page404() {
  const router = useRouter()

  return (
    <Box backgroundColor="#1a1c21" h="100%" minH="100vh" color="white" overflow="hidden">
      <Box h="100%" minH="100vh" px={{ base: "2rem", lg: "7.5rem" }}>
        <Header />
        <Flex
          alignItems={"center"}
          justifyContent="center"
          mt={{ base: "1rem", md: "6rem" }}
          w="100%"
          flexDir="column"
        >
          <Heading color="white" size="lg" textAlign="center" mt="5rem" mb="1rem">
            Sorry, this page does not exist.
          </Heading>
          <Button
            variant="primary"
            mt="1rem"
            width="200px"
            onClick={() => router.push(Routes.Home())}
          >
            Go Home!
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
