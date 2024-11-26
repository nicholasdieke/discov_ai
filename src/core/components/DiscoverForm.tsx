import {
  Box,
  Button,
  createListCollection,
  Flex,
  Input,
  Show,
  Text,
  VStack,
} from "@chakra-ui/react"

import { faLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import Lottie from "lottie-react"
import mixpanel from "mixpanel-browser"
import { useRouter } from "next/router"
import loading_animation from "public/destinations-lottie.json"
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
import { DiscoverFormValidation } from "../validations"
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

  const distanceOptions = createListCollection({
    items: [
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
    ],
  })

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

  const touristyOptions = createListCollection({
    items: [
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
    ],
  })

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

  const script =
    "https://maps.googleapis.com/maps/api/js?key=" +
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY +
    "&libraries=places"

  type DiscoverFormValues = z.infer<typeof DiscoverFormValidation>

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    control,
  } = useForm<DiscoverFormValues>({
    resolver: zodResolver(DiscoverFormValidation),
  })

  const onSubmit = handleSubmit(async () => {
    const values = getValues()
    setIsLoading(true)
    let prompt = `I am planning a ${
      values.group[0]
    } trip and would like some recommendations. I will be traveling from ${(
      values.daterange[0] as Date
    ).toDateString()} to ${(values.daterange[1] as Date).toDateString()} and have a ${
      values.budget[0]
    } budget. I want a ${values.activity.map((obj) => obj).join(", ")} trip ${
      values.specactivity === "" ? "" : ", where I can " + values.specactivity
    }. I'm based in ${values.origin} and prefer destinations that are ${
      values.distance[0]
    } and considered a ${
      values.touristy[0]
    }. Can you recommend five destinations and activities for me to consider. Provide them in JSON format with the following keys: destination, description (4-6 sentences) and lng_lat_coordinates (formatted like 44.8681, 13.8481). Here is an example of the correct format: { “destinations”: [{"destination": "destination"}, {"description": “description”},{“lng_lat_coordinates”: “44.1, 0.4”}, …]}. Do not include triple backticks and the word json.`

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
        loadImages(response.destinations).catch((e) => console.log(e))
        mixpanel.track("Searched for Destinations", values)
      })
      .catch((e) => console.log(e))
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
          if (place.geometry && place.geometry.location) {
            setOriginLatLng([place.geometry.location.lng(), place.geometry.location.lat()])
          } else {
            setOriginLatLng([51.5074, -0.1278])
          }
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
                setValue("origin", places.join(", "))
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
      <Show when={!isLoading}>
        <form onSubmit={onSubmit}>
          <Flex color="white" flexDir={{ base: "column", sm: "row" }}>
            <VStack gap="1rem" w={{ base: "100%", sm: "50%" }} mr={{ base: "0rem", sm: "1rem" }}>
              <Field
                label="From Where?"
                invalid={!!errors.origin}
                errorText={errors.origin?.message}
              >
                <InputGroup
                  className="tripformInput"
                  startElement={<FontAwesomeIcon icon={faLocationDot} height="20px" />}
                >
                  <Input
                    id="origin"
                    type="text"
                    placeholder="Enter your City"
                    variant="subtle"
                    {...register("origin", { required: "First name is required" })}
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

              <Field
                label="How far?"
                invalid={!!errors.distance}
                errorText={errors.distance?.message}
              >
                <Controller
                  control={control}
                  name="distance"
                  render={({ field }) => (
                    <SelectRoot
                      name={field.name}
                      value={field.value}
                      onInteractOutside={() => field.onBlur()}
                      collection={distanceOptions}
                      variant="subtle"
                    >
                      {/* @ts-ignore */}
                      <SelectTrigger>
                        {/* @ts-ignore */}
                        <SelectValueText placeholder="e.g. Nearby Adventure" />
                      </SelectTrigger>
                      {/* @ts-ignore */}
                      <SelectContent>
                        {distanceOptions.items.map((distance) => (
                          // @ts-ignore
                          <SelectItem item={distance} key={distance.value}>
                            {distance.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  )}
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
            </VStack>
            <VStack
              gap="1rem"
              w={{ base: "100%", sm: "50%" }}
              ml={{ base: "0rem", sm: "1rem" }}
              mt={{ base: "1rem", sm: "0rem" }}
            >
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

              <Field
                label="What exactly?"
                invalid={!!errors.specactivity}
                errorText={errors.specactivity?.message}
              >
                <Input
                  className="tripformInput"
                  id="specactivity"
                  placeholder="e.g. Snorkel, Horse Ride"
                  variant="subtle"
                  {...register("specactivity")}
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
                label="Touristy?"
                invalid={!!errors.touristy}
                errorText={errors.touristy?.message}
              >
                <Controller
                  control={control}
                  name="touristy"
                  render={({ field }) => (
                    <SelectRoot
                      name={field.name}
                      value={field.value}
                      onInteractOutside={() => field.onBlur()}
                      collection={touristyOptions}
                      variant="subtle"
                    >
                      {/* @ts-ignore */}
                      <SelectTrigger>
                        {/* @ts-ignore */}
                        <SelectValueText placeholder="e.g. Hidden Gem" />
                      </SelectTrigger>
                      {/* @ts-ignore */}
                      <SelectContent>
                        {touristyOptions.items.map((touristy) => (
                          // @ts-ignore
                          <SelectItem item={touristy} key={touristy.value}>
                            {touristy.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  )}
                />
              </Field>
            </VStack>
          </Flex>

          <Button type="submit" onClick={() => onSubmit()} mt="1rem" width="full">
            Find Destinations
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
            <Text>Searching for the best destinations...</Text>
            <Text fontWeight="400" fontSize="14px">
              This can take up to a minute
            </Text>
          </Box>
        </Box>
      </Show>
    </Box>
  )
}

export default DiscoverForm
