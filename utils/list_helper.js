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

module.exports = {
  dummy,
  totalLikes
}