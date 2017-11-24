let express = require('express');
let router = express.Router();

let ReplyModel = require('../models/replys');
let checkLogin = require('../middlewares/check').checkLogin;

// POST /replys/:targetId/reply 创建一条回复
router.post('/:targetId/reply', checkLogin, function(req, res, next) {
  let fromAuthor = req.session.user._id;
  let replyType = req.fields.replyType;
  let targetId = req.params.targetId;
  let commentId = req.fields.commentId;
  let content = req.fields.content;
  let toAuthor = req.fields.toAuthor;

  let reply = {
    fromAuthor: fromAuthor,
    targetId: targetId,
    content: content,
    replyType: parseInt(replyType),
    commentId: commentId,
    toAuthor: toAuthor
  };

  ReplyModel.create(reply)
    .then(function () {
      req.flash('success', '留言成功');
      // 留言成功后跳转到上一页
      res.redirect('back');
    })
    .catch(next);
});

// GET /replys/:replyId/remove 删除一条回复
router.get('/:replyId/remove', checkLogin, function(req, res, next) {
  let replyId = req.params.replyId;
  let author = req.session.user._id;

  ReplyModel.delReplyById(replyId, author)
    .then(function () {
      req.flash('success', '删除留言成功');
      // 删除成功后跳转到上一页
      res.redirect('back');
    })
    .catch(next);
});

module.exports = router;
