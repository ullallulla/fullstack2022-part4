const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

describe('when there is initially some blogs saved', () => {
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
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier in the blog post is named id', async () => {
    const blogsInDb = await helper.blogsInDb()

    assert.ok('id' in blogsInDb[0])
  })


  test('new blog can be added', async () => {
    const newBlog = {
      title: 'newTitle',
      author: 'newAuthor',
      url: 'newUrl',
      likes: 2
    }
    const token = await helper.getToken()
    await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    assert(titles.includes('newTitle'))
  })

  test('new blog without likes will default to 0 likes', async () => {
    const newBlog = {
      title: 'newTitle2',
      author: 'newAuthor2',
      url: 'newUrl2'
    }
    const token = await helper.getToken()
    await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(201)

    const blogsAtEnd = await helper.blogsInDb()
    const findBlogIndex = (blog) => blog.title === newBlog.title
    const newBlogIndex = blogsAtEnd.findIndex(findBlogIndex)

    assert.strictEqual(blogsAtEnd[newBlogIndex].likes, 0)
  })

  describe('invalid blogs are not created', () => {
    test('new blog without title will not be added', async () => {
      const newBlog = {
        author: 'newAuthor3',
        url: 'newUrl3',
        likes: 20
      }
      const token = await helper.getToken()
      await api
        .post('/api/blogs')
        .set('Authorization', token)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('new blog without url will not be added', async () => {
      const newBlog = {
        title: 'newTitle3',
        author: 'newAuthor3',
        likes: 20
      }
      const token = await helper.getToken()
      await api
        .post('/api/blogs')
        .set('Authorization', token)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

    })
    test('new blog without a token will not be added', async () => {
      const newBlog = {
        title: 'newTitle',
        author: 'newAuthor',
        url: 'newUrl',
        likes: 2
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  test('a blog can be deleted', async () => {
    const newBlog = {
      title: 'delete test title',
      author: 'delete test author',
      url: 'delete test url',
      likes: 2
    }
    const token = await helper.getToken()
    await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(201)

    const blogsAtStart = await helper.blogsInDb()
    const titles = blogsAtStart.map(b => b.title)
    assert(titles.includes('delete test title'))

    const blogToDelete = blogsAtStart.pop()

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', token)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    let blogToUpdate = blogsAtStart[0]
    blogToUpdate.likes = 20
    const token = await helper.getToken()
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', token)
      .send(blogToUpdate)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd[0].likes, 20)
  })
})

describe('when there is initially two users at db', () => {
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
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1)
    const usernames = usersAtEnd.map(u => u.username)
    assert.ok(usernames.includes('jorkku'))
  })

  describe('invalid users are not created', () => {
    test('user is not created if username is less than 3 characters', async () => {
      const newUser = {
        username: '',
        name: 'jorma',
        password: 'zxczxc',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('username: Path `username` (``) is shorter than the minimum allowed length (3)'))
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })

    test('user is not created if password is less than 3 characters', async () => {
      const newUser = {
        username: 'jorkku',
        name: 'jorma',
        password: 's',
      }
      const result=  await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('password needs to be at least 3 characters long'))
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })

    test('user is not created if username is not unique', async () => {
      const newUser = {
        username: 'ullapulla',
        name: 'jorma',
        password: 'zxczxc',
      }
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })
  })
})

after(async () => {
  await User.deleteMany({})
  await mongoose.connection.close()
})