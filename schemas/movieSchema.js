const zod = require('zod')

const movieSchema = zod.object({
  title: zod.string({
    required_error: 'Title is required',
    invalid_type_error: 'Movie title must be a string',
  }),
  year: zod.number().min(1900).max(2025),
  director: zod.string(),
  duration: zod.number().min(0),
  rate: zod.number().min(0).max(10),
  genre: zod.array(
    zod.enum([
      'Action',
      'Adventure',
      'Drama',
      'Sci-Fi',
      'Romance',
      'Crime',
      'Animation',
      'Biography',
      'Fantasy',
    ]),
    {
      invalid_type_error: 'Genre must be an array',
    }
  ),
  poster: zod.string().url({
    message: 'Poster must be a valid url',
  }),
})

function validateSchema(objet) {
  return movieSchema.safeParse(objet)
}

function validateParcialSchema(objet) {
  return movieSchema.partial().safeParse(objet)
}

module.exports = { validateSchema, validateParcialSchema }
