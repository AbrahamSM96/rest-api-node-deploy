const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie titles is required. Please check url'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(0),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: z.array(
    z.enum(
      [
        'Action',
        'Adventure',
        'Crime',
        'Drama',
        'Comedy',
        'Fantasy',
        'Horror',
        'Thriller',
        'Sci-Fi'
      ],
      {
        required_error: 'Movie genre is required',
        invalid_type_error: 'Movie genre must be an array of enmum Genre'
      }
    )
  )
})

function validateMovie(object) {
  return movieSchema.safeParse(object)
}

function valdiatePartialMovie(object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  valdiatePartialMovie
}
