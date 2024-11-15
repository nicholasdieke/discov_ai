"use client"
import { Divider, HStack, Text } from "@chakra-ui/react"

export function OrDivider() {
  return (
    <HStack width="100%" mb="1rem">
      <Divider />
      <Text color="whiteAlpha.600" flexShrink="0">
        or
      </Text>
      <Divider />
    </HStack>
  )
}
