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
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react"
import {
  faBed,
  faCalendarDays,
  faChevronRight,
  faClipboard,
  faCloudSun,
  faMoon,
  faMugSaucer,
  faPlaneDeparture,
  faSun,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Trip } from "db"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import Header from "src/core/components/Header"
import getTrip from "src/core/queries/getTrip"

const TripPage: BlitzPage = () => {
  const router = useRouter()
  const tripId = router.query.id || ""
  const [loading, setLoading] = useState(true)
  const [longTrip, setLongTrip] = useState(false)

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
      .then((response) => setPhotoUrl(response.result[0].urls.full || ""))
      .catch((e) => console.log(e))
  }

  const getDetails = (tripId) => {
    // Gets the info from db and then gets an image from unsplash
    invoke(getTrip, { id: tripId })
      .then((trip) => {
        setMyTrip(trip as Trip)

        getPhoto(trip?.destination || "city")
        setLoading(false)
        if (!!trip) setLongTrip(dateDiffInDays(trip.daterange[0], trip.daterange[1]) >= 10)
      })
      .catch((e) => console.log(e))
  }

  useEffect(() => {
    getDetails(tripId)
  }, [tripId])

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }

  return (
    <Box backgroundColor="#0F1014" h="100%" minH="100vh" color="white">
      <Box px={{ base: "2rem", lg: "7.5rem" }} py={{ base: "0.25rem", lg: "0.5rem" }}>
        <Header theme="white" />
        {!loading && !!myTrip && (
          <>
            <Flex
              h={{ base: "200px", lg: "250px" }}
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
                h={{ base: "200px", lg: "250px" }}
                bgColor="rgb(0,0,0,0.5)"
                w="100%"
              >
                <VStack spacing="1rem" color="white" textAlign="center">
                  <Heading fontSize={{ base: "40px", lg: "70px" }}>{myTrip.destination}</Heading>
                  <Divider />
                  <HStack fontSize="18px">
                    <FontAwesomeIcon icon={faCalendarDays} size="1x" />
                    <Text>
                      {myTrip.daterange[0]?.toLocaleDateString("en-US", dateOptions)} -{" "}
                      {myTrip.daterange[1]?.toLocaleDateString("en-US", dateOptions)}
                    </Text>
                  </HStack>
                </VStack>
              </Flex>
            </Flex>

            <Flex mt="2rem" mb="5rem" flexDir={{ base: "column-reverse", md: "column" }}>
              <Box>
                <Heading size="md" my="1rem">
                  Before You Go
                </Heading>
                <Flex justifyContent="space-between">
                  <Flex gap="1rem" flexDir={{ base: "column", md: "row" }} mb="2rem">
                    <a href="https://www.skyscanner.net/" target="_blank" rel="noreferrer">
                      <Button
                        leftIcon={<FontAwesomeIcon icon={faPlaneDeparture} size="1x" />}
                        rightIcon={<FontAwesomeIcon icon={faChevronRight} size="1x" />}
                        variant="outline"
                      >
                        See Flights
                      </Button>
                    </a>

                    <a href="https://www.booking.com/" target="_blank" rel="noreferrer">
                      <Button
                        leftIcon={<FontAwesomeIcon icon={faBed} size="1x" />}
                        rightIcon={<FontAwesomeIcon icon={faChevronRight} size="1x" />}
                        variant="outline"
                      >
                        See Stays
                      </Button>
                    </a>
                    <a
                      href={
                        "https://www.meteoprog.com/weather/" +
                        myTrip.destination.replaceAll(" ", "") +
                        "/month/" +
                        monthNames[(myTrip.daterange[0] as Date).getMonth()]
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        leftIcon={<FontAwesomeIcon icon={faCloudSun} size="1x" />}
                        rightIcon={<FontAwesomeIcon icon={faChevronRight} size="1x" />}
                        variant="outline"
                      >
                        See Weather
                      </Button>
                    </a>
                  </Flex>

                  <Button
                    leftIcon={<FontAwesomeIcon icon={faClipboard} size="1x" />}
                    onClick={() =>
                      navigator.clipboard.writeText(
                        "Check out my trip made on DiscovAI! www.discovai.com" + router.asPath
                      )
                    }
                    variant="outline"
                  >
                    Copy Trip
                  </Button>
                </Flex>
              </Box>
              <Box>
                <Heading size="md" mb="1rem">
                  Your Personalised Itinerary
                </Heading>
                <VStack spacing="3rem">
                  <Accordion
                    defaultIndex={Array.from(
                      { length: myTrip.itinerary.split("Day").slice(1).length },
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
                                  <Flex alignItems="start" flexDir={{ base: "column", md: "row" }}>
                                    <HStack className="dayTimeBox" mb="1rem">
                                      <FontAwesomeIcon icon={faMugSaucer} size="1x" />
                                      <Text>Morning</Text>
                                    </HStack>
                                    <Text fontSize="18px" pl={{ base: "0rem", md: "8rem" }}>
                                      {day
                                        .substring(day.indexOf("Morning"), day.indexOf("Afternoon"))
                                        .slice(9)
                                        .trim()}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="start" flexDir={{ base: "column", md: "row" }}>
                                    <HStack className="dayTimeBox" mb="1rem">
                                      <FontAwesomeIcon icon={faSun} size="1x" />
                                      <Text>Afternoon</Text>
                                    </HStack>
                                    <Text fontSize="18px" pl={{ base: "0rem", md: "8rem" }}>
                                      {day
                                        .substring(day.indexOf("Afternoon"), day.indexOf("Evening"))
                                        .slice(11)
                                        .trim()}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="start" flexDir={{ base: "column", md: "row" }}>
                                    <HStack className="dayTimeBox" mb="1rem">
                                      <FontAwesomeIcon icon={faMoon} size="1x" />
                                      <Text>Evening</Text>
                                    </HStack>

                                    <Text fontSize="18px" pl={{ base: "0rem", md: "8rem" }}>
                                      {day.substring(day.indexOf("Evening")).slice(9).trim()}
                                    </Text>
                                  </Flex>
                                </>
                              )}
                              {longTrip && <Text fontSize="18px">{day.split(": ")[1]}</Text>}
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </VStack>
              </Box>
            </Flex>
          </>
        )}
        {!loading && myTrip === null && (
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
  )
}

export default TripPage
