import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    breakpoints: {
      sm: "692px",
      md: "992px",
      lg: "1200px",
      xl: "1400px",
    },
  },
})

export const system = createSystem(defaultConfig, config)
