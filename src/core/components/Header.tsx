import { Routes } from "@blitzjs/next"
import { Flex, HStack, Text } from "@chakra-ui/react"
import mixpanel from 'mixpanel-browser'
import { useRouter } from "next/router"

function Header({ theme }) {
  const router = useRouter()

  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN); 

  return (
    <Flex
      justifyContent="space-between"
      pb={{ base: "0.5rem", md: "1.5rem" }}
      pt="1.5rem"
      alignItems="center"
      color={theme}
    >
      <Text onClick={() => { mixpanel.track("Clicked Logo"); router.push(Routes.Home());}} className="logo-text">
        DiscovAI
      </Text>
      <HStack spacing="1rem">
        {/* <Button variant="outline">Log In</Button>
        <Button variant="outline">Sign Up</Button> */}
      </HStack>
    </Flex>
  )
}

export default Header
