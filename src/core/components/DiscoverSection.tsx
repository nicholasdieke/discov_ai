import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import mixpanel from "mixpanel-browser"
import { RefObject, useEffect, useRef, useState } from "react"
import { useMediaQuery } from "react-responsive"
import DiscoverForm from "./DiscoverForm"

function DiscoverSection() {
  const [result, setResult] = useState<{ destination: string; description: string }[]>([])
  const [images, setImages] = useState([])
  const [originLatLng, setOriginLatLng] = useState([])
  const [showMap, setShowMap] = useState(true)
  const isMobile = useMediaQuery({ maxWidth: 767 })

  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)

  const MapboxMap = () => {
    const mapContainerRef = useRef(null)

    useEffect(() => {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: originLatLng,
        zoom: 1,
      })
      result.map((res) => {
        new mapboxgl.Marker()
          .setLngLat([
            res["lng_lat_coordinates"].split(",")[1],
            res["lng_lat_coordinates"].split(",")[0],
          ])
          .addTo(map)
      })

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!isMobile) {
              if (entry.isIntersecting) {
                entry.target.classList.add("active")
                const activeDest = result.find((r) => r.destination === entry.target.id)
                map.flyTo({
                  bearing: 0,
                  center: [
                    activeDest!["lng_lat_coordinates"].split(",")[1] || 0,
                    activeDest!["lng_lat_coordinates"].split(",")[0] || 0,
                  ],
                  zoom: 12,
                  pitch: 30,
                })
              } else {
                entry.target.classList.remove("active")
              }
            }
          })
        },
        { rootMargin: "-50px 0px -50px 0px" }
      )
      let dests = document.querySelectorAll(".destinationBox")
      dests.forEach((d) => observer.observe(d))
    }, [])

    return <Box className="mapContainer2" w={isMobile ? "100%" : "60%"} ref={mapContainerRef} />
  }

  useEffect(() => {
    if (!!images.length) {
      executeScroll()
    }
  }, [images])

  const myRef: RefObject<HTMLDivElement> = useRef(null)

  const executeScroll = () => {
    if (myRef.current) {
      myRef.current.scrollIntoView()
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <Flex ref={myRef} w="100%" justifyContent="center">
      {!images.length && (
        <DiscoverForm
          setResult={setResult}
          images={images}
          setImages={setImages}
          setOriginLatLng={setOriginLatLng}
        />
      )}
      {!!result.length && !!images.length && (
        <Flex flexDir="column" alignItems="center" w="100%">
          <Flex
            className="discoverform"
            height={{ base: "100vh", sm: "70vh" }}
            color="white"
            alignItems="start"
            ml={isMobile ? "0rem" : "2rem"}
            flexDir={isMobile ? "column" : "row"}
          >
            {isMobile && (
              <Button w="100%" mb="0.5rem" variant="outline" onClick={() => setShowMap(!showMap)}>
                Show {showMap ? "Results" : "Map"}
              </Button>
            )}
            {((isMobile && !showMap) || !isMobile) && (
              <Box display="block" overflowY="scroll" height="100%" w="100%">
                {result.map((destination, index) => {
                  return (
                    <Flex
                      className={isMobile ? "destinationBox active" : "destinationBox"}
                      id={destination.destination}
                      key={"destination-" + (index + 1)}
                    >
                      <VStack textAlign="start" alignItems="start" mb="2rem" w="100%">
                        <Heading size="lg">
                          {index + 1}. {destination.destination}
                        </Heading>
                        <Text>{destination.description}</Text>
                      </VStack>
                      <Box
                        borderRadius="5px"
                        bgSize="cover"
                        h="250px"
                        w="100%"
                        bgImage={images[index]}
                        bgPos="center"
                      />
                    </Flex>
                  )
                })}
              </Box>
            )}
            {((isMobile && showMap) || !isMobile) && <MapboxMap />}
          </Flex>
          <Button
            mt="2rem"
            variant="primary"
            onClick={() => {
              setResult([])
              setImages([])
              setOriginLatLng([])
              scrollToTop()
            }}
          >
            <FontAwesomeIcon icon={faSearch} height="20px" />
            <Text ml="0.5rem">New Search</Text>
          </Button>
        </Flex>
      )}
    </Flex>
  )
}

export default DiscoverSection
