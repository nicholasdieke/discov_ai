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
import { Field, Formik } from "formik"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Header from "src/core/components/Header"
import { toFormikValidationSchema } from "zod-formik-adapter"
import signup from "../mutations/signup"
import { Signup } from "../validations"
import { GoogleLogin } from "./GoogleLogin"
import { OrDivider } from "./OrDivider"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [formError, setFormError] = useState("")

  const handleClick = () => setShow(!show)

  return (
    <Flex className="authBg">
      <Box pos="absolute" top="0" w="full" px={{ base: "1.5rem", lg: "6rem" }}>
        <Header theme="dark" showAuth={false} />
      </Box>
      <Flex className="authFormBox">
        <Heading mb="2rem" textAlign="center">
          Create an Account
        </Heading>
        <Formik
          validationSchema={toFormikValidationSchema(Signup)}
          initialValues={{ name: "", email: "", password: "" }}
          onSubmit={async (values) => {
            try {
              await signupMutation(values)
              router.refresh()
              router.push(Routes.MyTripsPage().href)
            } catch (error) {
              if (error.code === "P2002" && error.meta?.target?.includes("email")) {
                setFormError("This email is already being used")
              } else {
                setFormError(error.toString() + error.code)
              }
            }
          }}
        >
          {({ handleSubmit, handleChange, isSubmitting, errors, touched, values }) => (
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.name && touched.name}>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Field
                    as={Input}
                    name="name"
                    placeholder="Name"
                    value={values.name}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.email && touched.email}>
                  <FormLabel htmlFor="email">Email address</FormLabel>
                  <Field
                    as={Input}
                    name="email"
                    placeholder="Email address"
                    value={values.email}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password && touched.password}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Field
                      as={Input}
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
                  Create Account
                </Button>

                {formError && (
                  <div role="alert" style={{ color: "red" }}>
                    {formError}
                  </div>
                )}

                <OrDivider />
                <GoogleLogin />
                <Box textAlign="center" mt="1rem">
                  <Box mt="1rem">
                    Already have an account?{" "}
                    <Link color="#3498db" href={Routes.LoginPage().href}>
                      Log In
                    </Link>
                  </Box>
                </Box>
              </VStack>
            </form>
          )}
        </Formik>
      </Flex>
    </Flex>
  )
}
