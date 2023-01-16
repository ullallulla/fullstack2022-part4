const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')



usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1 })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body
  if (!body.password) {
    return response.status(400).json({ error: 'password is required' })
  }
  else if (body.password.length < 3) {
    return response.status(400).json({ error: 'password needs to be at least 3 characters long' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)


  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })


  const savedUser = await user.save()

  response.status(201).json(savedUser)
})





module.exports = usersRouter