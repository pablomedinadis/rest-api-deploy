const express = require('express')
const movies = require('./movies.json')
const crypto = require('node:crypto')
const { validateMovie } = require('./schemes/movies')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors()) // soluciona pero pone todo con '*'
app.disable('x-powered-by') // deshabilitar la cabecera de express

// todos los recursos de las peliculas que estan en movies.json
app.get('/movies', (req,res) => {
    res.header('Access-Control-Allow-Origin', '*')

    const {genre} = req.query
    if (genre){
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req,res) => { // path-to-regexp
    const {id} = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)

    res.status(404).json({message: 'Movie not found'})
})

app.post('/movies', (req, res) => {

    const result = validateMovie(req.body)

    if (result.error) {
        // se podría usar el 422
        return res.status(400).json({ error: JSON.parse(result.error.message) })
        // 400 bad request
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }

    movies.push(newMovie)

    res.status(201).json(newMovie)
})

// app.patch('/movies', (req,res) => {
//     const {id} = req.params
//     const movieIndex = movies.find(movie=>movie.id === id)

//     if (movieIndex === -1){
//         return res.status(404).json({message: 'Movie not found'})
//     } 
// })

const PORT = process.env.PORT ?? 1234 // de esta manera viene por variable de entorno

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`)
})