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
  VStack,
} from "@chakra-ui/react"
import { Field, Formik } from "formik"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import router from "next/router"
import { useState } from "react"
import Header from "src/core/components/Header"
import { toFormikValidationSchema } from "zod-formik-adapter"
import resetPassword from "../mutations/resetPassword"
import { ResetPassword } from "../validations"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")?.toString()
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)
  const [formError, setFormError] = useState("")

  return (
    <Box className="authBg">
      <Box pos="absolute" top="0" w="full" px={{ base: "1.5rem", lg: "6rem" }}>
        <Header theme="dark" showAuth={false} />
      </Box>
      <Flex className="authFormBox">
        <Heading mb="2rem" textAlign="center">
          Set a New Password
        </Heading>

        {isSuccess ? (
          <div>
            <h2>Password Reset Successfully</h2>
            <p>
              Go to the <Link href="/">homepage</Link>
            </p>
          </div>
        ) : (
          <Formik
            validationSchema={toFormikValidationSchema(ResetPassword)}
            initialValues={{
              password: "",
              passwordConfirmation: "",
              token,
            }}
            onSubmit={async (values) => {
              try {
                await resetPasswordMutation({ ...values, token })
                router.push(Routes.MyTripsPage().href)
              } catch (error) {
                if (error.name === "ResetPasswordError") {
                  setFormError(error.message)
                } else {
                  setFormError("Sorry, we had an unexpected error. Please try again.")
                }
              }
            }}
          >
            {({ handleSubmit, handleChange, isSubmitting, errors, touched, values }) => (
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isInvalid={!!errors.password && touched.password}>
                    <FormLabel htmlFor="password">New Password</FormLabel>
                    <Field
                      as={Input}
                      name="password"
                      pr="4.5rem"
                      type="password"
                      placeholder="Password"
                      value={values.password}
                      onChange={handleChange}
                    />
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.password && touched.password}>
                    <FormLabel htmlFor="password">Confirm New Password</FormLabel>
                    <Field
                      as={Input}
                      name="passwordConfirmation"
                      pr="4.5rem"
                      type="password"
                      placeholder="Confirm your password"
                      value={values.passwordConfirmation}
                      onChange={handleChange}
                    />
                    <FormErrorMessage>{errors.passwordConfirmation}</FormErrorMessage>
                  </FormControl>

                  <Button
                    w="100%"
                    mt="1rem"
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    Reset Password
                  </Button>

                  {formError && (
                    <div role="alert" style={{ color: "red" }}>
                      {formError}
                    </div>
                  )}
                </VStack>
              </form>
            )}
          </Formik>
        )}
      </Flex>
    </Box>
  )
}
