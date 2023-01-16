const Blog = require('../models/blog')

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


module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb
}