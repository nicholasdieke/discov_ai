"use client"
import { useSession } from "@blitzjs/auth"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
import {
  faEarthEurope,
  faRightFromBracket,
  faRightToBracket,
  faUserCircle,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import router from "next/router"
import logout from "src/(auth)/mutations/logout"

function UserMenu() {
  const session = useSession({ suspense: false })
  const [logoutMutation] = useMutation(logout)

  return (
    <Menu>
      <MenuButton
        as={Button}
        leftIcon={<FontAwesomeIcon icon={faUserCircle} height="30px" />}
        colorScheme="white"
        px="1rem"
        h="30px"
      >
        {session.name}
      </MenuButton>
      <MenuList color="black">
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
  )
}

export default UserMenu
