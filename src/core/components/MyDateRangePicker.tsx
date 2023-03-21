import { InputGroup, InputLeftElement } from "@chakra-ui/react"
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

function MyDateRangePicker({ onChange, startDate, endDate }) {
  return (
    <InputGroup>
      <InputLeftElement color="white">
        <FontAwesomeIcon icon={faCalendarDays} />
      </InputLeftElement>
      <DatePicker
        className="react-datapicker__input-text"
        onChange={onChange}
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
