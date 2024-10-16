import { Routes } from "@blitzjs/next"
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
} from "@chakra-ui/react"
import { faLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Select } from "chakra-react-select"
import { useFormik } from "formik"
import Lottie from "lottie-react"
import mixpanel from "mixpanel-browser"
import { useRouter } from "next/router"
import loading_animation from "public/plane_loading.json"
import { useEffect, useRef, useState } from "react"
import createTrip from "../mutations/createTrip"
import MyDateRangePicker from "./MyDateRangePicker"

function TripForm() {
  const autoCompleteRef = useRef<google.maps.places.Autocomplete>()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)

  const [dateRange, setDateRange] = useState([null, null])
  const [isLoading, setIsLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [startDate, endDate] = dateRange

  const dateDiffInDays = (a, b) => {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())

    return Math.floor((utc2 - utc1) / _MS_PER_DAY)
  }

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
      label: "🎭 Culture",
      value: "cultural",
    },
    {
      label: "🍜 Foodie",
      value: "foodie",
    },
    {
      label: "🏺 History",
      value: "historic",
    },
    {
      label: "🍾 Party",
      value: "party",
    },
    {
      label: "🛍️ Shopping",
      value: "shopping",
    },
    {
      label: "🌊 Relax",
      value: "relaxing",
    },
    {
      label: "🌹 Romance",
      value: "romantic",
    },
  ]

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const sendPrompt = async (values) => {
    scrollToTop()
    setIsLoading(true)
    const days = Math.max(dateDiffInDays(values.daterange[0], values.daterange[1]), 1)
    let prompt =
      "Create a personalised itinerary for a " +
      values.budget.value +
      " " +
      values.group.value +
      " trip to " +
      values.destination +
      " from  " +
      (values.daterange[0] as Date).toDateString() +
      " to " +
      (values.daterange[1] as Date).toDateString() +
      ", which includes " +
      values.activity.map((obj) => obj.value).join(", ") +
      (values.extras.value ? ". Include this special request: " + values.extras.value : "") +
      ". Write in an engaging and detailed style with a friendly tone and correct grammar. "

    if (days > 7) {
      prompt =
        prompt +
        "Since this is a longer trip, please group some of the days. Include specific place recommendations. "
    } else {
      prompt = prompt + "Include specific place recommendations for each day. "
    }

    const structurePart = `
    Please provide an itinerary in a valid JSON format. The structure should be as follows:

    {
      "itinerary": [
        {
          "day": "",
          "plan": "",
          "lat_lngs": {
            "place_name": {
              "lng": <lng>,
              "lat": <lat>,
              "category": "<category>"
            }
          }
        }
      ]
    }

    - The \`plan\` should contain a few sentences describing the day's activities.
    - The \`lat_lngs\` should include the coordinates and categories of each place mentioned in the \`plan\`, formatted as a dictionary.
    - Each place should follow this format: {lng: <lng>, lat: <lat>, category: <category>}.
    - The \`category\` can be one of the following: Bar, Beach, Building, Cafe, Conservation, Entertainment, Historic site, Hotel, Museum, Park, Religious site, Restaurant, Shopping, Town, Winery, or Other.
    - Ensure that the \`itinerary\` is an array, with each day represented as an object within this array. Follow these instructions precisely!
    `
    prompt = prompt + structurePart

    await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prompt),
    })
      .then((response) => response.json())
      .then(async (response) => {
        var imageUrl = undefined

        await fetch("/api/getDestPhoto?destination=" + values.destination)
          .then((response) => response.json())
          .then((response) => (imageUrl = response.result[0].urls.regular || ""))
          .catch((e) => console.log(e))

        values = {
          ...values,
          group: values.group.label,
          activity: values.activity.map((obj) => obj.value).join(", "),
          itinerary: response.result,
          budget: values.budget.label,
          imageUrl: imageUrl,
        }

        mixpanel.track("Created Trip", { destination: values.destination })
        await createTrip(values)
          .then((trip) => router.push(Routes.TripPage({ id: trip.id })))
          .catch((e) => console.log(e))
      })
      .catch((e) => console.log(e))
  }

  const formik = useFormik({
    validateOnChange: false,
    validateOnBlur: true,
    initialValues: {
      destination: "",
      daterange: "",
      group: "",
      activity: "",
      budget: "",
      extras: "",
    },
    onSubmit: sendPrompt,
    validate: (values) => {
      let errors: Partial<{
        destination: string
        daterange: string
        group: string
        activity: string
        budget: string
      }> = {}
      if (!values.destination) {
        errors.destination = "Destination Required"
      }
      if (!values.daterange || values.daterange[1] == null) {
        errors.daterange = "Daterange Required"
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
      return errors
    },
  })

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
                await formik.setFieldValue("destination", places.join(", "))
                break
              }
            }
          }
        }
      })
    }
  }, [loaded])

  const script =
    "https://maps.googleapis.com/maps/api/js?key=" +
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY +
    "&libraries=places"

  return (
    <Box className="tripform" w={{ base: "100%", sm: "350px" }}>
      <script src={script} onLoad={() => setLoaded(true)} />

      {!isLoading && (
        <form autoComplete="off" onSubmit={formik.handleSubmit}>
          <VStack spacing="0.75rem" color="white">
            <FormControl>
              <FormLabel className="tripformlabel" htmlFor="Where?">
                Where?
              </FormLabel>
              <InputGroup>
                <InputLeftElement color="white" pointerEvents="none">
                  <FontAwesomeIcon icon={faLocationDot} height="20px" />
                </InputLeftElement>
                <Input
                  id="destination"
                  name="destination"
                  type="text"
                  placeholder="City, State or Country"
                  value={formik.values.destination}
                  onChange={formik.handleChange}
                  ref={inputRef}
                  className="tripformInput"
                  maxLength={40}
                />
              </InputGroup>
              {formik.errors.destination ? (
                <div className="errors">{formik.errors.destination as string}</div>
              ) : null}
            </FormControl>

            <FormControl zIndex={10}>
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
                hideSelectedOptions
                className="tripformInput"
              />
              {formik.errors.group ? (
                <div className="errors">{formik.errors.group as string}</div>
              ) : null}
            </FormControl>

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
                className="tripformInput"
              />

              {formik.errors.activity ? (
                <div className="errors">{formik.errors.activity as string}</div>
              ) : null}
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
                hideSelectedOptions
                className="tripformInput"
              />

              {formik.errors.budget ? (
                <div className="errors">{formik.errors.budget as string}</div>
              ) : null}
            </FormControl>

            <FormControl>
              <FormLabel className="tripformlabel" htmlFor="Special Request?">
                Special Request?
              </FormLabel>
              <Input
                id="extras"
                name="extras"
                type="text"
                placeholder="e.g. Pet friendly or best tacos"
                value={formik.values.extras}
                onChange={formik.handleChange}
                className="tripformInput"
                maxLength={40}
              />
            </FormControl>
          </VStack>

          <Button type="submit" variant="primary" mt="1rem" width="full">
            Build Itinerary!
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
            <Text>Building Your Itinerary...</Text>
            <Text fontWeight="400" fontSize="14px">
              This can take up to a minute
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default TripForm
