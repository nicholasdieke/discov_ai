import { Routes } from "@blitzjs/next"
import "mapbox-gl/dist/mapbox-gl.css"

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react"
import {
  faBed,
  faCalendarDays,
  faCar,
  faChevronDown,
  faChevronRight,
  faChevronUp,
  faCircleInfo,
  faClipboard,
  faEnvelope,
  faMapPin,
  faShareNodes,
  faSun,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import mixpanel from "mixpanel-browser"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import WeatherInfo from "src/core/components/WeatherInfo"
import FlightPopover from "./FlightPopover"
import GeneralInfo from "./GeneralInfo"

const Itinerary = ({ trip, latLong, showMapPin, map, isMobile = false }) => {
  const [weatherData, setWeatherData] = useState()
  const [countryData, setCountryData] = useState()
  const [inFuture, setInFuture] = useState(false)
  const [showGeneralInfo, setShowGeneralInfo] = useState(true)
  const [showTours, setShowTours] = useState(true)
  const [showBeforeYouGo, setShowBeforeYouGo] = useState(true)
  const [showWeather, setShowWeather] = useState(true)
  const [showItinerary, setShowItinerary] = useState(true)

  const router = useRouter()
  const toast = useToast()

  const shareMessage = `Check out the trip to ${
    trip?.destination.split(", ")[0]
  } I made on DiscovAI! www.discovai.com${router.asPath}`

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

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }
  function copyURI(evt) {
    evt.preventDefault()
    navigator.clipboard.writeText(shareMessage).then(
      () => {},
      () => {}
    )
  }
  const showToast = () => {
    toast({
      title: "Trip Copied",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "bottom-right",
    })
  }
  const getCountryInfo = (country) => {
    fetch("/api/getCountryInfo?country=" + country)
      .then((response) => response.json())
      .then((response) => {
        setCountryData(response.result[0])
      })
      .catch((e) => console.log(e))
  }
  function addDay(date) {
    var result = new Date(date)
    result.setDate(result.getDate() + 1)
    return result
  }

  const PlanWithLinks = ({ day, showMapPin }) => {
    // Extract locations from latLngs object
    const locations = Object.keys(day.lat_lngs)

    // Create a regular expression pattern for each location
    const locationPatterns = locations.map((location) => new RegExp(`\\b${location}\\b`, "gi"))

    // Function to handle the click event
    const handleLocationClick = (lat, lng) => {
      showMapPin(lat, lng)
    }

    // Function to create a click event listener for each location link
    const createClickListener = (lat, lng) => {
      return () => handleLocationClick(lat, lng)
    }

    // Replace each location with a clickable link
    const formattedPlan = locationPatterns.reduce((formattedText, pattern, index) => {
      const location = locations[index]
      if (location) {
        const { lat, lng } = day.lat_lngs[location]
        const link = `<span style="cursor: pointer; font-weight: 600; color: #2ecc71;" data-lat="${lat}" data-lng="${lng}">${location}</span>`
        return formattedText.replace(pattern, link)
      }
      return formattedText
    }, day.plan)

    useEffect(() => {
      const clickListeners = locations.map((location) => {
        const { lat, lng } = day.lat_lngs[location]
        return document.querySelector(`span[data-lat="${lat}"][data-lng="${lng}"]`)
      })

      clickListeners.forEach((listener) => {
        if (listener) {
          listener.addEventListener(
            "click",
            createClickListener(
              listener.getAttribute("data-lat"),
              listener.getAttribute("data-lng")
            )
          )
        }
      })

      return () => {
        clickListeners.forEach((listener) => {
          if (listener) {
            listener.removeEventListener(
              "click",
              createClickListener(
                listener.getAttribute("data-lat"),
                listener.getAttribute("data-lng")
              )
            )
          }
        })
      }
    }, [day])

    return <div dangerouslySetInnerHTML={{ __html: formattedPlan }} />
  }

  useEffect(() => {
    getCountryInfo(trip.destination.split(", ")[1])
    getWeather(
      trip.destination,
      addDay(trip.daterange[0] as Date)
        .toISOString()
        .split("T")[0],
      addDay(trip.daterange[1] as Date)
        .toISOString()
        .split("T")[0]
    )
    setInFuture(trip.daterange[0]! > new Date())
  }, [])

  return (
    <>
      <Flex
        flexDir="column"
        h="100vh"
        w={isMobile ? "100%" : "60%"}
        maxW={isMobile ? "100%" : "60%"}
        overflowY="scroll"
        overflowX="hidden"
      >
        <Flex
          h={{ base: "150px", lg: "250px" }}
          bgPos="center"
          bgRepeat="no-repeat"
          bgImage={trip.imageUrl}
          bgSize="cover"
          pos="relative"
        >
          <Flex
            p="1.5rem"
            alignItems="flex-end"
            justifyContent="left"
            h={{ base: "150px", lg: "250px" }}
            bgColor="rgb(0,0,0,0.5)"
            w="100%"
          >
            <Flex pos="absolute" top="1rem" left="1rem">
              <Text
                onClick={() => {
                  mixpanel.track("Clicked Logo")
                  router.push(Routes.Home()).catch((e) => console.log(e))
                }}
                className="logo-text"
              >
                DiscovAI
              </Text>
            </Flex>
            <Flex pos="absolute" top="1rem" right="1rem">
              <Menu>
                {isMobile ? (
                  <MenuButton
                    as={IconButton}
                    icon={<FontAwesomeIcon icon={faShareNodes} height="18px" />}
                    _focus={{ boxShadow: "outline" }}
                    variant="secondary"
                  ></MenuButton>
                ) : (
                  <MenuButton
                    as={Button}
                    leftIcon={<FontAwesomeIcon icon={faShareNodes} height="18px" />}
                    _focus={{ boxShadow: "outline" }}
                    variant="secondary"
                  >
                    Share
                  </MenuButton>
                )}

                <MenuList bg="gray.700" borderWidth="0px">
                  <a
                    href={`whatsapp://send?text=${shareMessage}`}
                    data-action="share/whatsapp/share"
                  >
                    <MenuItem
                      _hover={{ bg: "gray.600" }}
                      _focus={{ bg: "gray.600" }}
                      bg="inherit"
                      onClick={() => mixpanel.track("Shared Trip", { platform: "WhatsApp" })}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="#25d366"
                          d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
                        />
                      </svg>
                      <Text ml="0.5rem">WhatsApp</Text>
                    </MenuItem>
                  </a>
                  <a
                    href={`mailto:?body=${shareMessage}body&subject=${
                      trip.destination.split(",")[0]
                    } Trip | DiscovAI`}
                  >
                    <MenuItem
                      _hover={{ bg: "gray.600" }}
                      _focus={{ bg: "gray.600" }}
                      bg="inherit"
                      onClick={() => mixpanel.track("Shared Trip", { platform: "Email" })}
                    >
                      <FontAwesomeIcon icon={faEnvelope} height="16px" />
                      <Text ml="0.5rem">Email</Text>
                    </MenuItem>
                  </a>
                  <a
                    onClick={(e) => {
                      copyURI(e)
                      showToast()
                    }}
                  >
                    {!!navigator.clipboard && (
                      <MenuItem
                        _hover={{ bg: "gray.600" }}
                        _focus={{ bg: "gray.600" }}
                        bg="inherit"
                        onClick={() => mixpanel.track("Shared Trip", { platform: "Clipboard" })}
                      >
                        <FontAwesomeIcon icon={faClipboard} height="16px" />
                        <Text ml="0.5rem">Clipboard</Text>
                      </MenuItem>
                    )}
                  </a>
                </MenuList>
              </Menu>
            </Flex>

            <VStack spacing="0.5rem" color="primary" alignItems="flex-start">
              <Heading fontSize={{ base: "25px", md: "35px", lg: "45px" }}>
                {trip.destination}
              </Heading>
              <HStack fontSize="18px">
                <FontAwesomeIcon icon={faCalendarDays} height="22px" />
                <Text fontSize={{ base: "0.9rem", md: "1.2rem" }}>
                  {trip.daterange[0]?.toLocaleDateString("en-US", dateOptions)} -{" "}
                  {trip.daterange[1]?.toLocaleDateString("en-US", dateOptions)}
                </Text>
              </HStack>
            </VStack>
          </Flex>
        </Flex>
        {!!map && (
          <Box
            mx="1rem"
            mt="0.5rem"
            top="3"
            left="0"
            right="0"
            pos="sticky"
            boxShadow="0px 0px 40px #1e1e1e"
          >
            {map}
          </Box>
        )}
        <Flex
          p={isMobile ? "0.5rem" : "1.5rem"}
          mb="1rem"
          gap={isMobile ? "1rem" : "2rem"}
          flexDir="column"
        >
          <Flex gap="1rem" flexDir="column" mt={isMobile ? "0.5rem" : "0"}>
            <Box w="100%">
              <Flex
                className="collapseButton"
                as="button"
                onClick={() => setShowItinerary(!showItinerary)}
              >
                <Flex alignItems="center">
                  <FontAwesomeIcon icon={faMapPin} height="22px" />
                  <Heading ml="0.5rem" fontSize={isMobile ? "18px" : "20px"}>
                    Personalised Itinerary
                  </Heading>
                </Flex>
                <FontAwesomeIcon icon={showItinerary ? faChevronUp : faChevronDown} height="10px" />
              </Flex>
              {showItinerary && (
                <Accordion
                  defaultIndex={Array.from(
                    { length: JSON.parse(trip.itinerary).itinerary.length },
                    (_, i) => i
                  )}
                  allowMultiple
                  w="100%"
                  borderColor="#2c3e50"
                  mb="1rem"
                >
                  {JSON.parse(trip.itinerary).itinerary.map((day, index) => (
                    <AccordionItem key={"Day-Accordion-" + index}>
                      <AccordionButton>
                        <Box
                          as="span"
                          fontWeight="700"
                          fontSize={isMobile ? "16px" : "18px"}
                          py={isMobile ? "0.5rem" : "1rem"}
                          w="100%"
                          flex="1"
                          textAlign="left"
                        >
                          {day.day}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>

                      <AccordionPanel>
                        <VStack spacing="1rem" alignItems="start">
                          <Text fontSize={isMobile ? "16px" : "18px"}>
                            <PlanWithLinks day={day} showMapPin={showMapPin} />
                          </Text>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </Box>
            {!!countryData && (
              <Box w="100%">
                <Flex
                  className="collapseButton"
                  as="button"
                  onClick={() => setShowGeneralInfo(!showGeneralInfo)}
                >
                  <Flex alignItems="center">
                    <FontAwesomeIcon icon={faCircleInfo} height="22px" />
                    <Heading ml="0.5rem" fontSize={isMobile ? "18px" : "20px"}>
                      General Information
                    </Heading>
                  </Flex>
                  <FontAwesomeIcon
                    icon={showGeneralInfo ? faChevronUp : faChevronDown}
                    height="10px"
                  />
                </Flex>
                {showGeneralInfo && <GeneralInfo isMobile={isMobile} countryData={countryData} />}
              </Box>
            )}
            {!!weatherData && (
              <Box w="100%">
                <Flex
                  className="collapseButton"
                  as="button"
                  onClick={() => setShowWeather(!showWeather)}
                >
                  <Flex alignItems="center">
                    <FontAwesomeIcon icon={faSun} height="22px" />
                    <Heading ml="0.5rem" fontSize={isMobile ? "18px" : "20px"}>
                      Weather
                    </Heading>
                  </Flex>
                  <FontAwesomeIcon icon={showWeather ? faChevronUp : faChevronDown} height="10px" />
                </Flex>
                {showWeather && <WeatherInfo isMobile={isMobile} days={weatherData} />}
              </Box>
            )}

            <Box w="100%">
              <Flex className="collapseButton" as="button" onClick={() => setShowTours(!showTours)}>
                <Flex alignItems="center">
                  <FontAwesomeIcon icon={faCircleInfo} height="22px" />
                  <Heading ml="0.5rem" fontSize={isMobile ? "18px" : "20px"}>
                    Tours
                  </Heading>
                </Flex>
                <FontAwesomeIcon icon={showTours ? faChevronUp : faChevronDown} height="10px" />
              </Flex>
              {showTours && (
                <div id="widget-container">
                  <div
                    data-gyg-href="https://widget.getyourguide.com/default/activities.frame"
                    data-gyg-locale-code="en-US"
                    data-gyg-widget="activities"
                    data-gyg-number-of-items="3"
                    data-gyg-partner-id="9WU9RNS"
                    data-gyg-excluded-tour-ids="435198,406786"
                    data-gyg-q={trip.destination}
                  ></div>
                </div>
              )}
            </Box>

            {inFuture && (
              <Box w="100%">
                <Flex
                  className="collapseButton"
                  as="button"
                  onClick={() => setShowBeforeYouGo(!showBeforeYouGo)}
                >
                  <Flex alignItems="center">
                    <FontAwesomeIcon icon={faCircleInfo} height="22px" />
                    <Heading ml="0.5rem" fontSize={isMobile ? "18px" : "20px"}>
                      Before You Go
                    </Heading>
                  </Flex>
                  <FontAwesomeIcon
                    icon={showBeforeYouGo ? faChevronUp : faChevronDown}
                    height="10px"
                  />
                </Flex>
                {showBeforeYouGo && (
                  <Flex gap="0.5rem" flexDir={{ base: "column", md: "row" }}>
                    {latLong[0] !== "" && <FlightPopover myTrip={trip} latLong={latLong} />}

                    <a
                      href={
                        trip.budget?.includes("Luxury")
                          ? `https://www.tablethotels.com/en/${trip.destination
                              .split(", ")[0]
                              ?.toLowerCase()}-hotels?query=${
                              trip.destination
                            }&lang=en&nR=1&nA=2&nC=0&arrDate=${
                              addDay(trip.daterange[0] as Date)
                                .toISOString()
                                .split("T")[0]
                            }
  &depDate=${
    addDay(trip.daterange[1] as Date)
      .toISOString()
      .split("T")[0]
  }
  &isMapView=false`
                          : `https://www.booking.com/searchresults.en-gb.html?ss=${trip.destination
                              .split(" ")
                              .join("")}&lang=en-gb&checkin=${
                              addDay(trip.daterange[0] as Date)
                                .toISOString()
                                .split("T")[0]
                            }&checkout=${
                              addDay(trip.daterange[1] as Date)
                                .toISOString()
                                .split("T")[0]
                            }&group_adults=2&no_rooms=1`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        leftIcon={<FontAwesomeIcon icon={faBed} height="16px" />}
                        rightIcon={<FontAwesomeIcon icon={faChevronRight} height="16px" />}
                        w="100%"
                        onClick={() => mixpanel.track("Opened Stays")}
                        variant="secondary"
                      >
                        See Stays
                      </Button>
                    </a>

                    <a
                      href={`https://www.kayak.com/cars/${trip.destination.split(" ").join("")}/${
                        addDay(trip.daterange[0] as Date)
                          .toISOString()
                          .split("T")[0]
                      }/${
                        addDay(trip.daterange[1] as Date)
                          .toISOString()
                          .split("T")[0]
                      };map?sort=rank_a`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        leftIcon={<FontAwesomeIcon icon={faCar} height="16px" />}
                        rightIcon={<FontAwesomeIcon icon={faChevronRight} height="16px" />}
                        w="100%"
                        onClick={() => mixpanel.track("Opened Cars")}
                        variant="secondary"
                      >
                        See Cars
                      </Button>
                    </a>
                  </Flex>
                )}
              </Box>
            )}
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}

export default Itinerary
