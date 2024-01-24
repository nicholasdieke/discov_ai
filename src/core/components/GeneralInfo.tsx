import { Flex, Text } from "@chakra-ui/react"

function GeneralInfo({ countryData }) {
  return (
    <Flex
      gap="0.25rem"
      fontSize={{ base: "16px", lg: "18px" }}
      flexDir="row"
      className="countryInfoGroup"
    >
      {/* <Text className="countryInfo">{countryData.flag}</Text> */}
      <Text className="countryInfo">🗣️ {Object.values(countryData.languages).join(", ")}</Text>
      <Text className="countryInfo">💵 {Object.keys(countryData.currencies).join(", ")}</Text>
      <Text className="countryInfo">🚘 {countryData.car.side == "right" ? "➡️" : "⬅️"}</Text>
      {/* <Text className="countryInfo">🇺🇳 {countryData.unmember ? "❌" : "✅"}</Text> */}
    </Flex>
  )
}

export default GeneralInfo
