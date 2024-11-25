"use client"
import { Routes } from "@blitzjs/next"
import { invoke } from "@blitzjs/rpc"
import { Box, Flex, Group, Heading, HStack, Show, Spinner, Stack, Text } from "@chakra-ui/react"
import { Trip } from "db"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { LuLuggage } from "react-icons/lu"
import { Button } from "src/components/ui/button"
import { EmptyState } from "src/components/ui/empty-state"
import Header from "src/core/components/Header"
import TripCard from "src/core/components/TripCard"
import getTripsByUser from "src/core/queries/getTripsByUser"

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[] | undefined | null>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    invoke(getTripsByUser, null)
      .then((tripsResult) => {
        setTrips(tripsResult)
        setLoading(false)
      })
      .catch((e) => console.log(e))
  }, [])

  return (
    <Box backgroundColor="#1a1c21" h="100%" minH="100vh" color="white">
      <Box h="100%" minH="100vh" px={{ base: "2rem", lg: "7.5rem" }}>
        <Header />
        <Flex alignItems="start" justifyContent="start" w="100%" h="100%" flexDir="column">
          <Heading color="white" size="xl" textAlign="center" mb="1rem">
            My Trips
          </Heading>
          <HStack w="full">
            <Show when={(!trips || !trips.length) && !loading}>
              <EmptyState
                size="lg"
                icon={<LuLuggage />}
                title="Start adding trips"
                description="You have not created any trips yet."
              >
                <Group>
                  <Button onClick={() => router.push(Routes.Home())}>Create Trip</Button>
                </Group>
              </EmptyState>
            </Show>
            <Show when={!!trips && trips.length && !loading}>
              <Stack gap={5} direction="row" wrap="wrap" w="full" mb="3rem">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </Stack>
            </Show>
            <Show when={loading}>
              <Flex alignItems="center" justifyContent="center" w="100%" mt="3rem" flexDir="column">
                <Spinner size="xl" />
                <Text mt="2rem">Loading Trips...</Text>
              </Flex>
            </Show>
          </HStack>
        </Flex>
      </Box>
    </Box>
  )
}

MyTripsPage.authenticate = { redirectTo: Routes.LoginPage() }
