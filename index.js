require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const app = express()

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({error:'malformed id'})
  }
  next(error)
}

app.use(express.static('dist'))
app.use(express.json())
morgan.token('data', (req, res) => JSON.stringify(req.body))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :data"))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(`
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${(new Date()).toString()}</p>
      `)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const personId = request.params.id
  Person
    .findById(personId)
    .then(person => response.json(person))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res) => {
  Person
    .findByIdAndDelete(req.params.id)
    .then(result => {
      console.log(result)
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => response.json(savedPerson))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person
    .findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person
        .save()
        .then(updatedPerson => response.json(updatedPerson))
        .catch(error => next(error))
    })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})