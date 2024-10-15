"use client"
import { Routes } from "@blitzjs/next"
import { invoke } from "@blitzjs/rpc"
import { Box, Flex, Heading, HStack, SimpleGrid } from "@chakra-ui/react"
import { Trip } from "db"
import { useEffect, useState } from "react"
import Header from "src/core/components/Header"
import TripCard from "src/core/components/TripCard"
import getTripsByUser from "src/core/queries/getTripsByUser"

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[] | undefined | null>(undefined)

  useEffect(() => {
    invoke(getTripsByUser, null)
      .then((tripsResult) => setTrips(tripsResult))
      .catch((e) => console.log(e))
  }, [])

  return (
    <Box backgroundColor="#1a1c21" h="100%" minH="100vh" color="white">
      <Box h="100%" minH="100vh" px={{ base: "2rem", lg: "7.5rem" }}>
        <Header />
        <Flex alignItems="start" justifyContent="start" w="100%" h="100%" flexDir="column">
          <Heading color="white" size="lg" textAlign="center" mb="1rem">
            My Trips
          </Heading>
          <HStack w="full">
            {!trips && <>No Trips</>}
            {!!trips && (
              <SimpleGrid spacing={4} w="full" minChildWidth="250px" mb="3rem">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </SimpleGrid>
            )}
          </HStack>
        </Flex>
      </Box>
    </Box>
  )
}

MyTripsPage.authenticate = { redirectTo: Routes.LoginPage() }
