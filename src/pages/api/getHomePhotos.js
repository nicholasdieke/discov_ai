import { createApi } from "unsplash-js"

const api = createApi({
  accessKey: process.env.UNSPLASH_API_KEY,
})

export default async function (req, res) {
  try {
    const photos = await api.collections.getPhotos({ collectionId: "zvPQjaOLXfY" })
    res.status(200).json({ result: photos.response.results })
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error(`Error with Unsplash API request: ${error.message}`)
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      })
    }
  }
}
