import { Button, Flex, HStack, Text } from "@chakra-ui/react"

function Header() {
  return (
    <Flex justifyContent="space-between" m="1rem" px="2rem" py="0.5rem" alignItems="center">
      <Text fontWeight="800" fontSize="20px">
        DiscovAI
      </Text>
      <HStack spacing="1rem">
        <Button variant="outline">Log In</Button>
        <Button variant="outline">Sign Up</Button>
      </HStack>
    </Flex>
  )
}

export default Header
