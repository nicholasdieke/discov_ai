export default async function (req, res) {
  const url = `https://restcountries.com/v3.1/name/${req.query.country}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(response.status).json({ result: data })
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      return res.status(error.response.status).json(error.response.data)
    }
  }
}
