const express = require('express')
const morgan = require('morgan')
const app = express()

morgan.token('data', (req, res) => JSON.stringify(req.body))
app.use(express.json())
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :data"))

let phoneBook = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
  response.json(phoneBook)
})

app.get('/info', (request, response) => {
  response.send(`
    <p>Phonebook has info for ${phoneBook.length} people</p>
    <p>${(new Date()).toString()}</p>
    `)
})

app.get('/api/persons/:id', (req, res) => {
  const personId = req.params.id
  const number = phoneBook.find(p => p.id === personId)
  if (number) {
    res.json(number)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const personId = req.params.id
  phoneBook = phoneBook.filter(p => p.id !== personId)

  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const person = req.body
  
  if (!person.name || !person.number) {
    return res.status(400).json({
      error: 'content missing'
    })
  }

  if (phoneBook.some(p => p.name === person.name)) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  person.id = String(Math.floor(Math.random() * 999999999999999))
  phoneBook = phoneBook.concat(person)

  res.json(person)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})