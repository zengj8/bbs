module.exports = function (app) {
  app.get('/', function (req, res) {
    res.redirect('/posts');
  });
  app.use('/modify', require('./modify'));
  app.use('/signup', require('./signup'));
  app.use('/signin', require('./signin'));
  app.use('/signout', require('./signout'));
  app.use('/posts', require('./posts'));
  app.use('/comments', require('./comments'));
  app.use('/replys', require('./replys'));
  app.use('/tags', require('./tags'));

  // 404 page
  app.use(function (req, res) {
    // HTTP头信息未发送
    if (!res.headersSent) {
      // 将返回状态码改为404，并渲染404页面
      res.status(404).render('404');
    }
  });
};
