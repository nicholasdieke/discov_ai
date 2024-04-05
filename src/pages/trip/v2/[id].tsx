import { BlitzPage, Routes } from "@blitzjs/next"
import { invoke } from "@blitzjs/rpc"
import "mapbox-gl/dist/mapbox-gl.css"

import { Box, Button, Flex, Heading, Spinner, Text, useToast } from "@chakra-ui/react"
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Trip } from "db"
import mapboxgl from "mapbox-gl"
import mixpanel from "mixpanel-browser"
import Head from "next/head"
import { useRouter } from "next/router"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import { renderToStaticMarkup } from "react-dom/server"
import { useMediaQuery } from "react-responsive"
import Itinerary from "src/core/components/Itinerary"
import getTrip from "src/core/queries/getTrip"

const TripPagev2: BlitzPage = () => {
  const router = useRouter()
  const tripId = router.query.id as string
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [pins, setPins] = useState([])
  const [latLong, setLatLong] = useState(["", ""])
  const [myMap, setMyMap] = useState()
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  const toast = useToast()
  const maps_key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const isMobile = useMediaQuery({ maxWidth: 767 })

  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)

  const [myTrip, setMyTrip] = useState<Trip | null | undefined>(undefined)

  const getDetails = (tripId) => {
    // Gets all the info
    invoke(getTrip, { id: tripId })
      .then((trip) => {
        if (!!tripId && !!trip && !!trip.itinerary) {
          setMyTrip(trip as Trip)
          setPins(JSON.parse(trip.itinerary as string).itinerary.map((day) => day.lat_lngs))
          fetch("/api/getLatLng?destination=" + trip.destination, {
            method: "GET",
          })
            .then((response) => response.json())
            .then(async (response) => {
              setLatLong([response.result.lat, response.result.lng])
            })
            .catch((e) => console.log(e))
          setLoading(false)
          mixpanel.track("Viewed Trip Page")
        } else if (!!tripId) {
          setLoading(false)
          setNotFound(true)
        }
      })
      .catch((e) => console.log(e))
  }

  useEffect(() => {
    getDetails(tripId)
  }, [tripId])

  const script = "https://maps.googleapis.com/maps/api/js?key=" + maps_key + "&libraries=places"
  var map
  var markers: mapboxgl.Marker[] = []

  const showMapPin = (lat, lng) => {
    map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 13), duration: 750 })

    if (map) {
      const marker = markers.find(
        (marker) => marker._lngLat.lng == lng && marker._lngLat.lat == lat
      )
      if (marker) {
        markers.forEach((marker) => {
          if (marker._lngLat.lng !== lng || marker._lngLat.lat !== lat) {
            marker.getPopup().remove()
          }
        })

        marker.togglePopup()
      }
    }
  }

  const MapboxMap = () => {
    const mapContainerRef = useRef(null)
    const isMobile = useMediaQuery({ maxWidth: 767 })

    const createMarkers = (map, pins) => {
      markers.forEach((marker) => marker.remove())
      markers = []
      const icon = renderToStaticMarkup(<FontAwesomeIcon icon={faExternalLinkAlt} height="20px" />)

      pins.forEach((place) =>
        Object.keys(place).forEach((name) => {
          // Create a DOM element for each marker.
          const el = document.createElement("div")
          const width = 45
          const height = 45
          el.className = "marker"
          el.style.backgroundImage = `url('/location-icons/${place[name][
            "category"
          ].toLowerCase()}.svg')`
          el.style.width = `${width}px`
          el.style.height = `${height}px`
          el.style.backgroundSize = "100%"
          el.style.borderRadius = "50%"
          el.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.15)"

          const popupContent = `
          <div style="display: flex; align-items: center;">
    <p style="margin-right: 5px; font-size: 16px; font-weight: 500;">${name}</p>
    <a style="z-index: 20;" href='http://maps.google.com/?q=${name}, ${myTrip?.destination}' target="_blank">${icon}</a>
</div>

        `

          const marker = new mapboxgl.Marker(el)
            .setLngLat([place[name]["lng"], place[name]["lat"]])
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: true }).setHTML(
                popupContent
              )
            )
            .addTo(map)

          marker.getPopup().on("open", () => {
            const anchorElement = marker.getPopup().getElement().querySelector("a")
            if (anchorElement) {
              anchorElement.addEventListener("touchend", () => {
                anchorElement.click()
              })
            }
          })

          el.addEventListener("click", () => {
            map.flyTo({
              bearing: 0,
              center: place[name],
              zoom: Math.max(map.getZoom(), 13),
              pitch: 0,
              duration: 500,
            })
          })
          el.addEventListener("touchend", () => {
            map.flyTo({
              bearing: 0,
              center: place[name],
              zoom: Math.max(map.getZoom(), 13),
              pitch: 0,
              duration: 500,
            })
          })

          markers.push(marker)
        })
      )
    }

    // mapbox://styles/discovai/clsuhe2yz000h01qzg5d2cahb
    const initializeMap = () => {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [latLong[1], latLong[0]],
        zoom: myTrip?.destination.includes(",") ? 11 : 6,
      })

      map.on("load", function () {
        map.resize()
      })

      return map
    }

    useEffect(() => {
      map = initializeMap()
      createMarkers(map, pins)

      return () => {
        if (map) {
          map.remove()
          markers.forEach((marker) => marker.remove())
        }
      }
    }, [pins, isMapExpanded])

    return (
      <Box
        h={isMobile ? (isMapExpanded ? "100vh" : "225px") : "100vh"}
        w={isMobile ? "100%" : "50%"}
        borderRadius={isMobile ? "7px" : "0px"}
        overflow="hidden"
      >
        <div style={{ height: "100%" }} ref={mapContainerRef} />
      </Box>
    )
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
      <Script src={script} />
      <Flex
        bg="#1E1E1E"
        minH="100vh"
        w="100vw"
        maxW="100vw"
        overflowX="hidden"
        color="primary"
        flexDir="row"
      >
        {!loading && !!myTrip && (
          <>
            {isMobile ? (
              <Itinerary
                trip={myTrip}
                map={<MapboxMap />}
                latLong={latLong}
                showMapPin={showMapPin}
                isMobile
                isMapExpanded={isMapExpanded}
                setIsMapExpanded={setIsMapExpanded}
              />
            ) : (
              <>
                <Itinerary
                  trip={myTrip}
                  map={null}
                  latLong={latLong}
                  showMapPin={showMapPin}
                  isMapExpanded={null}
                  setIsMapExpanded={null}
                />
                <MapboxMap />
              </>
            )}
          </>
        )}

        {loading && (
          <Flex alignItems="center" justifyContent="center" w="100%" flexDir="column">
            <Spinner size="xl" />
            <Text mt="2rem">Loading Trip...</Text>
          </Flex>
        )}
        {notFound && !myTrip && (
          <Flex alignItems="center" justifyContent="center" w="100%" flexDir="column">
            <Heading color="#ffffffdb" size="lg" textAlign="center" mt="5rem" mb="1rem">
              Sorry, this trip does not exist.
            </Heading>
            <Button
              variant="primary"
              mt="1rem"
              width="200px"
              onClick={() => router.push(Routes.Home())}
            >
              Go Home!
            </Button>
          </Flex>
        )}
      </Flex>
    </>
  )
}

export default TripPagev2
