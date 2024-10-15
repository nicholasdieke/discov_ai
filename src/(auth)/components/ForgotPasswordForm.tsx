"use client"
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
  VStack,
} from "@chakra-ui/react"
import { Formik } from "formik"
import { useState } from "react"
import Header from "src/core/components/Header"
import { toFormikValidationSchema } from "zod-formik-adapter"
import forgotPassword from "../mutations/forgotPassword"
import { ForgotPassword } from "../validations"

export function ForgotPasswordForm() {
  const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword)
  const [formError, setFormError] = useState("")

  return (
    <Box className="authBg">
      <Box pos="absolute" top="0" w="full" px={{ base: "1.5rem", lg: "6rem" }}>
        <Header theme="dark" showAuth={false} />
      </Box>
      <Flex className="authFormBox">
        <Heading mb="2rem" textAlign="center">
          Forgot your password?
        </Heading>{" "}
        <>
          {isSuccess ? (
            <div>
              <h2>Request Submitted</h2>
              <p>
                If your email is in our system, you will receive instructions to reset your password
                shortly.
              </p>
            </div>
          ) : (
            <Formik
              validationSchema={toFormikValidationSchema(ForgotPassword)}
              initialValues={{ email: "" }}
              onSubmit={async (values) => {
                try {
                  await forgotPasswordMutation(values)
                } catch (error: any) {
                  setFormError("Sorry, we had an unexpected error. Please try again.")
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
                    <Button
                      w="100%"
                      mt="1rem"
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                    >
                      Send Reset Password Instructions
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
        </>
      </Flex>
    </Box>
  )
}
