import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Select } from "chakra-react-select"
// import Select from "react-select"

import { faLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useFormik } from "formik"
import Lottie from "lottie-react"
import mixpanel from "mixpanel-browser"
import { useRouter } from "next/router"
import loading_animation from "public/destinations-lottie.json"
import { useEffect, useRef, useState } from "react"
import MyDateRangePicker from "./MyDateRangePicker"

function DiscoverForm({ setResult, images, setImages, setOriginLatLng }) {
  const router = useRouter()

  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)

  const [dateRange, setDateRange] = useState([null, null])
  const [isLoading, setIsLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const destImages = []
  const [startDate, endDate] = dateRange

  const dateDiffInDays = (a, b) => {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())

    return Math.floor((utc2 - utc1) / _MS_PER_DAY)
  }

  const distanceOptions = [
    {
      label: "🌳 Nearby Adventure",
      value: "rechable by car or train",
    },
    {
      label: "🌊 Moderate Distance",
      value: "a 1-4 hour flight away",
    },
    {
      label: "🌍 Far Away",
      value: "far away",
    },
  ]

  const budgetOptions = [
    {
      label: "🪙 Basic",
      value: "cheap",
    },
    {
      label: "💸 Comfortable",
      value: "middle-priced",
    },
    {
      label: "💎 Luxury",
      value: "luxury",
    },
  ]

  const touristyOptions = [
    {
      label: "💎 Hidden Gem",
      value: "hidden gem",
    },
    {
      label: "💃 Trendy Hotspot",
      value: "Trendy Hotspot",
    },
    {
      label: "🌍 Tourist Magnet",
      value: "tourist magnet",
    },
  ]

  const groupOptions = [
    {
      label: "👫 Friends",
      value: "friends",
    },
    {
      label: "👪 Family",
      value: "family",
    },
    {
      label: "🤸 Solo",
      value: "solo",
    },
    {
      label: "💑 Couple",
      value: "couple",
    },
  ]
  const styleOptions = [
    {
      label: "⛰️ Adventure",
      value: "adventurous",
    },
    {
      label: "🌹 Romance",
      value: "romantic",
    },
    {
      label: "🏺 History",
      value: "historic",
    },
    {
      label: "🍜 Foodie",
      value: "foodie",
    },
    {
      label: "🌊 Relax",
      value: "relaxing",
    },
    {
      label: "🍾 Party",
      value: "party",
    },
  ]

  const getPhoto = (destination) => {
    return fetch("/api/getDestPhoto?destination=" + destination)
      .then((response) => response.json())
      .then((response) => {
        return response.result[0].urls.regular
      })
      .catch((e) => console.log(e))
  }

  const loadImages = async (destinations) => {
    const destImages = await Promise.all(destinations.map((dest) => getPhoto(dest.destination)))
    setImages(destImages)
  }

  const sendPrompt = async (values) => {
    setIsLoading(true)
    let prompt = `I'm planning a ${
      values.group.value
    } trip and would like some recommendations. I will be traveling from ${(
      values.daterange[0] as Date
    ).toDateString()} to ${(values.daterange[1] as Date).toDateString()} and have a ${
      values.budget.value
    } budget. I want a ${values.activity.map((obj) => obj.value).join(", ")} trip ${
      values.specactivity.value === "" ? "" : ", where I can " + values.specactivity
    }. I'm based in ${values.origin} and prefer destinations that are ${
      values.distance.value
    } and considered a ${
      values.touristy.value
    }. Can you recommend five destinations and activities for me to consider. Provide them in JSON format with the following keys: destination, description (4-6 sentences) and lng_lat_coordinates (formatted like 44.8681, 13.8481). Here is an example of the correct format: { “destinations”: [{"destination": "destination"}, {"description": “description”},{“lng_lat_coordinates”: “44.1, 0.4”}, …]}`

    await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prompt),
    })
      .then((response) => response.json())
      .then((response) => JSON.parse(response.result))
      .then((response) => {
        setIsLoading(false)
        setResult(response.destinations)
        loadImages(response.destinations)

        //   values = {
        //     ...values,
        //     group: values.group.label,
        //     activity: values.activity.map((obj) => obj.value).join(", "),
        //     itinerary: response.result,
        //     budget: values.budget.label,
        //   }
        //   mixpanel.track("Created Trip", {"destination": values.destination})
        //   await createTrip(values)
        //     .then((trip) => router.push(Routes.TripPage({ id: trip.id })))
        //     .catch((e) => console.log(e))
      })
      .catch((e) => console.log(e))
  }
  const script =
    "https://maps.googleapis.com/maps/api/js?key=" +
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY +
    "&libraries=places"

  // Handling the form
  const formik = useFormik({
    validateOnChange: false,
    validateOnBlur: true,
    initialValues: {
      origin: "",
      daterange: "",
      group: "",
      activity: "",
      budget: "",
      distance: "",
      touristy: "",
      specactivity: "",
    },
    onSubmit: sendPrompt,
    validate: (values) => {
      let errors: Partial<{
        origin: string
        daterange: string
        group: string
        activity: string
        budget: string
        distance: string
        touristy: string
        specactivity: string
      }> = {}
      if (!values.daterange || values.daterange[1] == null) {
        errors.daterange = "Daterange Required"
      }
      if (!values.distance) {
        errors.distance = "Distance Required"
      }
      if (!values.origin) {
        errors.origin = "Origin Required"
      }
      if (!values.group) {
        errors.group = "Group Required"
      }
      if (!values.activity || values.activity.length === 0) {
        errors.activity = "Activity Required"
      }
      if (!values.budget) {
        errors.budget = "Budget Required"
      }
      if (!values.touristy) {
        errors.touristy = "Touristy Required"
      }

      return errors
    },
  })

  const autoCompleteRef = useRef<google.maps.places.Autocomplete>()
  const inputRef = useRef<HTMLInputElement>(null)

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
          setOriginLatLng([place.geometry.location.lng(), place.geometry.location.lat()])
          if (place && place.address_components) {
            let places: string[] = []
            for (let i = 0; i < place.address_components.length; i++) {
              let comp = place.address_components[i]
              if (
                comp?.types &&
                places.length === 0 &&
                [
                  "locality",
                  "postal_town",
                  "administrative_area_level_1",
                  "administrative_area_level_2",
                ].some((code) => comp!.types.includes(code))
              ) {
                places.push(comp.long_name)
              } else if (
                comp?.types &&
                ["country", "continent"].some((code) => comp!.types.includes(code))
              ) {
                places.push(comp.long_name)
                await formik.setFieldValue("origin", places.join(", "))
                break
              }
            }
          }
        }
      })
    }
  }, [loaded])

  return (
    <Box className="tripform" w={{ base: "100%", sm: "80%" }}>
      <script src={script} onLoad={() => setLoaded(true)} />
      {!isLoading && (
        <form autoComplete="off" onSubmit={formik.handleSubmit}>
          <Flex color="white" flexDir={{ base: "column", sm: "row" }}>
            <VStack
              spacing="1rem"
              w={{ base: "100%", sm: "50%" }}
              mr={{ base: "0rem", sm: "1rem" }}
            >
              <FormControl>
                <FormLabel className="tripformlabel" htmlFor="From Where?">
                  From Where?
                </FormLabel>
                <InputGroup>
                  <InputLeftElement color="white" pointerEvents="none">
                    <FontAwesomeIcon icon={faLocationDot} height="20px" />
                  </InputLeftElement>
                  <Input
                    id="origin"
                    name="origin"
                    type="text"
                    placeholder="Enter your City"
                    value={formik.values.origin}
                    onChange={formik.handleChange}
                    ref={inputRef}
                  />
                </InputGroup>
                {formik.errors.destination ? (
                  <div className="errors">{formik.errors.destination as string}</div>
                ) : null}
              </FormControl>
              <FormControl>
                <FormLabel className="tripformlabel" htmlFor="When?">
                  When?
                </FormLabel>
                <MyDateRangePicker
                  onChange={async (update) => {
                    setDateRange(update)
                    await formik.setFieldValue("daterange", update)
                  }}
                  startDate={startDate}
                  endDate={endDate}
                />
                {formik.errors.daterange ? (
                  <div className="errors">{formik.errors.daterange as string}</div>
                ) : null}
              </FormControl>

              <FormControl>
                <FormLabel className="tripformlabel" htmlFor="How far?">
                  How far?
                </FormLabel>
                <Select
                  id="distance"
                  name="distance"
                  onChange={(e) => formik.setFieldValue("distance", e)}
                  value={formik.values.distance}
                  placeholder="e.g. Nearby Adventure"
                  options={distanceOptions}
                />
                {formik.errors.distance ? (
                  <div className="errors">{formik.errors.distance as string}</div>
                ) : null}
              </FormControl>

              <FormControl>
                <FormLabel className="tripformlabel" htmlFor="Who?">
                  Who?
                </FormLabel>
                <Select
                  id="group"
                  name="group"
                  onChange={(e) => formik.setFieldValue("group", e)}
                  value={formik.values.group}
                  placeholder="e.g. Friends, Family"
                  options={groupOptions}
                />
                {formik.errors.group ? (
                  <div className="errors">{formik.errors.group as string}</div>
                ) : null}
              </FormControl>
            </VStack>
            <VStack
              spacing="1rem"
              w={{ base: "100%", sm: "50%" }}
              ml={{ base: "0rem", sm: "1rem" }}
              mt={{ base: "1rem", sm: "0rem" }}
            >
              <FormControl>
                <FormLabel className="tripformlabel" htmlFor="What?">
                  What?
                </FormLabel>
                <Select
                  classNamePrefix="react-select"
                  id="activity"
                  name="activity"
                  onChange={(e) => formik.setFieldValue("activity", e)}
                  value={formik.values.activity}
                  placeholder="e.g. Relax, Adventure"
                  options={styleOptions}
                  isMulti
                  closeMenuOnSelect={false}
                />

                {formik.errors.activity ? (
                  <div className="errors">{formik.errors.activity as string}</div>
                ) : null}
              </FormControl>

              <FormControl>
                <FormLabel className="tripformlabel" htmlFor="What Exactly?">
                  What Exactly?
                </FormLabel>
                <Input
                  id="specactivity"
                  name="specactivity"
                  onChange={formik.handleChange}
                  value={formik.values.specactivity}
                  placeholder="e.g. Snorkel, Horse Ride"
                />
              </FormControl>

              <FormControl>
                <FormLabel className="tripformlabel" htmlFor="How much?">
                  How much?
                </FormLabel>
                <Select
                  id="budget"
                  name="budget"
                  onChange={(e) => formik.setFieldValue("budget", e)}
                  value={formik.values.budget}
                  placeholder="e.g. Luxury"
                  options={budgetOptions}
                />

                {formik.errors.budget ? (
                  <div className="errors">{formik.errors.budget as string}</div>
                ) : null}
              </FormControl>

              <FormControl>
                <FormLabel className="tripformlabel" htmlFor="Touristy?">
                  Touristy?
                </FormLabel>
                <Select
                  id="touristy"
                  name="touristy"
                  onChange={(e) => formik.setFieldValue("touristy", e)}
                  value={formik.values.touristy}
                  placeholder="e.g. Hidden Gem"
                  options={touristyOptions}
                />

                {formik.errors.touristy ? (
                  <div className="errors">{formik.errors.touristy as string}</div>
                ) : null}
              </FormControl>
            </VStack>
          </Flex>

          <Button type="submit" variant="primary" mt="1rem" width="full">
            Find Destinations!
          </Button>
        </form>
      )}
      {isLoading && (
        <Box>
          <Lottie
            animationData={loading_animation}
            style={{
              height: "200px",
              width: "100%",
              position: "relative",
            }}
            loop={true}
            autoplay={true}
          />
          <Box textAlign="center" fontWeight="600" mt="-2rem" mb="2rem" color="white">
            <Text>Searching for the best destinations...</Text>
            <Text fontWeight="400" fontSize="14px">
              Takes around 20-40 seconds
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default DiscoverForm
