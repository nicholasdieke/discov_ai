import { Flex, Image, Text } from "@chakra-ui/react"

function WeatherInfo({ days, isMobile }) {
  const getWeatherIcon = (conditions) => {
    switch (conditions) {
      case "snow":
        return "/weather-icons/snow.png"
      case "rain":
        return "/weather-icons/rain.png"
      case "fog":
        return "/weather-icons/fog.png"
      case "wind":
        return "/weather-icons/windy.png"
      case "cloudy":
        return "/weather-icons/cloudy.png"
      case "partly-cloudy-day":
        return "/weather-icons/partly-cloudy.png"
      case "partly-cloudy-night":
        return "/weather-icons/partly-cloudy-night.png"
      case "clear-day":
        return "/weather-icons/clear.png"
      case "clear-night":
        return "/weather-icons/clear-night.png"

      default:
        return "/weather-icons/partly-cloudy.png"
    }
  }

  function getBorderColor(temperatureCelsius: number): string {
    const coldColor = [0, 51, 204] // blue
    const hotColor = [255, 102, 0] // orange
    const minTemp = -30 // minimum temperature to map onto the color scale
    const maxTemp = 50 // maximum temperature to map onto the color scale

    // map the temperature onto the range [0,1]
    let t = (temperatureCelsius - minTemp) / (maxTemp - minTemp)
    t = Math.max(0, Math.min(1, t)) // ensure t is within [0,1]

    // interpolate the color channels
    const r = Math.round(coldColor[0]! * (1 - t) + hotColor[0]! * t)
    const g = Math.round(coldColor[1]! * (1 - t) + hotColor[1]! * t)
    const b = Math.round(coldColor[2]! * (1 - t) + hotColor[2]! * t)

    // convert the channels into a hex code
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase()}`
  }

  const formatDateString = (dateString, isMobile) => {
    const date = new Date(dateString)

    if (isMobile) {
      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "numeric",
      }).format(date)
      return formattedDate
    } else {
      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(date)
      return formattedDate
    }
  }

  return (
    <Flex overflow="auto" mb="1rem">
      {days.map((day) => (
        <Flex
          alignItems="center"
          flexDir="column"
          mx={{ base: "0.4rem", md: "0.5rem" }}
          key={day.datetime + "-" + day.conditions}
          borderWidth="1px"
          borderRadius="10px"
          borderColor={getBorderColor(day.temp)}
          p="0.5rem"
          maxW={{ base: "100px", md: "190px" }}
          minW={{ base: "85px", md: "160px" }}
          fontSize={isMobile ? "14px" : "18px"}
        >
          <Text mb="0.5rem" whiteSpace="nowrap" fontWeight="600">
            {formatDateString(day.datetime, isMobile)}
          </Text>

          <Image
            boxSize={{ base: "35px", md: "45px" }}
            objectFit="cover"
            alt={day.conditions}
            src={getWeatherIcon(day.icon)}
          />
          <Flex
            flexDir={{ base: "column", md: "row" }}
            alignItems="center"
            mt="0.5rem"
            fontSize="20px"
          >
            <Text mr={{ base: "0", md: "0.4rem" }} fontWeight="600">
              {day.tempmax}°
            </Text>

            <Text ml={{ base: "0", md: "0.4rem" }} opacity="0.6">
              {day.tempmin}°
            </Text>
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}

export default WeatherInfo
