import { Routes } from "@blitzjs/next"
import { Box, Button, Flex, Heading } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import Header from "src/core/components/Header"

// ------------------------------------------------------
// This page is rendered if a route match is not found
// ------------------------------------------------------
export default function Page404() {
  const statusCode = 404
  const title = "This page could not be found"
  const [photoUrl, setPhotoUrl] = useState("")
  const router = useRouter()

  const getPhoto = () => {
    fetch("/api/getHomePhotos")
      .then((response) => response.json())
      .then((response) => {
        const random = Math.floor(Math.random() * 10)
        setPhotoUrl(response.result[random].urls.full || "")
      })
      .catch((e) => console.log(e))
  }

  useEffect(() => {
    getPhoto()
  }, [])

  return (
    <Box
      // className="App"
      backgroundColor="#0F1014"
      h="100%"
      minH="100vh"
      color="white"
      overflow="hidden"
    >
      <Box h="100%" minH="100vh" px={{ base: "2rem", lg: "7.5rem" }}>
        <Header theme="white" />
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
            colorScheme="purple"
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
