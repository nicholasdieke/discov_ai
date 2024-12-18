"use client"
import Footer from "@/core/components/Footer"
import { BlitzPage } from "@blitzjs/next"
import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import mixpanel from "mixpanel-browser"
import Head from "next/head"
import { useEffect } from "react"
import "react-datepicker/dist/react-datepicker.css"
import Header from "src/core/components/Header"
import TripForm from "src/core/components/TripForm"

const Home: BlitzPage = () => {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)

  useEffect(() => {
    mixpanel.track("Viewed Home Page")
    return () => {}
  }, [])

  return (
    <Box className="App" h="100%" minH="100vh" overflow="hidden">
      <Head>
        <title>DiscovAI - Your AI-Powered Travel Planner for Personalised Itineraries</title>
        <meta
          name="description"
          content="Discover your dream vacation with DiscovAI, the AI-powered travel planner that creates personalised itineraries based on your interests and budget. Plan your perfect trip today!"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="DiscovAI - Your AI-Powered Travel Planner for Personalised Itineraries"
        />
        <meta property="og:url" content="/" />
        <meta
          property="og:image"
          content="https://www.dropbox.com/s/hmmp4gklv03u11n/share-image.png?raw=1"
        />
        <meta
          name="twitter:title"
          content="DiscovAI - Your AI-Powered Travel Planner for Personalised Itineraries"
        />
        <meta
          name="twitter:description"
          content="Discover your dream vacation with DiscovAI, the AI-powered travel planner that creates personalised itineraries based on your interests and budget. Plan your perfect trip today!"
        />
        <meta
          name="twitter:image"
          content="https://www.dropbox.com/s/hmmp4gklv03u11n/share-image.png?raw=1"
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Box h="100%" pos="relative">
        <Box w="100%" zIndex="-10" h="100%" pos="absolute">
          <video
            playsInline
            loop
            muted
            autoPlay
            className="bgVideo"
            poster="/bgimageposter-min.png"
            src="https://www.dropbox.com/scl/fi/uxqo4kgk4ka9fw4hq8ck9/production_id_4328789-720p.mp4?rlkey=1rxw10i0ntxhh0f5v25c3cwc6&raw=1"
          />
        </Box>
        <Box h="100%" minH="110vh" px={{ base: "1.5rem", lg: "6rem" }} bgColor="#00000033">
          <Header />
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
                  base: "2rem",
                  sm: "2.5rem",
                  md: "3rem",
                  lg: "4 rem",
                  xl: "4.5rem",
                }}
                lineHeight={{
                  base: "2rem",
                  sm: "2.5rem",
                  md: "4rem",
                  lg: "5 rem",
                  xl: "5.5rem",
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
          <Footer />
        </Box>
      </Box>
    </Box>
  )
}

export default Home
