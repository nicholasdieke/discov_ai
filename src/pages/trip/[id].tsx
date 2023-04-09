import { BlitzPage, Routes } from "@blitzjs/next"
import { invoke } from "@blitzjs/rpc"
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react"
import {
  faBed,
  faCalendarDays,
  faChevronRight,
  faClipboard,
  faPlaneDeparture,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Trip } from "db"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import Header from "src/core/components/Header"
import WeatherInfo from "src/core/components/WeatherInfo"
import getTrip from "src/core/queries/getTrip"

const TripPage: BlitzPage = () => {
  const router = useRouter()
  const tripId = router.query.id as string
  const [loading, setLoading] = useState(true)
  const [longTrip, setLongTrip] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const toast = useToast()

  const [myTrip, setMyTrip] = useState<Trip | null | undefined>(undefined)

  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ]

  const [photoUrl, setPhotoUrl] = useState("")
  const [weatherData, setWeatherData] = useState()

  const dateDiffInDays = (a, b) => {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())

    return Math.floor((utc2 - utc1) / _MS_PER_DAY)
  }

  const getPhoto = (destination) => {
    fetch("/api/getDestPhoto?destination=" + destination)
      .then((response) => response.json())
      .then((response) => setPhotoUrl(response.result[0].urls.regular || ""))
      .catch((e) => console.log(e))
  }

  const getWeather = (destination, fromDate, toDate) => {
    fetch(
      "/api/getWeatherInfo?destination=" +
        destination +
        "&fromDate=" +
        fromDate +
        "&toDate=" +
        toDate,
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((response) => {
        setWeatherData(response.result.days)
      })
      .catch((e) => console.log(e))
  }

  function addDay(date) {
    var result = new Date(date)
    result.setDate(result.getDate() + 1)
    return result
  }

  const getDetails = (tripId) => {
    // Gets the info from db and then gets an image from unsplash
    invoke(getTrip, { id: tripId })
      .then((trip) => {
        if (!!tripId && !!trip) {
          setMyTrip(trip as Trip)
          getPhoto(trip.destination)
          getWeather(
            trip.destination,
            addDay(trip.daterange[0] as Date)
              .toISOString()
              .split("T")[0],
            addDay(trip.daterange[1] as Date)
              .toISOString()
              .split("T")[0]
          )
          setLoading(false)
          setLongTrip(dateDiffInDays(trip.daterange[0], trip.daterange[1]) >= 10)
        } else if (!!tripId) {
          setLoading(false)
          setNotFound(true)
        }
      })
      .catch((e) => console.log(e))
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }

  useEffect(() => {
    getDetails(tripId)
  }, [tripId])

  return (
    <>
      <>
        <title>DiscovAI | Trip</title>

        <meta
          name="description"
          content="Discover a world of travel possibilities with our AI-powered itinerary builder."
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
          content="Discover a world of travel possibilities with our AI-powered itinerary builder."
        />
        <meta name="twitter:image" content="/share-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </>
      <Box backgroundColor="#0F1014" h="100%" minH="100vh" color="white">
        <Box px={{ base: "1.5rem", lg: "6rem" }} py={{ base: "0.25rem", lg: "0.5rem" }}>
          <Header theme="white" />
          {!loading && !!myTrip && (
            <>
              <Flex
                h={{ base: "175px", lg: "250px" }}
                bgPos="center"
                bgRepeat="no-repeat"
                bgImage={photoUrl}
                bgSize="cover"
                borderRadius="10px"
              >
                <Flex
                  p="1rem"
                  alignItems="center"
                  justifyContent="center"
                  h={{ base: "175px", lg: "250px" }}
                  bgColor="rgb(0,0,0,0.5)"
                  w="100%"
                >
                  <VStack spacing="1rem" color="white" textAlign="center">
                    <Heading fontSize={{ base: "40px", lg: "70px" }}>
                      {myTrip.destination.split(", ")[0]}
                    </Heading>
                    <Divider />
                    <HStack fontSize="18px">
                      <FontAwesomeIcon icon={faCalendarDays} size="1x" />
                      <Text fontSize={{ base: "0.9rem", md: "1.5rem" }}>
                        {myTrip.daterange[0]?.toLocaleDateString("en-US", dateOptions)} -{" "}
                        {myTrip.daterange[1]?.toLocaleDateString("en-US", dateOptions)}
                      </Text>
                    </HStack>
                  </VStack>
                </Flex>
              </Flex>

              <div data-skyscanner-widget="FlightSearchWidget" data-locale="en-GB"></div>

              <Flex mt="2rem" mb="5rem" flexDir={{ base: "column-reverse", md: "column" }}>
                <Box>
                  <Heading size="md" my="1rem">
                    📝 Before You Go
                  </Heading>
                  <Flex justifyContent="space-between" flexDir={{ base: "column", md: "row" }}>
                    <Flex gap="1rem" flexDir={{ base: "column", md: "row" }} mb="2rem" w="100%">
                      <a
                        href="https://www.google.com/travel/flights"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          leftIcon={<FontAwesomeIcon icon={faPlaneDeparture} size="1x" />}
                          rightIcon={<FontAwesomeIcon icon={faChevronRight} size="1x" />}
                          variant="outline"
                          w="100%"
                        >
                          See Flights
                        </Button>
                      </a>

                      <a
                        href={
                          "https://www.google.com/travel/hotels/" +
                          myTrip.destination.split(", ")[0]
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          leftIcon={<FontAwesomeIcon icon={faBed} size="1x" />}
                          rightIcon={<FontAwesomeIcon icon={faChevronRight} size="1x" />}
                          variant="outline"
                          w="100%"
                        >
                          See Stays
                        </Button>
                      </a>
                    </Flex>

                    <Button
                      leftIcon={<FontAwesomeIcon icon={faClipboard} size="1x" />}
                      onClick={() =>
                        navigator.clipboard
                          .writeText(
                            "Check out the trip to " +
                              myTrip.destination.split(", ")[0] +
                              " I made on DiscovAI! www.discovai.com" +
                              router.asPath
                          )
                          .then(() => {
                            toast({
                              title: "Trip Copied",
                              description: "Share this trip.",
                              status: "success",
                              duration: 2000,
                              isClosable: true,
                              position: "bottom-right",
                            })
                          })
                      }
                      variant="outline"
                    >
                      Copy Trip
                    </Button>
                  </Flex>
                </Box>
                <Box>
                  <Heading size="md" mb="1rem">
                    📍 Your Personalised Itinerary
                  </Heading>
                  <VStack spacing="3rem">
                    <Accordion
                      defaultIndex={Array.from(
                        { length: myTrip.itinerary.trim().split("Day ").slice(1).length },
                        (_, i) => i
                      )}
                      allowMultiple
                      w="100%"
                    >
                      {myTrip.itinerary
                        .trim()
                        .split("Day ")
                        .slice(1)
                        .map((day, index) => (
                          <AccordionItem key={"Day-Accordion-" + index}>
                            <AccordionButton>
                              <Box
                                as="span"
                                fontWeight="700"
                                fontSize="18px"
                                py="1rem"
                                w="100%"
                                flex="1"
                                textAlign="left"
                              >
                                Day {day.substring(0, day.indexOf(":"))}
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>

                            <AccordionPanel>
                              <VStack spacing="1rem" alignItems="start">
                                {!longTrip && (
                                  <>
                                    <Flex
                                      alignItems="start"
                                      flexDir={{ base: "column", md: "row" }}
                                    >
                                      <HStack className="dayTimeBox" mb="1rem">
                                        <Text whiteSpace="nowrap">☕ Morning</Text>
                                      </HStack>
                                      <Text fontSize="18px" pl={{ base: "0rem", md: "8rem" }}>
                                        {day
                                          .substring(
                                            day.indexOf("Morning"),
                                            day.indexOf("Afternoon")
                                          )
                                          .slice(9)
                                          .trim()}
                                      </Text>
                                    </Flex>
                                    <Flex
                                      alignItems="start"
                                      flexDir={{ base: "column", md: "row" }}
                                    >
                                      <HStack className="dayTimeBox" mb="1rem">
                                        <Text whiteSpace="nowrap">☀️ Afternoon</Text>
                                      </HStack>
                                      <Text fontSize="18px" pl={{ base: "0rem", md: "8rem" }}>
                                        {day
                                          .substring(
                                            day.indexOf("Afternoon"),
                                            day.indexOf("Evening")
                                          )
                                          .slice(11)
                                          .trim()}
                                      </Text>
                                    </Flex>
                                    <Flex
                                      alignItems="start"
                                      flexDir={{ base: "column", md: "row" }}
                                    >
                                      <HStack className="dayTimeBox" mb="1rem">
                                        <Text whiteSpace="nowrap">🌃 Evening</Text>
                                      </HStack>

                                      <Text fontSize="18px" pl={{ base: "0rem", md: "8rem" }}>
                                        {day.substring(day.indexOf("Evening")).slice(9).trim()}
                                      </Text>
                                    </Flex>
                                  </>
                                )}
                                {longTrip && <Text fontSize="18px">{day.split(":")[1]}</Text>}
                              </VStack>
                            </AccordionPanel>
                          </AccordionItem>
                        ))}
                    </Accordion>

                    {!!weatherData && (
                      <Box w="100%">
                        <Heading size="md" mb="1rem">
                          🌤️ Weather
                        </Heading>
                        <WeatherInfo days={weatherData} />
                      </Box>
                    )}
                    <Box w="100%">
                      <Heading size="md" mb="1rem">
                        🔍 Tour Inspiration
                      </Heading>
                      <div id="widget-container">
                        <div
                          data-gyg-href="https://widget.getyourguide.com/default/activities.frame"
                          data-gyg-locale-code="en-US"
                          data-gyg-widget="activities"
                          data-gyg-number-of-items="4"
                          data-gyg-partner-id="9WU9RNS"
                          data-gyg-excluded-tour-ids="435198,406786"
                          data-gyg-q={myTrip.destination}
                        ></div>
                      </div>
                    </Box>
                  </VStack>
                </Box>
              </Flex>
            </>
          )}
          {loading && (
            <Flex
              alignItems={"center"}
              justifyContent="center"
              mt={{ base: "1rem", md: "6rem" }}
              w="100%"
              flexDir="column"
            >
              <Spinner size="xl" />
              <Text mt="2rem">Loading Trip...</Text>
            </Flex>
          )}
          {notFound && !myTrip && (
            <Flex
              alignItems={"center"}
              justifyContent="center"
              mt={{ base: "1rem", md: "6rem" }}
              w="100%"
              flexDir="column"
            >
              <Heading color="white" size="lg" textAlign="center" mt="5rem" mb="1rem">
                Sorry, this trip does not exist.
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
          )}
        </Box>
      </Box>
    </>
  )
}

export default TripPage
