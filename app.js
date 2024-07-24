const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')
const movies = require('./movies.json')
const {
  validateSchema,
  validateParcialSchema,
} = require('./schemas/movieSchema.js')

const port = process.env.POST ?? 3000
const app = express()
app.use(express.json())
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:1234',
        'http://movies.com',
        'http://127.0.0.1:5500',
      ]
      if (ACCEPTED_ORIGINS.includes(origin)) {
        callback(null, true)
      }
      if (!origin) {
        callback(null, true)
      }
      callback(new Error('Not allowed by CORS'))
    },
  })
)
app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a mi api de peliculas' })
})

// acceder a todos los recursos que sean MOVIES en la url /movies
app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(movie =>
      movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    res.json(filteredMovies)
  }
  res.json(movies)
})

// acceder a un recurso especifico en la url /movies/:id
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Movie Not Found' })
})

app.post('/movies', (req, res) => {
  const result = validateSchema(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const movie = {
    id: crypto.randomUUID(),
    ...result.data,
  }
  movies.push(movie)
  res.status(201).json(movie)
})

// Los CORS tienen distintas formas de actuar dependiendo el method
// metdodos normales: GET/HEAD/POST
// metodos complejos: PUT/PATCH/DELETE
// EN los metodos complejos existe el CORS PRE-Flight
// que es un metodo OPTIONS que se ejecuta antes de que se ejecute el metodo complejo

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie Not Found' })
  }
  movies.splice(movieIndex, 1)
  return res.status(204).json({ message: 'Movie Deleted' })
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const result = validateParcialSchema(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie Not Found' })
  }
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  }
  movies[movieIndex] = updateMovie
  return res.json(updateMovie)
})

app.listen(port, () =>
  console.log(`Escuchando en el puerto http://localhost:${port}`)
)
