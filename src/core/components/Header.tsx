"use client"

import { useSession } from "@blitzjs/auth"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
  Show,
  Text,
} from "@chakra-ui/react"
import { faBars } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import mixpanel from "mixpanel-browser"
import { useRouter } from "next/router"
import { LuLogIn, LuLogOut, LuLuggage, LuUserPlus } from "react-icons/lu"
import logout from "src/(auth)/mutations/logout"
import useIsMobile from "../hooks/useIsMobile"
import UserMenu from "./UserMenu"

export default function Header({ theme = "white", showAuth = true }) {
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
      pt="1.5rem"
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
      <Show when={isMobile}>
        <MenuRoot>
          <MenuTrigger>
            <IconButton aria-label="Options" variant="ghost">
              <FontAwesomeIcon icon={faBars} height="24px" />
            </IconButton>
          </MenuTrigger>
          <MenuContent>
            {/* @ts-ignore */}
            <MenuItem value="Itineraries" asChild>
              <a href={Routes.Home().href}>Itineraries</a>
            </MenuItem>
            {/* @ts-ignore */}
            <MenuItem value="Destinations" asChild>
              <a href={Routes.DestinationPage().href}>Destinations</a>
            </MenuItem>
            <MenuSeparator />
            <Show when={!session.userId}>
              {/* @ts-ignore */}
              <MenuItem asChild value="Log In">
                <a href={Routes.LoginPage().href}>
                  <LuLogIn />
                  Log In
                </a>
              </MenuItem>
              {/* @ts-ignore */}
              <MenuItem asChild value="Sign Up">
                <a href={Routes.SignUpPage().href}>
                  <LuUserPlus />
                  Sign Up
                </a>
              </MenuItem>
            </Show>
            <Show when={session.userId}>
              {/* @ts-ignore */}
              <MenuItem asChild value="My Trips">
                <a href={Routes.MyTripsPage().href}>
                  <LuLuggage />
                  My Trips
                </a>
              </MenuItem>
              {/* @ts-ignore */}
              <MenuItem asChild value="Log Out">
                <Box
                  onClick={async () => {
                    await logoutMutation()
                    router.reload()
                  }}
                >
                  <LuLogOut />
                  Log Out
                </Box>
              </MenuItem>
            </Show>
          </MenuContent>
        </MenuRoot>
      </Show>
    </Flex>
  )
}
