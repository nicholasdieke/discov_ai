import { faCalendarDays } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { InputGroup } from "src/components/ui/input-group"

function MyDateRangePicker({ onChange, startDate, endDate }) {
  return (
    <InputGroup
      className="tripformInput"
      startElement={<FontAwesomeIcon icon={faCalendarDays} height="20px" />}
    >
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
