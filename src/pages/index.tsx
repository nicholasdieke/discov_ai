import { BlitzPage } from "@blitzjs/next"
import { Box, Flex, Heading, Image, Text, VStack } from "@chakra-ui/react"
// import Image from "next/image"
import { useEffect, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import Header from "src/core/components/Header"
import TripForm from "src/core/components/TripForm"

const Home: BlitzPage = () => {
  const [photoUrl, setPhotoUrl] = useState("")

  const bgs = ["bg-2.jpeg", "bg-3.jpg", "bg-4.jpg", "bg-5.jpg", "bg-7.jpg", "bg-10.jpg"]

  useEffect(() => {
    setPhotoUrl(bgs[Math.floor(Math.random() * bgs.length)] as string)
  }, [])

  return (
    <Box className="App" h="100%" minH="100vh" overflow="hidden">
      <>
        <title>DiscovAI</title>
        <meta
          name="description"
          content="Discover your dream vacation with DiscovAI, the AI-powered travel planner that creates personalised itineraries based on your interests and budget. Plan your perfect trip today!"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="DiscovAI" />
        <meta property="og:url" content="/" />
        <meta property="og:image" content="/share-image.png" />
        <meta name="twitter:title" content="DiscovAI" />
        <meta
          name="twitter:description"
          content="Discover your dream vacation with DiscovAI, the AI-powered travel planner that creates personalised itineraries based on your interests and budget. Plan your perfect trip today!"
        />
        <meta name="twitter:image" content="/share-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </>
      <Box h="100%" pos="relative">
        <Box w="100%" zIndex="-1" h="100%" pos="absolute">
          <Image alt="bg-image" src={"/" + photoUrl} objectFit="cover" h="100%" w="100%" />
        </Box>
        <Box h="100%" minH="100vh" px={{ base: "2rem", lg: "6rem" }} bgColor="#00000053">
          <Header theme="white" />
          <Flex alignItems={"center"} w="100%" flexDir={{ base: "column", md: "row" }} minH="90vh">
            <VStack
              w={{ base: "100%", md: "50%" }}
              mb={{ base: "1rem", md: "0rem" }}
              textAlign={{ base: "center", md: "start" }}
              alignItems={{ base: "center", md: "start" }}
              color="white"
              mt={{ base: "1rem", md: "0rem" }}
            >
              <Heading
                fontSize={{
                  base: "1.5rem",
                  sm: "2.5rem",
                  md: "3rem",
                  lg: "4 rem",
                  xl: "4.5rem",
                }}
                textAlign={{ base: "center", md: "start" }}
                pb={{ base: "0rem", md: "0.5rem" }}
                fontWeight="700"
              >
                Your Perfect Trip
                <br /> in Seconds.
              </Heading>

              <Text
                textAlign={{ base: "center", md: "start" }}
                fontSize={{ base: "0.8rem", sm: "1rem", md: "1rem", lg: "1rem", xl: "1.3rem" }}
                pb={"1rem"}
                maxW={{ base: "100%", md: "70%" }}
              >
                Discover a world of travel possibilities with our AI-powered itinerary builder.
              </Text>
            </VStack>
            <VStack w={{ base: "100%", md: "50%" }} mb="5rem">
              <TripForm />
            </VStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export default Home
