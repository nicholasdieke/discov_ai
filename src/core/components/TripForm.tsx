import { Routes } from "@blitzjs/next"
import { Box, Button, createListCollection, Input, Show, Text, VStack } from "@chakra-ui/react"
import { faLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import Lottie from "lottie-react"
import mixpanel from "mixpanel-browser"
import { useRouter } from "next/router"
import loading_animation from "public/plane_loading.json"
import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Field } from "src/components/ui/field"
import { InputGroup } from "src/components/ui/input-group"
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "src/components/ui/select"
import { z } from "zod"
import createTrip from "../mutations/createTrip"
import { TripFormValidation } from "../validations"
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

  const budgetOptions = createListCollection({
    items: [
      {
        label: "💰 On a budget",
        value: "budget",
      },
      {
        label: "💰💰 Sensibly priced",
        value: "sensibly-priced",
      },
      {
        label: "💰💰💰 Upscale",
        value: "upscale",
      },
      {
        label: "💰💰💰💰 Luxury",
        value: "luxury",
      },
    ],
  })
  const groupOptions = createListCollection({
    items: [
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
    ],
  })

  const styleOptions = createListCollection({
    items: [
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
    ],
  })

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  type TripFormValues = z.infer<typeof TripFormValidation>

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    control,
  } = useForm<TripFormValues>({
    resolver: zodResolver(TripFormValidation),
  })

  const onSubmit = handleSubmit(async () => {
    const values = getValues()
    scrollToTop()
    setIsLoading(true)
    const days = Math.max(dateDiffInDays(values.daterange[0], values.daterange[1]), 1)
    let prompt =
      "Create a personalised itinerary for a " +
      values.budget[0] +
      " " +
      values.group[0] +
      " trip to " +
      values.destination +
      " from  " +
      (values.daterange[0] as Date).toDateString() +
      " to " +
      (values.daterange[1] as Date).toDateString() +
      ", which includes " +
      values.activity.join(", ") +
      (values.extras ? ". Include this special request: " + values.extras : "") +
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

        const valuesWithItinerary = {
          ...values,
          group: values.group[0]!,
          activity: values.activity.join(", "),
          itinerary: response.result,
          budget: values.budget[0],
          imageUrl: imageUrl,
        }

        mixpanel.track("Created Trip", { destination: values.destination })
        await createTrip(valuesWithItinerary)
          .then((trip) => router.push(Routes.TripPage({ id: trip.id })))
          .catch((e) => console.log(e))
      })
      .catch((e) => console.log(e))
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
                setValue("destination", places.join(", "))
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
      <Show when={!isLoading}>
        <form onSubmit={onSubmit}>
          <VStack gap="0.75rem" color="white">
            <Field
              label="Where?"
              invalid={!!errors.destination}
              errorText={errors.destination?.message}
            >
              <InputGroup
                className="tripformInput"
                startElement={<FontAwesomeIcon icon={faLocationDot} height="20px" />}
              >
                <Input
                  id="destination"
                  type="text"
                  placeholder="City, State or Country"
                  maxLength={40}
                  variant="subtle"
                  {...register("destination", { required: "First name is required" })}
                  ref={inputRef}
                />
              </InputGroup>
            </Field>

            <Field
              zIndex={10}
              label="When?"
              invalid={!!errors.daterange}
              errorText={errors.daterange?.message}
            >
              <MyDateRangePicker
                onChange={async (update) => {
                  setDateRange(update)
                  setValue("daterange", update)
                }}
                startDate={startDate}
                endDate={endDate}
              />
            </Field>

            <Field label="Who?" invalid={!!errors.group} errorText={errors.group?.message}>
              <Controller
                control={control}
                name="group"
                render={({ field }) => (
                  <SelectRoot
                    name={field.name}
                    value={field.value}
                    onValueChange={({ value }) => field.onChange(value)}
                    onInteractOutside={() => field.onBlur()}
                    collection={groupOptions}
                    variant="subtle"
                  >
                    {/* @ts-ignore */}
                    <SelectTrigger>
                      {/* @ts-ignore */}
                      <SelectValueText placeholder="e.g. Friends, Family" />
                    </SelectTrigger>
                    {/* @ts-ignore */}
                    <SelectContent>
                      {groupOptions.items.map((group) => (
                        // @ts-ignore
                        <SelectItem item={group} key={group.value}>
                          {group.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                )}
              />
            </Field>

            <Field label="What?" invalid={!!errors.activity} errorText={errors.activity?.message}>
              <Controller
                control={control}
                name="activity"
                render={({ field }) => (
                  <SelectRoot
                    name={field.name}
                    value={field.value}
                    onValueChange={({ value }) => field.onChange(value)}
                    onInteractOutside={() => field.onBlur()}
                    collection={styleOptions}
                    variant="subtle"
                    multiple
                    closeOnSelect={false}
                  >
                    {/* @ts-ignore */}
                    <SelectTrigger>
                      {/* @ts-ignore */}
                      <SelectValueText placeholder="e.g. Relax, Adventure" />
                    </SelectTrigger>
                    {/* @ts-ignore */}
                    <SelectContent>
                      {styleOptions.items.map((style) => (
                        // @ts-ignore
                        <SelectItem item={style} key={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                )}
              />
            </Field>

            <Field label="How much?" invalid={!!errors.budget} errorText={errors.budget?.message}>
              <Controller
                control={control}
                name="budget"
                render={({ field }) => (
                  <SelectRoot
                    name={field.name}
                    value={field.value}
                    onValueChange={({ value }) => field.onChange(value)}
                    onInteractOutside={() => field.onBlur()}
                    collection={budgetOptions}
                    variant="subtle"
                  >
                    {/* @ts-ignore */}
                    <SelectTrigger>
                      {/* @ts-ignore */}
                      <SelectValueText placeholder="e.g. Luxury" />
                    </SelectTrigger>
                    {/* @ts-ignore */}
                    <SelectContent>
                      {budgetOptions.items.map((budget) => (
                        // @ts-ignore
                        <SelectItem item={budget} key={budget.value}>
                          {budget.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                )}
              />
            </Field>

            <Field
              label="Special Request?"
              invalid={!!errors.extras}
              errorText={errors.extras?.message}
            >
              <Input
                id="extras"
                type="text"
                placeholder="e.g. Pet friendly or best tacos"
                className="tripformInput"
                maxLength={40}
                variant="subtle"
                {...register("extras")}
              />
            </Field>
          </VStack>

          <Button type="submit" onClick={() => onSubmit()} mt="1rem" width="full">
            Build Itinerary
          </Button>
        </form>
      </Show>
      <Show when={isLoading}>
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
      </Show>
    </Box>
  )
}

export default TripForm
