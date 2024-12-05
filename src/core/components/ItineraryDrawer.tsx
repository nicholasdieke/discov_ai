"use client"

import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "@/components/ui/accordion"
import { MyDrawer } from "@/components/ui/vaul-drawer"
import { Box, Button, Flex, Heading, Show, Stack, Text, VStack } from "@chakra-ui/react"
import {
  faBed,
  faCar,
  faChevronRight,
  faCircleInfo,
  faMapPin,
  faSun,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "mapbox-gl/dist/mapbox-gl.css"
import mixpanel from "mixpanel-browser"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import FlightPopover from "./FlightPopover"
import GeneralInfo from "./GeneralInfo"
import Header from "./Header"
import WeatherInfo from "./WeatherInfo"

const ItineraryDrawer = ({ trip, latLong, showMapPin, map, isMobile = false }) => {
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
    <Stack w="full">
      <Box px="1rem" pos="fixed" top="0" w="full" zIndex="100">
        <Header theme="black" showMenu={false} destination={trip.destination} />
      </Box>
      <Show when={!!map}>
        {map}
        <MyDrawer
          title={trip.destination}
          description={`${trip.daterange[0]?.toLocaleDateString("en-US", dateOptions)} - 
                  ${trip.daterange[1]?.toLocaleDateString("en-US", dateOptions)}`}
        >
          <Box w="100%">
            <Flex
              className="collapseButton"
              as="button"
              onClick={() => setShowItinerary(!showItinerary)}
            >
              <Flex alignItems="center">
                <FontAwesomeIcon icon={faMapPin} height="22px" />
                <Heading ml="0.5rem" fontSize="18px">
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
                // @ts-ignore
                <AccordionItem key={"Day-Accordion-" + index} value={index}>
                  {/* @ts-ignore */}
                  <AccordionItemTrigger>{day.day}</AccordionItemTrigger>

                  <AccordionItemContent>
                    <VStack gap="1rem" alignItems="start">
                      <Text fontSize="14px">
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
                  <Heading ml="0.5rem" fontSize="18px">
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
                  <Heading ml="0.5rem" fontSize="18px">
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
                <Heading ml="0.5rem" fontSize="18px">
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
                  <Heading ml="0.5rem" fontSize="18px">
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
        </MyDrawer>
      </Show>
    </Stack>
  )
}

export default ItineraryDrawer
