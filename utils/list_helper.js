const _ = require('lodash')

const dummy = (blogs) => {
  blogs = 1
  return blogs
}

const totalLikes = (blogList) => {
  const reducer = (sum, blogList) => {
    return sum + blogList.likes
  }
  return blogList.length === 0
    ? 0
    : blogList.reduce(reducer, 0)
}

const favoriteBlog = (blogList) => {
  const reducer = (mostLikes, blogList) => {
    return (mostLikes.likes > blogList.likes) ? mostLikes : blogList
  }
  return blogList.length === 0
    ? 0
    : blogList.reduce(reducer, 0)
}

const mostBlogs = (blogList) => {

  const blogsByAuthor = _.countBy(blogList, 'author')
  const authorBlogCount = _.map(blogsByAuthor, (blogs, author) => ({
    author: author,
    blogs: blogs
  }))
  const mostBlogsAuthor = _.maxBy(authorBlogCount, (obj) => obj.blogs)
  return blogList.length === 0
    ? 0
    : mostBlogsAuthor
}


const mostLikes = (blogList) => {

  const blogsByAuthor = _.groupBy(blogList, 'author')
  const likesByAuthor = _.map(blogsByAuthor, (value, key) => ({
    author: key,
    likes: _.sumBy(value, 'likes'),
  }
  ))
  const mostLikedAuthor = _.maxBy(likesByAuthor, 'likes')
  return blogList.length === 0
    ? 0
    : mostLikedAuthor
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}