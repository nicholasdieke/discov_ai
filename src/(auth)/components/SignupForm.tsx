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
import signup from "../mutations/signup"

type SignupFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof signup>) => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)
  const router = useRouter()

  const [show, setShow] = useState(false)
  const [formError, setFormError] = useState("")
  const handleClick = () => setShow(!show)

  const signupformSchema = z.object({
    name: z.string({ message: "Name is required" }),
    email: z.string({ message: "Email is required" }),
    password: z.string({ message: "Password is required" }),
  })

  type SignupFormValues = z.infer<typeof signupformSchema>

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    control,
  } = useForm<SignupFormValues>()

  const onSubmit = handleSubmit(async () => {
    const values = getValues()
    try {
      await signupMutation(values)
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
          Create an Account
        </Heading>
        <form onSubmit={onSubmit}>
          <Stack gap="4" align="flex-start" maxW="sm">
            <Field label="Name" invalid={!!errors.name} errorText={errors.name?.message}>
              <Input variant="subtle" {...register("name", { required: "Name is required" })} />
            </Field>

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
          <Box mt="1rem">
            Already have an account?{" "}
            <Link color="#3498db" href={Routes.LoginPage().href}>
              Log in
            </Link>
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}
