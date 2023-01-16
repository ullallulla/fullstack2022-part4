const Blog = require('../models/blog')
const User = require('../models/user')

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

module.exports = {
  initialBlogs,
  initialUsers,
  nonExistingId,
  blogsInDb,
  usersInDb
}