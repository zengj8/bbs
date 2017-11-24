let express = require('express');
let router = express.Router();

let CommentModel = require('../models/comments');
let checkLogin = require('../middlewares/check').checkLogin;

// POST /comments/:postId/comment 创建一条留言
router.post('/:postId/comment', checkLogin, function(req, res, next) {
  let author = req.session.user._id;
  let postId = req.params.postId;
  let content = req.fields.content;
  let comment = {
    author: author,
    post: postId,
    content: content
  };

  CommentModel.create(comment)
    .then(function () {
      req.flash('success', '留言成功');
      // 留言成功后跳转到上一页
      res.redirect('back');
    })
    .catch(next);
});

// GET /comments/:commentId/remove 删除一条留言
router.get('/:commentId/remove', checkLogin, function(req, res, next) {
  let commentId = req.params.commentId;
  let author = req.session.user._id;

  CommentModel.delCommentById(commentId, author)
    .then(function () {
      req.flash('success', '删除留言成功');
      // 删除成功后跳转到上一页
      res.redirect('back');
    })
    .catch(next);
});

module.exports = router;
