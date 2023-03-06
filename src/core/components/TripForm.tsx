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
import { useRouter } from "next/router"
import loading_animation from "public/plane_loading.json"
import { useEffect, useRef, useState } from "react"
import createTrip from "../mutations/createTrip"
import MyDateRangePicker from "./MyDateRangePicker"

function TripForm() {
  const autoCompleteRef = useRef<google.maps.places.Autocomplete>()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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
      label: "🤪 Everything",
      value: "",
    },
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
      label: "🍜 Food",
      value: "food",
    },
  ]

  const sendPrompt = async (values) => {
    setIsLoading(true)
    const days = Math.max(dateDiffInDays(values.daterange[0], values.daterange[1]), 1)
    const prompt =
      "Create a personalised " +
      days +
      "-day itinerary for a " +
      values.activity.value +
      " " +
      values.group.value +
      " trip to " +
      values.destination +
      ".  Write in an engaging, descriptive style with a friendly tone and correct grammar. Split each day into Morning, Afternoon, Evening."

    await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prompt),
    })
      .then((response) => response.json())
      .then(async (response) => {
        values = {
          ...values,
          group: values.group.value,
          activity: values.activity.value,
          itinerary: response.result,
        }
        await createTrip(values)
          .then((trip) => router.push(Routes.TripPage({ id: trip.id })))
          .catch((e) => console.log(e))
      })
      .catch((e) => console.log(e))
  }

  const formik = useFormik({
    initialValues: {
      destination: "",
      daterange: "",
      group: {
        label: "👫 Friends",
        value: "friends",
      },
      activity: {
        label: "🤪 Everything",
        value: "",
      },
    },
    onSubmit: sendPrompt,
    validate: (values) => {
      let errors: Partial<{
        destination: string
        daterange: string
        group: string
        activity: string
      }> = {}
      if (!values.destination) {
        errors.destination = "Destination Required"
      }
      if (!values.daterange) {
        errors.daterange = "Daterange Required"
      }
      if (!values.group) {
        errors.group = "Group Required"
      }
      if (!values.activity) {
        errors.activity = "Activity Required"
      }
      return errors
    },
  })

  useEffect(() => {
    if (inputRef.current instanceof HTMLInputElement) {
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current)
      autoCompleteRef.current.addListener("place_changed", async function () {
        if (autoCompleteRef.current) {
          const place = autoCompleteRef.current.getPlace()
          if (place && place.address_components) {
            for (let i = 0; i < place.address_components.length; i++) {
              let comp = place.address_components[i]
              if (
                comp?.types &&
                [
                  "locality",
                  "postal_town",
                  "administrative_area_level_1",
                  "administrative_area_level_2",
                  "country",
                ].some((code) => comp!.types.includes(code))
              ) {
                await formik.setFieldValue("destination", comp.long_name)
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
    process.env.GOOGLE_MAPS_API_KEY +
    "&libraries=places"

  return (
    <Box className="reveal tripform">
      <script src={script} onLoad={() => setLoaded(true)}></script>
      {!isLoading && (
        <form autoComplete="off" onSubmit={formik.handleSubmit}>
          <VStack spacing="0.75rem" color="white">
            <FormControl>
              <FormLabel className="tripformlabel" htmlFor="Where?">
                Where?
              </FormLabel>
              <InputGroup>
                <InputLeftElement color="white" pointerEvents="none">
                  <FontAwesomeIcon icon={faLocationDot} size="1x" />
                </InputLeftElement>
                <Input
                  id="destination"
                  name="destination"
                  type="text"
                  placeholder="City, State or Country"
                  value={formik.values.destination}
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
              {formik.errors.destination ? (
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
                placeholder="e.g. Friends, Family, Couple"
                options={groupOptions}
              />
              {formik.errors.destination ? (
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
                placeholder="e.g. Relax, History, Adventure"
                options={styleOptions}
              />
              {formik.errors.destination ? (
                <div className="errors">{formik.errors.activity as string}</div>
              ) : null}
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
          <Text textAlign="center" fontWeight="600" mt="-2rem" mb="2rem" color="white">
            Building Your Itinerary...
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default TripForm
