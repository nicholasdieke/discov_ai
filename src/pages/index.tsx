import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import logout from "src/auth/mutations/logout"
import Header from "src/core/components/Header"
import TripForm from "src/core/components/TripForm"
import styles from "src/styles/Home.module.css"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  if (currentUser) {
    return (
      <>
        <button
          className={styles.button}
          onClick={async () => {
            // await logoutMutation()
          }}
        >
          Logout
        </button>
        <div>
          User id: <code>{currentUser.id}</code>
          <br />
          User role: <code>{currentUser.role}</code>
        </div>
      </>
    )
  } else {
    return (
      <>
        <Link href={Routes.SignupPage()} className={styles.button}>
          <strong>Sign Up</strong>
        </Link>
        <Link href={Routes.LoginPage()} className={styles.loginButton}>
          <strong>Login</strong>
        </Link>
      </>
    )
  }
}

const Home: BlitzPage = () => {
  const [photoUrl, setPhotoUrl] = useState("")

  const getPhoto = () => {
    fetch("/api/getHomePhotos")
      .then((response) => response.json())
      .then((response) => {
        const random = Math.floor(Math.random() * 10)
        setPhotoUrl(response.result[random].urls.full || "")
      })
      .catch((e) => console.log(e))
  }

  useEffect(() => {
    getPhoto()
  }, [])

  return (
    <Box className="App" h="100%" minH="100vh" overflow="hidden">
      <Box bgImage={photoUrl} bgPos="top" bgRepeat="no-repeat" bgSize="cover" h="100%">
        <Box h="100%" minH="100vh" px={{ base: "2rem", lg: "7.5rem" }} bgColor="#00000087">
          <Header theme="white" />
          <Flex
            alignItems={"center"}
            mt={{ base: "1rem", md: "6rem" }}
            w="100%"
            flexDir={{ base: "column", md: "row" }}
          >
            <VStack
              w={{ base: "100%", md: "50%" }}
              mb={{ base: "1rem", md: "0rem" }}
              textAlign={{ base: "center", md: "start" }}
              alignItems={{ base: "center", md: "start" }}
              color="white"
              mt={{ base: "2rem", md: "0rem" }}
            >
              <Heading
                fontSize={{ base: "35px", md: "55px", lg: "60px", xl: "70px" }}
                textAlign={{ base: "center", md: "start" }}
                pb={"0.5rem"}
                px="0.5rem"
                fontWeight="700"
                className="moveright2"
              >
                Your Perfect Trip.
                <br /> In Seconds.
              </Heading>

              <Text
                textAlign={{ base: "center", md: "start" }}
                fontSize={{ base: "16px", md: "22px" }}
                pb={"1rem"}
              >
                Discover a world of travel possibilities with <br /> our AI-powered itinerary
                builder.
              </Text>
            </VStack>
            <VStack w={{ base: "100%", md: "50%" }} mb="5rem" p className="fadeUp">
              <TripForm />
            </VStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export default Home
