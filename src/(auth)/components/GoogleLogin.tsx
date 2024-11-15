"use client"
import { Button, Image } from "@chakra-ui/react"

export function GoogleLogin() {
  return (
    <a style={{ width: "100%" }} href="/api/auth/google">
      <Button w="100%">
        <Image src="/GoogleLogo.svg" alt="Google logo" boxSize="20px" mr={2} />
        Continue with Google
      </Button>
    </a>
  )
}
