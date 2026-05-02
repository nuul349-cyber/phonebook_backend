const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('conecting to', url)

mongoose
  .connect(url, { family:4 })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error coonecting to MongoDB', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'The minimum length of a name is 3 characters'],
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: v => /^(?=.{8,})\d{2,3}-\d+$/.test(v),
      message: () => 'A number should be 8 characters long, and start with 2 or 3 numbers, separated by only one -!'
    },
    required: true,
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)