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
            await logoutMutation()
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

  const getPhoto = async () => {
    await fetch("/api/getHomePhotos")
      .then((response) => response.json())
      .then((response) => {
        const random = Math.floor(Math.random() * 10)
        setPhotoUrl(response.result[random].urls.full || "")
      })
      .catch((e) => console.log(e))
    // const data = await response.json()
    // const random = Math.floor(Math.random() * 10)
    // setPhotoUrl(data.result[random].urls.full || "")
  }

  useEffect(() => {
    getPhoto()
  }, [])

  return (
    <Box className="App" height="100vh" overflow="hidden">
      <Box bgImage={photoUrl} bgPos="top" bgRepeat="no-repeat" bgSize="cover" h="100%">
        <Box h="100%" px={{ base: "2rem", lg: "7.5rem" }} bgColor="#00000087">
          <Header theme="white" />
          <Flex alignItems={"center"} h="90%" w="100%" flexDir={{ base: "column", md: "row" }}>
            <VStack
              w={{ base: "100%", lg: "50%" }}
              mb={{ base: "1rem", lg: "0rem" }}
              alignItems={"start"}
              color="white"
            >
              <Heading
                fontSize={{ base: "40px", lg: "70px" }}
                textAlign={"start"}
                pb={"0.5rem"}
                px="0.5rem"
                fontWeight="700"
                className="moveright2"
              >
                Your Perfect Trip.
                <br /> In Seconds.
              </Heading>

              <Text textAlign={"start"} fontSize={{ base: "14px", lg: "22px" }} pb={"1rem"}>
                Discover a world of travel possibilities with <br /> our AI-powered itinerary
                builder.
              </Text>
            </VStack>
            <VStack w={{ base: "100%", lg: "50%" }} className="fadeUp">
              <TripForm />
            </VStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export default Home
