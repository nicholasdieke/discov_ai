import { Tag } from "@/components/ui/tag"
import { Routes } from "@blitzjs/next"
import { Card, Heading, HStack, Image, Stack, Text } from "@chakra-ui/react"
import { useRouter } from "next/router"

function TripCard({ trip }) {
  const router = useRouter()
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }
  return (
    <Card.Root
      backgroundColor="#ffffff21"
      color="white"
      cursor="pointer"
      maxW="xs"
      onClick={() => router.push(Routes.TripPage({ id: trip.id }))}
    >
      <Card.Body>
        <Image src={trip.imageUrl} alt={trip.destination + " photo"} borderRadius="lg" />
        <Stack mt="6" gap="3">
          <Heading size="md">{trip.destination}</Heading>
          <Text>
            {trip.daterange[0]?.toLocaleDateString("en-US", dateOptions)} -{" "}
            {trip.daterange[1]?.toLocaleDateString("en-US", dateOptions)}
          </Text>
          <HStack gap={2}>
            <Tag whiteSpace="nowrap">{trip.group}</Tag>
            <Tag whiteSpace="nowrap">{trip.budget}</Tag>
          </HStack>
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}

export default TripCard
