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
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react"
import {
  faBed,
  faCalendarDays,
  faCar,
  faChevronRight,
  faClipboard,
  faEnvelope,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Trip } from "db"
import mapboxgl from "mapbox-gl"
import mixpanel from "mixpanel-browser"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import FlightPopover from "src/core/components/FlightPopover"
import Footer from "src/core/components/Footer"
import GeneralInfo from "src/core/components/GeneralInfo"
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
  const maps_key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)

  const [myTrip, setMyTrip] = useState<Trip | null | undefined>(undefined)

  const [photoUrl, setPhotoUrl] = useState("")
  const [countryData, setCountryData] = useState()
  const [weatherData, setWeatherData] = useState()
  const [inFuture, setInFuture] = useState(false)
  const [latLong, setLatLong] = useState(["", ""])

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

  const getCountryInfo = (country) => {
    return fetch("/api/getCountryInfo?country=" + country)
      .then((response) => response.json())
      .then((response) => {
        console.log(response.result[0])
        setCountryData(response.result[0])
      })
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
    // Gets all the info
    invoke(getTrip, { id: tripId })
      .then((trip) => {
        if (!!tripId && !!trip) {
          setMyTrip(trip as Trip)
          getPhoto(trip.destination)
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
          setLoading(false)
          setLongTrip(dateDiffInDays(trip.daterange[0], trip.daterange[1]) >= 10)

          fetch("/api/getLatLng?destination=" + trip.destination, {
            method: "GET",
          })
            .then((response) => response.json())
            .then(async (response) => {
              setLatLong([response.result.lat, response.result.lng])
            })
            .catch((e) => console.log(e))

          mixpanel.track("Viewed Trip Page")
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

  const MapboxMap = () => {
    const mapContainerRef = useRef(null)

    useEffect(() => {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [latLong[1], latLong[0]],
        zoom: myTrip!.destination.includes(",") ? 11 : 5,
      })
    }, [])

    return (
      <Box w="100%">
        <Heading size="md" mb="1rem">
          🗺️ Map
        </Heading>
        <div className="map-container" ref={mapContainerRef} />
      </Box>
    )
  }

  const script = "https://maps.googleapis.com/maps/api/js?key=" + maps_key + "&libraries=places"

  const [loaded, setLoaded] = useState(false)

  const shareMessage = `Check out the trip to ${
    myTrip?.destination.split(", ")[0]
  } I made on DiscovAI! www.discovai.com${router.asPath}`

  function copyURI(evt) {
    evt.preventDefault()
    navigator.clipboard.writeText(shareMessage).then(
      () => {},
      () => {}
    )
  }

  const showToast = () => {
    toast({
      title: "Copied to Clipboard.",
      description: "You've copied the trip link to your clipboard.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "bottom-right",
    })
  }

  return (
    <>
      <Head>
        <title>DiscovAI | Trip</title>

        <meta
          name="description"
          content="Discover your dream vacation with DiscovAI, the AI-powered travel planner that creates personalised itineraries based on your interests and budget. Plan your perfect trip today!"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="DiscovAI | Trip" />
        <meta property="og:url" content="/" />
        <meta
          property="og:image"
          content="https://www.dropbox.com/s/hmmp4gklv03u11n/share-image.png?raw=1"
        />
        <meta name="twitter:title" content="DiscovAI | Trip" />
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
      <script src={script} onLoad={() => setLoaded(true)} />
      <Box bg="#1a1c21" h="100%" color="#ffffffdb">
        <Flex
          flexDir="column"
          minH="100vh"
          px={{ base: "1.5rem", lg: "6rem" }}
          py={{ base: "0.25rem", lg: "0.5rem" }}
          justifyContent="space-between"
        >
          <>
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
                    bgColor="rgb(0,0,0,0.45)"
                    w="100%"
                  >
                    <VStack spacing="0.5rem" color="white" textAlign="center">
                      <Heading fontSize={{ base: "30px", md: "50px", lg: "70px" }}>
                        {myTrip.destination}
                      </Heading>
                      <Divider />
                      <HStack fontSize="18px">
                        <FontAwesomeIcon icon={faCalendarDays} height="22px" />
                        <Text fontSize={{ base: "0.9rem", md: "1.5rem" }}>
                          {myTrip.daterange[0]?.toLocaleDateString("en-US", dateOptions)} -{" "}
                          {myTrip.daterange[1]?.toLocaleDateString("en-US", dateOptions)}
                        </Text>
                      </HStack>
                      {countryData && <GeneralInfo countryData={countryData} />}
                    </VStack>
                  </Flex>
                </Flex>
                <Flex my="1rem" gap="2rem" flexDir="column">
                  <Flex gap="2rem" flexDir={{ base: "column-reverse", md: "column" }}>
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
                        📍 Personalised Itinerary
                      </Heading>
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
                    </Box>
                  </Flex>

                  <MapboxMap />

                  <Box w="100%" mt="3rem">
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

                  {inFuture && (
                    <Box w="100%">
                      <Heading size="md" mb="1rem">
                        📝 Before You Go
                      </Heading>
                      <Flex gap="0.5rem" flexDir={{ base: "column", md: "row" }}>
                        {latLong[0] !== "" && (
                          <FlightPopover myTrip={myTrip} loaded={loaded} latLong={latLong} />
                        )}

                        <a
                          href={
                            myTrip.budget?.includes("Luxury")
                              ? `https://www.tablethotels.com/en/${myTrip.destination
                                  .split(", ")[0]
                                  ?.toLowerCase()}-hotels?query=${
                                  myTrip.destination
                                }&lang=en&nR=1&nA=2&nC=0&arrDate=${
                                  addDay(myTrip.daterange[0] as Date)
                                    .toISOString()
                                    .split("T")[0]
                                }
&depDate=${
                                  addDay(myTrip.daterange[1] as Date)
                                    .toISOString()
                                    .split("T")[0]
                                }
&isMapView=false`
                              : `https://www.kayak.com/hotels/${myTrip.destination
                                  .split(" ")
                                  .join("")}/${
                                  addDay(myTrip.daterange[0] as Date)
                                    .toISOString()
                                    .split("T")[0]
                                }/${
                                  addDay(myTrip.daterange[1] as Date)
                                    .toISOString()
                                    .split("T")[0]
                                }/2adults?sort=rank_a`
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button
                            leftIcon={<FontAwesomeIcon icon={faBed} height="16px" />}
                            rightIcon={<FontAwesomeIcon icon={faChevronRight} height="16px" />}
                            variant="outline"
                            w="100%"
                            onClick={() => mixpanel.track("Opened Stays")}
                            className="white"
                          >
                            See Stays
                          </Button>
                        </a>

                        <a
                          href={`https://www.kayak.com/cars/${myTrip.destination
                            .split(" ")
                            .join("")}/${
                            addDay(myTrip.daterange[0] as Date)
                              .toISOString()
                              .split("T")[0]
                          }/${
                            addDay(myTrip.daterange[1] as Date)
                              .toISOString()
                              .split("T")[0]
                          };map?sort=rank_a`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button
                            leftIcon={<FontAwesomeIcon icon={faCar} height="16px" />}
                            rightIcon={<FontAwesomeIcon icon={faChevronRight} height="16px" />}
                            variant="outline"
                            w="100%"
                            onClick={() => mixpanel.track("Opened Cars")}
                            className="white"
                          >
                            See Cars
                          </Button>
                        </a>

                        <Menu>
                          <MenuButton
                            as={Button}
                            variant="outline"
                            leftIcon={<FontAwesomeIcon icon={faShareNodes} height="18px" />}
                            _hover={{ bg: "gray.700" }}
                            _expanded={{ bg: "gray.700" }}
                            _focus={{ boxShadow: "outline" }}
                            className="white"
                          >
                            Share
                          </MenuButton>
                          <MenuList bg="gray.700">
                            <a
                              href={`whatsapp://send?text=${shareMessage}`}
                              data-action="share/whatsapp/share"
                            >
                              <MenuItem
                                _hover={{ bg: "gray.600" }}
                                _focus={{ bg: "gray.600" }}
                                bg="inherit"
                                onClick={() =>
                                  mixpanel.track("Shared Trip", { platform: "WhatsApp" })
                                }
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
                                myTrip.destination.split(",")[0]
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
                              <MenuItem
                                _hover={{ bg: "gray.600" }}
                                _focus={{ bg: "gray.600" }}
                                bg="inherit"
                                onClick={() =>
                                  mixpanel.track("Shared Trip", { platform: "Clipboard" })
                                }
                              >
                                <FontAwesomeIcon icon={faClipboard} height="16px" />
                                <Text ml="0.5rem">Clipboard</Text>
                              </MenuItem>
                            </a>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </Box>
                  )}
                </Flex>
              </>
            )}
            {loading && (
              <Flex alignItems={"center"} justifyContent="center" w="100%" flexDir="column">
                <Spinner size="xl" />
                <Text mt="2rem">Loading Trip...</Text>
              </Flex>
            )}
            {notFound && !myTrip && (
              <Flex alignItems={"center"} justifyContent="center" w="100%" flexDir="column">
                <Heading color="#ffffffdb" size="lg" textAlign="center" mt="5rem" mb="1rem">
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
          </>
          <Footer theme="white" />
        </Flex>
      </Box>
    </>
  )
}

export default TripPage
