import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  PopoverTrigger as OrigPopoverTrigger,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  useDisclosure,
} from "@chakra-ui/react"
import { faChevronRight, faLocationDot, faPlaneDeparture } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import mixpanel from "mixpanel-browser"
import { useEffect, useRef, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"

export const PopoverTrigger: React.FC<{ children: React.ReactNode }> = OrigPopoverTrigger

const FlightPopover = ({ myTrip, latLong }) => {
  const autoCompleteRef = useRef<google.maps.places.Autocomplete>()
  const inputRef = useRef<HTMLInputElement>(null)
  const [origin, setOrigin] = useState("")
  const [destCode, setDestCode] = useState("")

  const { onOpen, onClose, isOpen } = useDisclosure()

  const cityCodes = new Map([
    ["london", "LON"],
    ["new york", "NYC"],
    ["milan", "MIL"],
    ["tokyo", "TYO"],
    ["paris", "PAR"],
    ["melbourne", "MEL"],
    ["stockholm", "STO"],
    ["buenos aires", "BUE"],
    ["sao paulo", "SAO"],
    ["toronto", "YTO"],
    ["madrid", "MAD"],
    ["las vegas", "LAS,BLD"],
    ["Upper Bavaria", "MUC"],
    ["Oberbayern", "MUC"],
  ])

  function addDay(date) {
    var result = new Date(date)
    result.setDate(result.getDate() + 1)
    return result
  }

  function getMapKey(input) {
    const entries = Array.from(cityCodes.entries())
    for (let i = 0; i < entries.length; i++) {
      const [city, code] = entries[i]!
      const regex = new RegExp("\\b" + city + "\\b", "i")
      if (regex.test(input)) {
        return code
      }
    }
    return null // no match found
  }

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.google &&
      inputRef.current instanceof HTMLInputElement
    ) {
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current)
      autoCompleteRef.current.addListener("place_changed", async function () {
        if (autoCompleteRef.current) {
          const place = autoCompleteRef.current.getPlace()
          if (place && place.address_components && place.geometry && place.geometry.location) {
            let places: string[] = []
            for (let i = 0; i < place.address_components.length; i++) {
              let comp = place.address_components[i]
              if (
                comp?.types &&
                places.length === 0 &&
                ["administrative_area_level_1", "administrative_area_level_2"].some((code) =>
                  comp!.types.includes(code)
                )
              ) {
                places.push(comp.long_name)
              } else if (
                comp?.types &&
                ["country", "continent"].some((code) => comp!.types.includes(code))
              ) {
                places.push(comp.long_name)
                const lat = place.geometry.location.lat()
                const lng = place.geometry.location.lng()
                const re = await fetch(`https://iatageo.com/getCode/${lat}/${lng}`)
                const data = await re.json()
                const code = getMapKey(places.join(", "))

                if (!code) {
                  places.unshift(data.IATA)
                } else {
                  places.unshift(code)
                }

                setOrigin(places.join(", "))
                break
              }
            }
          }
        }
      })
    }
  }, [])
  const getDestCode = async () => {
    const url = `https://iatageo.com/getCode/${latLong[0]}/${latLong[1]}`
    const response = await fetch(url)
    const data = await response.json()

    const code = getMapKey(myTrip.destination)
    if (!code) {
      setDestCode(data.IATA)
    } else {
      setDestCode(code)
    }
  }

  useEffect(() => {
    getDestCode().catch((e) => console.log(e))
  }, [])

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom"
      closeOnBlur={false}
    >
      <PopoverTrigger>
        <Button
          leftIcon={<FontAwesomeIcon icon={faPlaneDeparture} height="16px" />}
          rightIcon={<FontAwesomeIcon icon={faChevronRight} height="16px" />}
          variant="outline"
          onClick={() => mixpanel.track("Opened Flights")}
          variant="secondary"
        >
          See Flights
        </Button>
      </PopoverTrigger>
      <PopoverContent p={5} bg="gray.700" color="#ffffffdb" borderColor="#ffffff70">
        {/* <ReactFocusLock returnFocus persistentFocus={false}> */}
        <PopoverArrow />
        <PopoverCloseButton />
        <form>
          <Flex alignItems="flex-end">
            <FormControl mr="0.5rem">
              <FormLabel htmlFor="Departure city or airport">Departure city or airport</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FontAwesomeIcon icon={faLocationDot} height="20px" />
                </InputLeftElement>
                <Input
                  id="destination"
                  name="destination"
                  type="text"
                  placeholder="City or State"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  ref={inputRef}
                />
              </InputGroup>
            </FormControl>
            <a
              style={{ pointerEvents: !origin ? "none" : "auto" }}
              href={
                !origin
                  ? "#"
                  : `https://www.kayak.com/flights/${
                      origin.split(",")[0]
                    },nearby-${destCode},nearby/${
                      addDay(myTrip.daterange[0] as Date)
                        .toISOString()
                        .split("T")[0]
                    }/${
                      addDay(myTrip.daterange[1] as Date)
                        .toISOString()
                        .split("T")[0]
                    }?sort=bestflight_a`
              }
              target="_blank"
              rel="noreferrer"
            >
              <IconButton
                icon={<FontAwesomeIcon icon={faPlaneDeparture} height="20px" />}
                variant="primary"
                aria-label="Search Flights"
                disabled={!origin}
              />
            </a>
          </Flex>
        </form>
      </PopoverContent>
    </Popover>
  )
}

export default FlightPopover
