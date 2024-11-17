"use client"

import { useSession } from "@blitzjs/auth"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import {
  Button,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react"
import {
  faBars,
  faEarthEurope,
  faRightFromBracket,
  faRightToBracket,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import mixpanel from "mixpanel-browser"
import { useRouter } from "next/router"
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
      {!isMobile && (
        <HStack>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => router.push(Routes.Home())}
            opacity={currentRoute === Routes.Home().pathname ? 1 : 0.75}
            hidden={isMobile && currentRoute === Routes.Home().pathname}
            className="menuItems"
            colorScheme="white"
            px="1rem"
          >
            Itineraries
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => router.push(Routes.DestinationPage())}
            opacity={currentRoute === Routes.DestinationPage().pathname ? 1 : 0.75}
            hidden={isMobile && currentRoute === Routes.DestinationPage().pathname}
            className="menuItems"
            colorScheme="white"
            px="1rem"
          >
            Destinations
          </Button>
          {showAuth && <UserMenu />}
        </HStack>
      )}
      {isMobile && (
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FontAwesomeIcon icon={faBars} height="24px" />}
            colorScheme="whiteAlpha"
          />
          <MenuList color="black">
            <MenuItem onClick={() => router.push(Routes.Home())}>Itineraries</MenuItem>
            <MenuItem onClick={() => router.push(Routes.DestinationPage())}>Destinations</MenuItem>
            <MenuDivider />
            {!session.userId && (
              <>
                <MenuItem
                  icon={<FontAwesomeIcon icon={faRightToBracket} height="14px" />}
                  onClick={() => router.push(Routes.LoginPage())}
                >
                  Log In
                </MenuItem>
                <MenuItem
                  icon={<FontAwesomeIcon icon={faUserPlus} height="14px" />}
                  onClick={() => router.push(Routes.SignUpPage())}
                >
                  Sign Up
                </MenuItem>
              </>
            )}
            {!!session.userId && (
              <>
                <MenuItem
                  onClick={() => router.push(Routes.MyTripsPage())}
                  icon={<FontAwesomeIcon icon={faEarthEurope} height="14px" />}
                >
                  My Trips
                </MenuItem>
                <MenuItem
                  onClick={async () => {
                    await logoutMutation()
                    router.reload()
                  }}
                  icon={<FontAwesomeIcon icon={faRightFromBracket} height="14px" />}
                >
                  Log Out
                </MenuItem>
              </>
            )}
          </MenuList>
        </Menu>
      )}
    </Flex>
  )
}
