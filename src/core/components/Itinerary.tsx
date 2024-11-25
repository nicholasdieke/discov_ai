import { Routes } from "@blitzjs/next"
import "mapbox-gl/dist/mapbox-gl.css"

import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Show,
  Text,
  VStack,
} from "@chakra-ui/react"
import {
  faBed,
  faCalendarDays,
  faCar,
  faChevronRight,
  faCircleInfo,
  faMapPin,
  faShareNodes,
  faSun,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import mixpanel from "mixpanel-browser"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import { LuClipboard, LuMailOpen, LuMessageCircle } from "react-icons/lu"
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "src/components/ui/accordion"
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "src/components/ui/menu"
import { toaster } from "src/components/ui/toaster"
import FlightPopover from "./FlightPopover"
import GeneralInfo from "./GeneralInfo"
import WeatherInfo from "./WeatherInfo"

const Itinerary = ({ trip, latLong, showMapPin, map, isMobile = false }) => {
  const [weatherData, setWeatherData] = useState()
  const [countryData, setCountryData] = useState()
  const [inFuture, setInFuture] = useState(false)
  const [showItinerary, setShowItinerary] = useState(true)

  const router = useRouter()

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
          height={{ base: "250px", sm: "150px", lg: "250px" }}
          bgPos="center"
          bgRepeat="no-repeat"
          bgImage={`url(${trip.imageUrl})`}
          bgSize="cover"
          pos="relative"
        >
          <Flex
            p="1.5rem"
            alignItems="flex-end"
            justifyContent="left"
            h="inherit"
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
              <MenuRoot>
                <Show when={isMobile}>
                  <MenuTrigger asChild>
                    <IconButton _focus={{ boxShadow: "outline" }}>
                      <FontAwesomeIcon icon={faShareNodes} height="18px" />
                    </IconButton>
                  </MenuTrigger>
                </Show>
                <Show when={!isMobile}>
                  <MenuTrigger asChild>
                    <Button _focus={{ boxShadow: "outline" }}>
                      <FontAwesomeIcon icon={faShareNodes} height="18px" />
                      Share
                    </Button>
                  </MenuTrigger>
                </Show>

                <MenuContent>
                  <MenuItem value="whatsapp" asChild>
                    <a
                      href={`whatsapp://send?text=${shareMessage}`}
                      data-action="share/whatsapp/share"
                      onClick={() => mixpanel.track("Shared Trip", { platform: "WhatsApp" })}
                    >
                      <LuMessageCircle />
                      <Box flex="1">Whatsapp</Box>
                    </a>
                  </MenuItem>

                  <MenuItem value="email" asChild>
                    <a
                      href={`mailto:?body=${shareMessage}body&subject=${
                        trip.destination.split(",")[0]
                      } Trip | DiscovAI`}
                      onClick={() => mixpanel.track("Shared Trip", { platform: "Email" })}
                    >
                      <LuMailOpen />
                      <Box flex="1">Email</Box>
                    </a>
                  </MenuItem>

                  <Show when={!!navigator.clipboard}>
                    <MenuItem value="clipboard" asChild>
                      <Box
                        onClick={(e) => {
                          copyURI(e)
                          toaster.create({
                            description: "File saved successfully",
                            type: "info",
                          })
                          mixpanel.track("Shared Trip", { platform: "Clipboard" })
                        }}
                      >
                        <LuClipboard />
                        <Box flex="1">Clipboard</Box>
                      </Box>
                    </MenuItem>
                  </Show>
                </MenuContent>
              </MenuRoot>
            </Flex>

            <VStack gap="0.5rem" color="primary" alignItems="flex-start">
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
        <Show when={!!map}>
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
        </Show>
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
              </Flex>
              <AccordionRoot
                defaultValue={Array.from(
                  { length: JSON.parse(trip.itinerary).itinerary.length },
                  (_, i) => i
                )}
                multiple
                w="100%"
                //borderColor="#2c3e50"
                mb="1rem"
                variant="plain"
              >
                {JSON.parse(trip.itinerary).itinerary.map((day, index) => (
                  <AccordionItem key={"Day-Accordion-" + index} value={index}>
                    <AccordionItemTrigger>{day.day}</AccordionItemTrigger>

                    <AccordionItemContent>
                      <VStack gap="1rem" alignItems="start">
                        <Text fontSize={isMobile ? "16px" : "18px"}>
                          <PlanWithLinks day={day} showMapPin={showMapPin} />
                        </Text>
                      </VStack>
                    </AccordionItemContent>
                  </AccordionItem>
                ))}
              </AccordionRoot>
            </Box>
            <Show when={!!countryData}>
              <Box w="100%">
                <Flex className="collapseButton">
                  <Flex alignItems="center">
                    <FontAwesomeIcon icon={faCircleInfo} height="22px" />
                    <Heading ml="0.5rem" fontSize={isMobile ? "18px" : "20px"}>
                      General Information
                    </Heading>
                  </Flex>
                </Flex>
                <GeneralInfo isMobile={isMobile} countryData={countryData} />{" "}
              </Box>
            </Show>
            <Show when={!!weatherData}>
              <Box w="100%">
                <Flex className="collapseButton">
                  <Flex alignItems="center">
                    <FontAwesomeIcon icon={faSun} height="22px" />
                    <Heading ml="0.5rem" fontSize={isMobile ? "18px" : "20px"}>
                      Weather
                    </Heading>
                  </Flex>
                </Flex>
                <WeatherInfo isMobile={isMobile} days={weatherData} />{" "}
              </Box>
            </Show>

            <Box w="100%">
              <Flex className="collapseButton">
                <Flex alignItems="center">
                  <FontAwesomeIcon icon={faCircleInfo} height="22px" />
                  <Heading ml="0.5rem" fontSize={isMobile ? "18px" : "20px"}>
                    Tours
                  </Heading>
                </Flex>
              </Flex>
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
            </Box>

            <Show when={inFuture}>
              <Box w="100%">
                <Flex className="collapseButton">
                  <Flex alignItems="center">
                    <FontAwesomeIcon icon={faCircleInfo} height="22px" />
                    <Heading ml="0.5rem" fontSize={isMobile ? "18px" : "20px"}>
                      Before You Go
                    </Heading>
                  </Flex>
                </Flex>
                <Flex gap="0.5rem" flexDir={{ base: "column", md: "row" }}>
                  <Show when={latLong[0] !== ""}>
                    <FlightPopover myTrip={trip} latLong={latLong} />
                  </Show>
                  <Button
                    onClick={() => {
                      mixpanel.track("Opened Stays")
                      window.open(
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
                      )
                    }}
                  >
                    <FontAwesomeIcon icon={faBed} height="16px" />
                    See Stays
                    <FontAwesomeIcon icon={faChevronRight} height="16px" />
                  </Button>

                  <Button
                    onClick={() => {
                      mixpanel.track("Opened Cars")
                      window.open(
                        `https://www.kayak.com/cars/${trip.destination.split(" ").join("")}/${
                          addDay(trip.daterange[0] as Date)
                            .toISOString()
                            .split("T")[0]
                        }/${
                          addDay(trip.daterange[1] as Date)
                            .toISOString()
                            .split("T")[0]
                        };map?sort=rank_a`
                      )
                    }}
                  >
                    <FontAwesomeIcon icon={faCar} height="16px" />
                    See Cars
                    <FontAwesomeIcon icon={faChevronRight} height="16px" />
                  </Button>
                </Flex>
              </Box>
            </Show>
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}

export default Itinerary
