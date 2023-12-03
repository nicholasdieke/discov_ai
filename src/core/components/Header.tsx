import { Routes } from "@blitzjs/next"
import { Button, Flex, HStack, Text } from "@chakra-ui/react"
import mixpanel from "mixpanel-browser"
import { useRouter } from "next/router"
import { useMediaQuery } from "react-responsive"

function Header({ theme }) {
  const router = useRouter()
  const currentRoute = router.pathname
  const isMobile = useMediaQuery({ maxWidth: 767 })

  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)

  return (
    <Flex
      justifyContent="space-between"
      pb={{ base: "0.5rem", md: "1.5rem" }}
      pt="1.5rem"
      alignItems="center"
      color={theme}
    >
      <Text
        onClick={() => {
          mixpanel.track("Clicked Logo")
          router.push(Routes.Home()).catch((e) => console.log(e))
        }}
        className="logo-text"
      >
        DiscovAI
      </Text>
      <HStack spacing="0.5rem">
        <Button
          size="md"
          variant=""
          onClick={() => router.push(Routes.Home())}
          opacity={currentRoute === Routes.Home().pathname ? 1 : 0.65}
          hidden={isMobile && currentRoute === Routes.Home().pathname}
          className="menuItems"
        >
          Itineraries
        </Button>
        <Button
          size="md"
          variant=""
          onClick={() => router.push(Routes.DestinationPage())}
          opacity={currentRoute === Routes.DestinationPage().pathname ? 1 : 0.65}
          hidden={isMobile && currentRoute === Routes.DestinationPage().pathname}
          className="menuItems"
        >
          Destinations
        </Button>
        {/* <Button variant="outline">Log In</Button>
        <Button variant="outline">Sign Up</Button> */}
      </HStack>
    </Flex>
  )
}

export default Header
