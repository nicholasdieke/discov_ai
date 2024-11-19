"use client"
import { Routes } from "@blitzjs/next"
import { invoke } from "@blitzjs/rpc"
import { Box, Button, Flex, Heading, HStack, SimpleGrid } from "@chakra-ui/react"
import { Trip } from "db"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Header from "src/core/components/Header"
import TripCard from "src/core/components/TripCard"
import getTripsByUser from "src/core/queries/getTripsByUser"

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[] | undefined | null>([])
  const router = useRouter()

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
            {!trips || !!trips.length ? (
              <Flex
                alignItems={"center"}
                justifyContent="center"
                mt={{ base: "1rem", md: "6rem" }}
                w="100%"
                flexDir="column"
              >
                <Heading color="white" size="lg" textAlign="center" mt="5rem" mb="1rem">
                  No trips yet.
                </Heading>
                <Button
                  variant="primary"
                  mt="1rem"
                  width="200px"
                  onClick={() => router.push(Routes.Home())}
                >
                  Create my first trip!
                </Button>
              </Flex>
            ) : (
              <SimpleGrid spacing={5} columns={{ base: 1, sm: 2, md: 3, xl: 4 }} w="full" mb="3rem">
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
