export default async function (req, res) {
  const maps_key = process.env.GOOGLE_MAPS_API_KEY
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${req.query.destination}&key=${maps_key}`

  function getMapKey(input) {
    const entries = Array.from(cityCodes.entries())
    for (let i = 0; i < entries.length; i++) {
      const [city, code] = entries[i]
      const regex = new RegExp("\\b" + city + "\\b", "i")
      if (regex.test(input)) {
        return code
      }
    }
    return null // no match found
  }

  try {
    const response = await fetch(url)
    const data = await response.json()

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(response.status).json({ result: data.results[0].geometry.location })
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      return res.status(error.response.status).json(error.response.data)
    }
  }
}
