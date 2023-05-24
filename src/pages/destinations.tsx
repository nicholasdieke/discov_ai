import { BlitzPage } from "@blitzjs/next"
import { Box, Flex, Heading, Image, Text, VStack } from "@chakra-ui/react"
import mixpanel from "mixpanel-browser"
import Head from "next/head"
import { useEffect } from "react"
import "react-datepicker/dist/react-datepicker.css"
import DiscoverSection from "src/core/components/DiscoverSection"
import Header from "src/core/components/Header"

const DestinationPage: BlitzPage = () => {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)

  useEffect(() => {
    mixpanel.track("Viewed Home Page")

    return () => {
      // Define any cleanup code here
    }
  }, [])

  return (
    <Box className="App" h="100%" minH="100vh" overflow="hidden">
      <Head>
        <title>DiscovAI Destinations - Your AI-Powered Destination Discovery</title>
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
          content="DiscovAI Destinations - Your AI-Powered Destination Discovery"
        />
        <meta property="og:url" content="/" />
        <meta
          property="og:image"
          content="https://www.dropbox.com/s/hmmp4gklv03u11n/share-image.png?raw=1"
        />
        <meta
          name="twitter:title"
          content="DiscovAI Destinations - Your AI-Powered Destination Discovery"
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
        <Box w="100%" zIndex="-1" h="100%" pos="absolute">
          <Image alt="bg-image" src="/planet.jpg" objectFit="cover" h="100%" w="100%" />
        </Box>
        <Box h="100%" minH="100vh" px={{ base: "1.5rem", lg: "6rem" }} bgColor="#00000053">
          <Header theme="white" />
          <Flex alignItems={"center"} w="100%" flexDir="column" minH="90vh">
            <VStack
              w="100%"
              mt={{ base: "1rem", sm: "3rem" }}
              textAlign="center"
              alignItems="center"
              color="white"
            >
              <Heading
                fontSize={{
                  base: "1.5rem",
                  sm: "2.5rem",
                  md: "3rem",
                  lg: "4 rem",
                  xl: "4.5rem",
                }}
                textAlign="center"
                pb={{ base: "0rem", md: "0.5rem" }}
                fontWeight="700"
              >
                Discover new Destinations.
              </Heading>

              <Text
                textAlign="center"
                fontSize={{ base: "0.8rem", sm: "1rem", md: "1rem", lg: "1rem", xl: "1.3rem" }}
                pb={"1rem"}
                maxW={{ base: "100%", md: "70%" }}
              >
                Explore the world like never before with our AI-powered destination discovery.
              </Text>
            </VStack>
            <VStack w="100%" mb="5rem" mt="1rem">
              <DiscoverSection />
            </VStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export default DestinationPage
