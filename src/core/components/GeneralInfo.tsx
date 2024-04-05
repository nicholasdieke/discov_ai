import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react"
import { faClock, faLanguage, faMapMarked, faMoneyBill } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

function GeneralInfo({ countryData, isMobile }) {
  const InfoBox = ({ icon, value }) => {
    return (
      <Flex alignItems="center">
        <Box bg="#484848" p="0.5rem" borderRadius="50%">
          <FontAwesomeIcon icon={icon} height="18px" />
        </Box>
        <Text ml="0.5rem" fontSize={isMobile ? "14px" : "18px"}>
          {value}
        </Text>
      </Flex>
    )
  }

  return (
    <SimpleGrid gap="0.5rem" columns={2} flexDir="row" mb="1rem" mx="0.5rem">
      {/*       <InfoBox icon={faBuildingFlag} value={countryData.capital} /> */}
      <InfoBox icon={faMapMarked} value={countryData.name.common + " " + countryData.flag} />
      <InfoBox icon={faLanguage} value={Object.values(countryData.languages).join(", ")} />
      <InfoBox
        icon={faMoneyBill}
        value={Object.values(countryData.currencies)
          .map(
            (currency: { name: string; symbol: string }) => `${currency.name} (${currency.symbol})`
          )
          .join(", ")}
      />
      <InfoBox icon={faClock} value={countryData.timezones.join(", ")} />
    </SimpleGrid>
  )
}

export default GeneralInfo
