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
// import Select from "react-select"

import { Routes } from "@blitzjs/next"
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

  const budgetOptions = [
    {
      label: "🪙 Basic",
      value: "cheap",
    },
    {
      label: "💸 Comfortable",
      value: "",
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

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const sendPrompt = async (values) => {
    
    setIsLoading(true)
    const days = Math.max(dateDiffInDays(values.daterange[0], values.daterange[1]), 1)
    let prompt =
      "Create a personalised itinerary for a " +
      values.budget.value +
      " " +
      values.activity.map((obj) => obj.value).join(", ") +
      " " +
      values.group.value +
      " trip to " +
      values.destination +
      " from  "+(values.daterange[0] as Date).toDateString()+" to "+(values.daterange[1] as Date).toDateString() +
      ". Write in an engaging, descriptive style with a friendly tone and correct grammar. "

      if (days < 10) {
        prompt =
          prompt +
          "Please ensure each day's itinerary has a header that says, 'Day X:', where X is the number of the day. Split each day into Morning, Afternoon and Evening."
      } else {
        prompt =
          prompt +
          "Please format each day's itinerary with a header that says, for example, 'Day X:', where X is the number of the day or 'Day X-Y:'."
      }

      prompt = prompt + "Do not include the word 'Day', capitalised like this anywhere in the itinerary because it messes up my formatting. Do not include the date in the header. The only allowed instance of the word 'Day' is in the header. Follow these instructions exactly."

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
          group: values.group.label,
          activity: values.activity.map((obj) => obj.value).join(", "),
          itinerary: response.result,
          budget: values.budget.label,
        }
        await createTrip(values)
          .then((trip) => router.push(Routes.TripPage({ id: trip.id })))
          .catch((e) => console.log(e))
      })
      .catch((e) => console.log(e))
  }

  // Handling the form
  const formik = useFormik({
    validateOnChange: false,
    validateOnBlur: true,
    initialValues: {
      destination: "",
      daterange: "",
      group: "",
      activity: "",
      budget: "",
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
    process.env.GOOGLE_MAPS_API_KEY +
    "&libraries=places"

  return (
    <Box className="tripform" w={{ base: "100%", sm: "350px" }}>
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
                  <FontAwesomeIcon icon={faLocationDot} />
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
              />

              {formik.errors.budget ? (
                <div className="errors">{formik.errors.budget as string}</div>
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
          <Box textAlign="center" fontWeight="600" mt="-2rem" mb="2rem" color="white">
            <Text>Building Your Itinerary...</Text>
            <Text fontWeight="400" fontSize="14px">
              Takes around 20-40 seconds
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default TripForm
