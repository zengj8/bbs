let express = require('express');
let router = express.Router();

let TagModel = require('../models/tags');
let CommentModel = require('../models/comments');
let checkLogin = require('../middlewares/check').checkLogin;

// POST /tags/:postId/tag 创建一条标签
router.post('/:postId/tag', checkLogin, function(req, res, next) {
  let name = req.fields.name;
  let postId = req.params.postId;

  // 校验参数
  try {
    if (!name) {
      throw new Error('请填写标签名');
    }
    if (name.length > 10) {
      throw new Error('标签名长度不能超过10');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  Promise.all([
    TagModel.getTagsCount(postId),
    TagModel.getTagByName(postId, name)
  ])
  .then(function (result) {
    let count = result[0];
    let oldTag = result[1];

    if (count >= 3) {
      throw new Error('一篇文章最多只能有3个标签');
    }
    if (oldTag) {
      throw new Error('该文章已存在该标签');
    }
  })
  .then(function () {
    let tag = {
      name: name,
      post: postId
    };

    TagModel.create(tag)
      .then(function () {
        req.flash('success', '添加标签成功');
        // 添加标签成功后跳转到上一页
        res.redirect('back');
      })
      // catch 以后会跳转到 error 中间件，不会执行下面的代码
      .catch(next);
  })
  .catch(function (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  });

});

// GET /tags/:tagId/remove 删除一条标签
router.get('/:tagId/remove', checkLogin, function(req, res, next) {
  let tagId = req.params.tagId;

  TagModel.delTagById(tagId)
    .then(function () {
      req.flash('success', '删除标签成功');
      // 删除成功后跳转到上一页
      res.redirect('back');
    })
    .catch(next);
});

// GET /tags/:name/page/:page 点击标签查看文章，按文章创建时间降序，而不是标签创建时间
router.get('/:name/page/:page', function(req, res, next) {
  let name = req.params.name;
  let page = req.params.page;

  if (!page) {
    page = 1;
  }
  let pageSize = 3;

  TagModel.getPostsByTagName(name, page)
    .then(function (result) {
      let posts = result[0];
      posts.currentPage = page;
      posts.total = parseInt((result[1] - 1) / pageSize + 1);
      return posts;
    })
    .then(function (posts) {
      let currentPage = posts.currentPage, total = posts.total;
      return Promise.all(
        posts.map(function (post) {
          return TagModel.getTagsByPostId(post._id).then(function (tags) {
            post.tags = tags;
            return post;
          });
        })
      )
      .then(function (posts) {
        return Promise.all(posts.map(function (post) {
          return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
            post.commentsCount = commentsCount;
            return post;
          });
        }));
      })
      .then(function (posts) {
        posts.currentPage = currentPage;
        posts.total = total;
        return posts;
      });
    })
    .then(function (posts) {
      res.render('posts', {
        posts: posts,
        tag: name
      });
    })
    .catch(next);
});

module.exports = router;