export default async function (req, res) {
  const WEATHER_API_KEY = process.env.WEATHER_API_KEY
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${req.query.destination}/${req.query.fromDate}/${req.query.toDate}?unitGroup=metric&include=days&key=${WEATHER_API_KEY}&contentType=json`

  try {
    const response = await fetch(url)
    const data = await response.json()
    res.status(response.status).json({ result: data })
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      return res.status(error.response.status).json(error.response.data)
    }
  }
}
