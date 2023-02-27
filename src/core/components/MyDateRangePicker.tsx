import { InputGroup, InputLeftElement } from "@chakra-ui/react"
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

function MyDateRangePicker() {
  const [dateRange, setDateRange] = useState([null, null])
  const [startDate, endDate] = dateRange
  return (
    <InputGroup>
      <InputLeftElement
        color="gray.500"
        children={<FontAwesomeIcon icon={faCalendarDays} size="1x" />}
      />
      <DatePicker
        className="react-datapicker__input-text"
        onChange={(update) => {
          setDateRange(update)
        }}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        minDate={new Date()}
        placeholderText="Choose your dates"
        dateFormat="dd MMM yyyy"
      />
    </InputGroup>
  )
}

export default MyDateRangePicker
