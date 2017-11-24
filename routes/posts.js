let express = require('express');
let router = express.Router();

let PostModel = require('../models/posts');
let CommentModel = require('../models/comments');
let ReplyModel = require('../models/replys');
let TagModel = require('../models/tags');
let checkLogin = require('../middlewares/check').checkLogin;

// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?author=xxx&page=1
router.get('/', function(req, res, next) {
  let author = req.query.author;
  let page = req.query.page;

  if (!page) {
    page = 1;
  }
  let pageSize = 3;

  PostModel.getPosts(author, page)
    .then(function (result) {
      let posts = result[0];
      posts.currentPage = page;
      posts.author = author;
      posts.total = parseInt((result[1] - 1) / pageSize + 1);
      return posts;
    })
    .then(function (posts) {
      let author = posts.author, currentPage = posts.currentPage, total = posts.total;
      return Promise.all(posts.map(function (post) {
        return TagModel.getTagsByPostId(post._id).then(function (tags) {
          post.tags = tags;
          return post;
        });
      })).then(function (posts) {
        posts.currentPage = currentPage;
        posts.author = author;
        posts.total = total;
        return posts;
      });
    })
    .then(function (posts) {
      res.render('posts', {
        posts: posts,
        tag: false
      });
    })
    .catch(next);
});

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function(req, res, next) {
  res.render('create');
});

// POST /posts 发表一篇文章
router.post('/', checkLogin, function(req, res, next) {
  let author = req.session.user._id;
  let title = req.fields.title;
  let content = req.fields.content;

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题');
    }
    if (!content.length) {
      throw new Error('请填写内容');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  let post = {
    author: author,
    title: title,
    content: content,
    pv: 0
  };

  PostModel.create(post)
    .then(function (result) {
      // 此 post 是插入 mongodb 后的值，包含 _id
      post = result.ops[0];
      req.flash('success', '发表成功');
      // 发表成功后跳转到该文章页
      res.redirect(`/posts/${post._id}/page/1`);
    })
    .catch(next);
});

// GET /posts/:postId/page/:page 单独一篇的文章页，page为评论页面
router.get('/:postId/page/:page', function(req, res, next) {
  let postId = req.params.postId;
  let page = req.params.page;
  let pageSize = 5;
  
  Promise.all([
    PostModel.getPostById(postId),// 获取文章信息
    CommentModel.getComments(postId, page),// 获取该文章所有留言
    TagModel.getTagsByPostId(postId),// 获取该文章所有标签
    PostModel.incPv(postId),// pv 加 1
  ])
  .then(function (result) {
    let post = result[0];
    let comments = result[1][0];
    comments.total = parseInt((result[1][1] - 1) / pageSize + 1);
    comments.currentPage = page;
    post.tags = result[2];
    if (!post) {
      throw new Error('该文章不存在');
    }
    return {
      post: post,
      comments: comments
    };
  })
  .then(function (result) {
    let comments = result.comments;
    return Promise.all(comments.map(function (comment) {
      return ReplyModel.getReplys(comment._id).then(function (res) {
        comment.replys = res[0];
        comment.replysCount = res[1];
        return comment;
      });
    }))
    .then(function () {
      return result;
    });
  })
  .then(function (result) {
    res.render('post', result);
  })
  .catch(next);
});

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function(req, res, next) {
  let postId = req.params.postId;
  let author = req.session.user._id;

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('该文章不存在');
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('权限不足');
      }
      res.render('edit', {
        post: post
      });
    })
    .catch(next);
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function(req, res, next) {
  let postId = req.params.postId;
  let author = req.session.user._id;
  let title = req.fields.title;
  let content = req.fields.content;

  PostModel.updatePostById(postId, author, { title: title, content: content })
    .then(function () {
      req.flash('success', '编辑文章成功');
      // 编辑成功后跳转到上一页
      res.redirect(`/posts/${postId}`);
    })
    .catch(next);
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function(req, res, next) {
  let postId = req.params.postId;
  let author = req.session.user._id;

  PostModel.delPostById(postId, author)
    .then(function () {
      req.flash('success', '删除文章成功');
      // 删除成功后跳转到主页
      res.redirect('/posts');
    })
    .catch(next);
});

module.exports = router;
