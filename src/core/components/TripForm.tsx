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
import { faCalendarDays, faLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Select } from "chakra-react-select"
import { useFormik } from "formik"

function TripForm() {
  //   const theme = useSelector((state) => state.theme)

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
      <form autoComplete="off" onSubmit={formik.handleSubmit}>
        <VStack spacing="0.5rem">
          <FormControl>
            <FormLabel htmlFor="Where?">Where?</FormLabel>

            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                children={<FontAwesomeIcon icon={faLocationDot} size="lg" />}
              />
              <Input
                id="destination"
                name="destination"
                type="text"
                placeholder="City, State or Country"
                variant="filled"
                onChange={formik.handleChange}
                value={formik.values.destination}
              />
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="When?">When?</FormLabel>
            <InputGroup>
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
            </InputGroup>
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
