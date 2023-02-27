import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import Link from "next/link"
import { useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import logout from "src/auth/mutations/logout"
import Header from "src/core/components/Header"
import TripForm from "src/core/components/TripForm"
import styles from "src/styles/Home.module.css"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"

/*
 * This file is just for a pleasant getting started page for your new app.
 * You can delete everything in here and start from scratch if you like.
 */

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
  const [prompt, setPrompt] = useState("")
  const [generatedText, setGeneratedText] = useState("")

  const sendPrompt = async (event) => {
    event.preventDefault()
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    })
    const data = await response.json()
    console.log(data)
    setGeneratedText(data.result)
  }
  return (
    // <div>
    //   <form onSubmit={sendPrompt}>
    //     <label htmlFor="prompt">Prompt:</label>
    //     <input
    //       id="prompt"
    //       type="text"
    //       value={prompt}
    //       onChange={(event) => setPrompt(event.target.value)}
    //     />
    //     <button type="submit">Generate</button>
    //   </form>
    //   {generatedText && (
    //     <div>
    //       <h2>Generated text:</h2>
    //       <p>{generatedText}</p>
    //     </div>
    //   )}
    // </div>

    //   <Suspense fallback="Loading...">
    //     <UserInfo />
    //   </Suspense>

    <Box className="App">
      <Header />
      {/* className={theme}  */}
      <Box px={{ base: "2rem", lg: "7.5rem" }} py={{ base: "1rem", lg: "2rem" }}>
        <Flex
          alignItems={"center"}
          my="3rem"
          h="100%"
          w="100%"
          flexDir={{ base: "column", md: "row" }}
        >
          <VStack
            w={{ base: "100%", lg: "50%" }}
            mb={{ base: "1rem", lg: "0rem" }}
            alignItems={"start"}
          >
            <Heading
              fontSize={{ base: "40px", lg: "70px" }}
              textAlign={"start"}
              pb={"0.5rem"}
              fontWeight="700"
              className="moveright2"
            >
              Your Dream Vacation.
              <br /> In Seconds.
            </Heading>

            <Text textAlign={"start"} fontSize={{ base: "14px", lg: "18px" }} pb={"1rem"}>
              Planning sucks. Get a personalised day-by-day itinerary for how you travel.
            </Text>
          </VStack>
          <VStack w={{ base: "100%", lg: "50%" }} className="fadeUp">
            <TripForm />
          </VStack>
        </Flex>
      </Box>
    </Box>
  )
}

export default Home
