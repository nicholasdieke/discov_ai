import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from "@chakra-ui/react"
import { faLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Select } from "chakra-react-select"
import { useFormik } from "formik"
import { useEffect, useRef } from "react"
import MyDateRangePicker from "./MyDateRangePicker"

function TripForm() {
  const groupOptions = [
    {
      label: "Friends",
      value: "friends",
    },
    {
      label: "Family",
      value: "family",
    },
    {
      label: "Solo",
      value: "solo",
    },
    {
      label: "Couple",
      value: "couple",
    },
  ]

  const styleOptions = [
    {
      label: "Adventure",
      value: "adventure",
    },
    {
      label: "Romance",
      value: "romance",
    },
    {
      label: "History",
      value: "history",
    },
    {
      label: "Food",
      value: "food",
    },
  ]

  const formik = useFormik({
    initialValues: {
      destination: "",
      daterange: "",
      group: "",
      activity: "",
    },
    onSubmit: (values) => {
      console.log("form submit", values)
    },
    // validate: (values) => {
    //   let errors = {}
    //   if (!values.destination) {
    //     errors.destination = "Destination Rquired"
    //   }
    //   if (!values.daterange) {
    //     errors.daterange = "Daterange Rquired"
    //   }
    //   if (!values.group) {
    //     errors.group = "Group Rquired"
    //   }
    //   if (!values.activity) {
    //     errors.activity = "Activity Rquired"
    //   }
    //   return errors
    // },
  })

  const autoCompleteRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current)
    autoCompleteRef.current.addListener("place_changed", async function () {
      const place = await autoCompleteRef.current.getPlace()
      for (let i = 0; i < place.address_components.length; i++) {
        let comp = place.address_components[i]
        if (["locality", "postal_town", "country"].some((code) => comp.types.includes(code))) {
          formik.setFieldValue("destination", comp.long_name)
          break
        }
      }
    })
  }, [])

  const script =
    "https://maps.googleapis.com/maps/api/js?key=" +
    process.env.GOOGLE_MAPS_API_KEY +
    "&libraries=places"

  return (
    <Box
      bg="gray.200"
      w="350px"
      borderRadius="5px"
      className="reveal"
      p="1rem"
      whiteSpace="nowrap"
      alignItems="center"
    >
      <script src={script} async></script>
      <form autoComplete="off" onSubmit={formik.handleSubmit}>
        <VStack spacing="0.5rem">
          <FormControl>
            <FormLabel htmlFor="Where?">Where?</FormLabel>
            <InputGroup>
              <InputLeftElement
                color="gray.500"
                pointerEvents="none"
                children={<FontAwesomeIcon icon={faLocationDot} size="1x" />}
              />
              <Input
                id="destination"
                name="destination"
                type="text"
                placeholder="City, State or Country"
                variant="filled"
                value={formik.values.destination}
                onChange={formik.handleChange}
                ref={inputRef}
              />
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="When?">When?</FormLabel>
            {/* <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                children={<FontAwesomeIcon icon={faCalendarDays} size="lg" />}
              />
              <Input
                id="daterange"
                name="daterange"
                type="text"
                variant="filled"
                onChange={formik.handleChange}
                value={formik.values.daterange}
              />
            </InputGroup> */}
            <MyDateRangePicker />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="Who?">Who?</FormLabel>
            <Select
              id="group"
              name="group"
              variant="filled"
              onChange={formik.handleChange}
              value={formik.values.group}
              placeholder="e.g. Friends, Family, Couple"
              options={groupOptions}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="What?">What?</FormLabel>
            <Select
              id="activity"
              name="activity"
              variant="filled"
              onChange={formik.handleChange}
              value={formik.values.activity}
              placeholder="e.g. Relax, History, Adventure"
              options={styleOptions}
            />
          </FormControl>
        </VStack>

        {/* {formik.errors.destination ? (
          <div className="errors">{formik.errors.destination}</div>
        ) : null}
        <br /> */}

        <Button type="submit" mt="1rem" colorScheme="purple" width="full">
          Build Itinerary!
        </Button>
      </form>
    </Box>
  )
}

export default TripForm
