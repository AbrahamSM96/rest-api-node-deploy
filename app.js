const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const z = require('zod')
const cors = require('cors')
const { validateMovie, valdiatePartialMovie } = require('./schemas/movies')

const app = express()
app.use(express.json())
app.use(cors())
app.disable('x-powered-by') // deshabiliatar el header

//metodos normale: GET/HEAD/POST
//metodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
//OPTIONS

const ACCEPTED_ORIGINS = [
  'http://localhost:1234',
  'http://localhost:8080',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]

app.get('/movies', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  }
  const { genre } = req.query
  if (genre) {
    // some puede ser una alternativa a includes, para buscar mas apropiadamente
    // sin acentos, sin mayusculas, etc
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some(
        (g) => g.toLocaleLowerCase() === genre.toLocaleLowerCase()
      )
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find((movie) => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: JSON.parse(result.error.message)
    })
  }
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  // Esto no sería REST porqye estamos guardando el estado de la aplicacion en memoria
  movies.push(newMovie)
  res.status(201).json(newMovie) // actualizar la cache del cliente
})

app.patch('/movies/:id', (req, res) => {
  const result = valdiatePartialMovie(req.body)
  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = { ...movies[movieIndex], ...result.data }
  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  }
  res.send(200)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Server ready on ${PORT}`)
})
