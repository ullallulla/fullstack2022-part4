const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
  console.log('cleared')
  for (let user of helper.initialUsers) {
    let userObject = new User(user)
    await userObject.save()
    console.log('saved')
  }

  console.log('done')
})

test('new user can be added', async () => {
  const newUser = {
    username: 'jorkku',
    name: 'jorma',
    password: 'zxczxc',
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await helper.usersInDb()
  expect(usersAtEnd).toHaveLength(helper.initialUsers.length + 1)

  const usernames = usersAtEnd.map(u => u.username)
  expect(usernames).toContain('jorkku')
})

describe('invalid users are not created', () => {
  test('user is not created if username is less than 3 characters', async () => {
    const newUser = {
      username: '',
      name: 'jorma',
      password: 'zxczxc',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)
  })

  test('user is not created if password is less than 3 characters', async () => {
    const newUser = {
      username: 'jorkku',
      name: 'jorma',
      password: '',
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)
  })

  test('user is not created if username is not unique', async () => {
    const newUser = {
      username: 'ullapulla',
      name: 'jorma',
      password: 'zxczxc',
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length)
  })
})


afterAll(() => {
  mongoose.connection.close()
})