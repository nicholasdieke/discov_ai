import { Routes } from "@blitzjs/next"
import { Button, Flex, HStack, Tag, Text } from "@chakra-ui/react"
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
      <HStack spacing="1rem">
        <Button
          size="md"
          variant=""
          onClick={() => router.push(Routes.Home())}
          opacity={currentRoute === Routes.Home().pathname ? 1 : 0.65}
          hidden={isMobile && currentRoute === Routes.Home().pathname}
        >
          Itineraries
        </Button>
        <Button
          size="md"
          variant=""
          onClick={() => router.push(Routes.DestinationPage())}
          opacity={currentRoute === Routes.DestinationPage().pathname ? 1 : 0.65}
          hidden={isMobile && currentRoute === Routes.DestinationPage().pathname}
        >
          Destinations
          <Tag ml="0.5rem" size="md" bgColor="#b26cee" color="white">
            New
          </Tag>
        </Button>
        {/* <Button variant="outline">Log In</Button>
        <Button variant="outline">Sign Up</Button> */}
      </HStack>
    </Flex>
  )
}

export default Header
