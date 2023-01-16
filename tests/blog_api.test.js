const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')


beforeEach(async () => {
  await Blog.deleteMany({})
  console.log('cleared')
  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
    console.log('saved')
  }

  console.log('done')
})

test('correct amount of blogs are returned in JSON format', async () => {
  console.log('entered test')
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier in the blog post is named id', async () => {
  const blogsInDb = await helper.blogsInDb()
  console.log(blogsInDb)
  expect(blogsInDb[0].id).toBeDefined()
})

test('new blog can be added', async () => {
  const newBlog = {
    title: 'newTitle',
    author: 'newAuthor',
    url: 'newUrl',
    likes: 2
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(b => b.title)
  expect(titles).toContain('newTitle')
})

test('new blog without likes will not be added', async () => {
  const newBlog = {
    title: 'newTitle2',
    author: 'newAuthor2',
    url: 'newUrl2'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

  const blogsAtEnd = await helper.blogsInDb()
  const findBlogIndex = (blog) => blog.title === newBlog.title
  const newBlogIndex = blogsAtEnd.findIndex(findBlogIndex)

  expect(blogsAtEnd[newBlogIndex].likes).toBe(0)

})

afterAll(() => {
  mongoose.connection.close()
})