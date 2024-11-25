"use client"
import { HStack, Separator, Text } from "@chakra-ui/react"

export function OrDivider() {
  return (
    <HStack width="100%" mb="1rem">
      <Separator />
      <Text color="whiteAlpha.600" flexShrink="0">
        or
      </Text>
      <Separator />
    </HStack>
  )
}
