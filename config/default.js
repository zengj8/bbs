module.exports = {
  port: 3000,
  session: {
    secret: 'mybbs',
    key: 'mybbs',
    maxAge: 2592000000
  },
  mongodb: 'mongodb://localhost:27017/mybbs'
};
