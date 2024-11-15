"use client"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  VStack,
} from "@chakra-ui/react"
import { AuthenticationError, PromiseReturnType } from "blitz"
import { Formik } from "formik"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Header from "src/core/components/Header"
import { toFormikValidationSchema } from "zod-formik-adapter"
import login from "../mutations/login"
import { Login } from "../validations"
import { GoogleLogin } from "./GoogleLogin"
import { OrDivider } from "./OrDivider"

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  const router = useRouter()

  const [show, setShow] = useState(false)
  const [formError, setFormError] = useState("")
  const handleClick = () => setShow(!show)

  return (
    <Box className="authBg">
      <Box pos="absolute" top="0" w="full" px={{ base: "1.5rem", lg: "6rem" }}>
        <Header theme="dark" showAuth={false} />
      </Box>
      <Flex className="authFormBox">
        <Heading mb="2rem" textAlign="center">
          Welcome back
        </Heading>

        <Formik
          validationSchema={toFormikValidationSchema(Login)}
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values) => {
            try {
              await loginMutation(values)
              router.push(Routes.MyTripsPage().href)
            } catch (error) {
              if (error instanceof AuthenticationError) {
                setFormError("Invalid email or password")
              } else {
                setFormError("An unexpected error occurred. Please try again.")
              }
            }
          }}
        >
          {({ handleSubmit, handleChange, isSubmitting, errors, touched, values }) => (
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.email && touched.email}>
                  <FormLabel htmlFor="email">Email address</FormLabel>
                  <InputGroup>
                    <Input
                      name="email"
                      placeholder="Email address"
                      value={values.email}
                      onChange={handleChange}
                    />
                  </InputGroup>

                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password && touched.password}>
                  <FormLabel htmlFor="password">Password</FormLabel>

                  <InputGroup>
                    <Input
                      name="password"
                      pr="4.5rem"
                      type={show ? "text" : "password"}
                      placeholder="Password"
                      value={values.password}
                      onChange={handleChange}
                    />
                    <InputRightElement width="4.5rem">
                      <Button h="1.75rem" size="sm" colorScheme="whiteAlpha" onClick={handleClick}>
                        {show ? "Hide" : "Show"}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <Button w="100%" mt="1rem" type="submit" variant="primary" disabled={isSubmitting}>
                  Login
                </Button>

                {formError && (
                  <div role="alert" style={{ color: "red" }}>
                    {formError}
                  </div>
                )}

                <OrDivider />
                <GoogleLogin />
                <Box textAlign="center" mt="1rem">
                  <Link href={Routes.ForgotPasswordPage().href}>Forgot your password?</Link>
                  <Box mt="1rem">
                    Do not have an account?{" "}
                    <Link color="#3498db" href={Routes.SignUpPage().href}>
                      Sign Up
                    </Link>
                  </Box>
                </Box>
              </VStack>
            </form>
          )}
        </Formik>
      </Flex>
    </Box>
  )
}
