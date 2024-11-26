import { EmptyState } from "@/components/ui/empty-state"
import { Routes } from "@blitzjs/next"
import { Box, Group } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { LuMapPinOff } from "react-icons/lu"
import { Button } from "src/components/ui/button"
import Header from "src/core/components/Header"

export default function Page404() {
  const router = useRouter()

  return (
    <Box backgroundColor="#1a1c21" h="100%" minH="100vh" color="white" overflow="hidden">
      <Box h="100%" minH="100vh" px={{ base: "2rem", lg: "7.5rem" }}>
        <Header />
        <EmptyState
          size="lg"
          icon={<LuMapPinOff />}
          title="Oops!"
          description="Sorry, this page does not exist."
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Group>
            <Button onClick={() => router.push(Routes.Home())}>Go Home</Button>
          </Group>
        </EmptyState>
      </Box>
    </Box>
  )
}
