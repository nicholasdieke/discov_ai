import { Routes } from "@blitzjs/next"
import { Card, CardBody, Heading, HStack, Image, Stack, Tag, Text } from "@chakra-ui/react"
import { useRouter } from "next/router"

function TripCard({ trip }) {
  const router = useRouter()
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }
  return (
    <Card
      backgroundColor="#ffffff21"
      color="white"
      cursor="pointer"
      maxW="xs"
      onClick={() => router.push(Routes.TripPage({ id: trip.id }))}
    >
      <CardBody>
        <Image src={trip.imageUrl} alt={trip.destination + " photo"} borderRadius="lg" />
        <Stack mt="6" spacing="3">
          <Heading size="md">{trip.destination}</Heading>
          <Text>
            {trip.daterange[0]?.toLocaleDateString("en-US", dateOptions)} -{" "}
            {trip.daterange[1]?.toLocaleDateString("en-US", dateOptions)}
          </Text>
          <HStack spacing={2}>
            <Tag whiteSpace="nowrap">{trip.group}</Tag>
            <Tag whiteSpace="nowrap">{trip.budget}</Tag>
          </HStack>
        </Stack>
      </CardBody>
      {/*<Divider />
       <CardFooter>
        <ButtonGroup spacing="2">
          <Button variant="solid" colorScheme="blue">
            Buy now
          </Button>
          <Button variant="ghost" colorScheme="blue">
            Add to cart
          </Button>
        </ButtonGroup>
      </CardFooter> */}
    </Card>
  )
}

export default TripCard
