"use client"

import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useSession } from "@blitzjs/auth"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Separator,
  Show,
  Stack,
  Text,
} from "@chakra-ui/react"
import { faBars } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import mixpanel from "mixpanel-browser"
import { useRouter } from "next/router"
import { LuLogIn, LuLogOut, LuLuggage, LuUserPlus } from "react-icons/lu"
import logout from "src/(auth)/mutations/logout"
import useIsMobile from "../hooks/useIsMobile"
import ShareButton from "./ShareButton"
import UserMenu from "./UserMenu"

export default function Header({
  theme = "white",
  showAuth = true,
  showMenu = true,
  destination = "",
}) {
  const router = useRouter()
  const currentRoute = router.pathname
  const isMobile = useIsMobile()

  const session = useSession({ suspense: false })
  const [logoutMutation] = useMutation(logout)

  if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
    mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)
  }
  return (
    <Flex
      justifyContent="space-between"
      pb={{ base: "0.5rem", md: "1.5rem" }}
      pt="1rem"
      alignItems="center"
      color={theme}
      w="full"
    >
      <Text
        onClick={() => {
          mixpanel.track("Clicked Logo")
          router.push(Routes.Home()).catch((e) => console.log(e))
        }}
        className="logo-text"
        fontSize={{ base: "16px", md: "20px" }}
      >
        DiscovAI
      </Text>
      <Show when={!isMobile}>
        <HStack>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => router.push(Routes.Home())}
            /* opacity={currentRoute === Routes.Home().pathname ? 1 : 0.75} */
          >
            Itineraries
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => router.push(Routes.DestinationPage())}
            /* opacity={currentRoute === Routes.DestinationPage().pathname ? 1 : 0.75} */
          >
            Destinations
          </Button>
          {showAuth && <UserMenu />}
        </HStack>
      </Show>
      <Show when={isMobile && showMenu}>
        <DrawerRoot size="xs">
          <DrawerBackdrop />
          {/* @ts-ignore */}
          <DrawerTrigger asChild>
            <IconButton aria-label="Options" variant="ghost">
              <FontAwesomeIcon icon={faBars} height="24px" />
            </IconButton>
          </DrawerTrigger>
          {/* @ts-ignore */}
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>DiscovAI</DrawerTitle>
            </DrawerHeader>
            <DrawerBody zIndex="100">
              <Stack gap={5}>
                <a className="menuOption" href={Routes.Home().href}>
                  Itineraries
                </a>

                <a className="menuOption" href={Routes.DestinationPage().href}>
                  Destinations
                </a>
                <Separator />
                <Show when={!session.userId}>
                  <a className="menuOption" href={Routes.LoginPage().href}>
                    <LuLogIn />
                    Log In
                  </a>
                  <a className="menuOption" href={Routes.SignUpPage().href}>
                    <LuUserPlus />
                    Sign Up
                  </a>
                </Show>
                <Show when={session.userId}>
                  <a className="menuOption" href={Routes.MyTripsPage().href}>
                    <LuLuggage />
                    My Trips
                  </a>
                  <Box
                    className="menuOption"
                    onClick={async () => {
                      await logoutMutation()
                      router.reload()
                    }}
                  >
                    <LuLogOut />
                    Log Out
                  </Box>
                </Show>
              </Stack>
            </DrawerBody>
            <DrawerCloseTrigger />
          </DrawerContent>
        </DrawerRoot>
      </Show>

      <Show when={isMobile && !showMenu}>
        <ShareButton isMobile={isMobile} destination={destination} theme="black" />
      </Show>
    </Flex>
  )
}
