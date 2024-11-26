"use client"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { Box, Button, Flex, Heading, Input, Link, Show, Stack } from "@chakra-ui/react"
import { AuthenticationError, PromiseReturnType } from "blitz"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Field } from "src/components/ui/field"
import { PasswordInput } from "src/components/ui/password-input"
import Header from "src/core/components/Header"
import { z } from "zod"
import login from "../mutations/login"
import { Login } from "../validations"
import { GoogleLogin } from "./GoogleLogin"
import { OrDivider } from "./OrDivider"

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (_props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  const router = useRouter()

  const [formError, setFormError] = useState("")

  type LoginFormValues = z.infer<typeof Login>

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormValues>()

  const onSubmit = handleSubmit(async () => {
    const values = getValues()
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
  })

  return (
    <Box className="authBg">
      <Box pos="absolute" top="0" w="full" px={{ base: "1.5rem", lg: "6rem" }}>
        <Header theme="dark" showAuth={false} />
      </Box>
      <Flex className="authFormBox">
        <Heading mb="2rem" textAlign="center">
          Welcome back
        </Heading>
        <form onSubmit={onSubmit}>
          <Stack gap="4" align="flex-start" maxW="sm">
            <Field label="Email" invalid={!!errors.email} errorText={errors.email?.message}>
              <Input variant="subtle" {...register("email", { required: "Email is required" })} />
            </Field>

            <Field
              label="Password"
              invalid={!!errors.password}
              errorText={errors.password?.message}
            >
              <PasswordInput
                variant="subtle"
                {...register("password", { required: "Password is required" })}
              />
            </Field>

            <Show when={formError}>
              <div role="alert" style={{ color: "red" }}>
                {formError}
              </div>
            </Show>

            <Button type="submit" w="full" onClick={onSubmit}>
              Submit
            </Button>

            <OrDivider />
            <GoogleLogin />
          </Stack>
        </form>

        <Box textAlign="center" mt="1rem">
          {/* <Link href={Routes.ForgotPasswordPage().href}>Forgot your password?</Link> */}
          <Box mt="1rem">
            Do not have an account?{" "}
            <Link color="#3498db" href={Routes.SignUpPage().href}>
              Sign Up
            </Link>
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}
