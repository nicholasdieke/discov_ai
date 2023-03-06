import { BlitzPage } from "@blitzjs/next"
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
  const tripId = router.query.id

  const [myTrip, setMyTrip] = useState<Trip | null>(null)

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

  const getPhoto = async (destination) => {
    await fetch("/api/getDestPhoto?destination=" + destination)
      .then((response) => response.json())
      .then((response) => setPhotoUrl(response.result[0].urls.full || ""))
      .catch((e) => console.log(e))
    // const data = await response.json()
    // setPhotoUrl(data.result[0].urls.full || "")
  }

  const getDetails = async (tripId) => {
    await invoke(getTrip, { id: tripId })
      .then((trip) => {
        setMyTrip(trip as Trip)
        getPhoto(trip?.destination || "city")
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
    <Box backgroundColor="#0F1014" color="white">
      {!!myTrip && (
        <Box px={{ base: "2rem", lg: "7.5rem" }} py={{ base: "0.25rem", lg: "0.5rem" }}>
          <Header theme="white" />
          <Flex
            h="300px"
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
              h="300px"
              bgColor="rgb(0,0,0,0.5)"
              w="100%"
            >
              <VStack spacing="1rem" color="white">
                <Heading size="4xl">{myTrip.destination}</Heading>
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

          <Box mt="2rem" mb="5rem">
            <Heading size="md" mb="1rem">
              Before You Go
            </Heading>
            <Flex justifyContent="space-between">
              <HStack spacing="1rem" mb="2rem">
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
              </HStack>

              <Button
                leftIcon={<FontAwesomeIcon icon={faClipboard} size="1x" />}
                onClick={() =>
                  navigator.clipboard.writeText(
                    "Check out my trip made on DiscovAI! " + router.asPath
                  )
                }
                variant="outline"
              >
                Copy Trip
              </Button>
            </Flex>

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
                  .split("Day")
                  .slice(1)
                  .map((day, index) => (
                    <AccordionItem key={"Trip-Day" + index}>
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
                          Day {index + 1}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>

                      <AccordionPanel>
                        <VStack spacing="1rem">
                          <HStack alignItems="start">
                            <HStack className="dayTimeBox">
                              <FontAwesomeIcon icon={faMugSaucer} size="1x" />
                              <Text>Morning</Text>
                            </HStack>
                            <Text fontSize="18px" pl="8rem">
                              {day.substring(3).split("Morning:")[1]?.split("Afternoon:")[0]}
                            </Text>
                          </HStack>
                          <HStack alignItems="start">
                            <HStack className="dayTimeBox">
                              <FontAwesomeIcon icon={faSun} size="1x" />
                              <Text>Afternoon</Text>
                            </HStack>
                            <Text fontSize="18px" pl="8rem">
                              {day.substring(3).split("Afternoon:")[1]?.split("Evening:")[0]}
                            </Text>
                          </HStack>
                          <HStack alignItems="start">
                            <HStack className="dayTimeBox">
                              <FontAwesomeIcon icon={faMoon} size="1x" />
                              <Text>Evening</Text>
                            </HStack>

                            <Text fontSize="18px" pl="8rem">
                              {day.substring(3).split("Evening:")[1]}
                            </Text>
                          </HStack>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
              </Accordion>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default TripPage
