const Blog = require('../models/blog')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const initialBlogs = [
  {
    'title': 'Random title',
    'author': 'Random person',
    'url': '/asd/asd',
    'likes': 15
  },
  {
    'title': 'Random title2',
    'author': 'Random person2',
    'url': '/qwe/qwe',
    'likes': 10
  }
]

const initialUsers = [
  {
    'username': 'ullapulla',
    'name': 'ulla',
    'password': 'asdasd',
  },
  {
    'username': 'pullaulla',
    'name': 'pulla',
    'password': 'qweqwe',
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'removed', author: 'no one' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const getToken = async () => {
  const newUser = {
    username: 'jorkku',
    name: 'jorma',
    password: 'zxczxc',
  }
  await api
    .post('/api/users')
    .send(newUser)

  const response = await api
    .post('/api/login')
    .send({ username: 'jorkku', password: 'zxczxc' })

  return `Bearer ${response.body.token}`
}

module.exports = {
  initialBlogs,
  initialUsers,
  nonExistingId,
  blogsInDb,
  usersInDb,
  getToken
}