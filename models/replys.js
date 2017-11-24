let marked = require('marked');
let Reply = require('../lib/mongo').Reply;

// 将 reply 的 content 从 markdown 转换成 html
Reply.plugin('contentToHtml', {
  afterFind: function (replys) {
    return replys.map(function (reply) {
      reply.content = marked(reply.content);
      return reply;
    });
  }
});

module.exports = {
  // 创建一个回复
  create: function create(reply) {
    return Reply.create(reply).exec();
  },

  // 通过用户 id 和回复 id 删除一个回复
  delReplyById: function delReplyById(replyId, author) {
    return Reply.remove({ fromAuthor: author, _id: replyId }).exec();
  },

  // 通过评论 id 删除该评论下所有回复
  delReplysByCommentId: function delReplysByCommentId(commentId) {
    return Reply.remove({ commentId: commentId }).exec();
  },

  // 通过评论 id 获取该评论下所有回复，按回复创建时间升序
  getReplys: function getReplys(commentId) {
    return Promise.all([
      Reply
        .find({ commentId: commentId })
        .populate({ path: 'fromAuthor', model: 'User' })    // 外键
        .populate({ path: 'toAuthor', model: 'User' })
        .sort({ _id: 1 })
        .addCreatedAt()
        .contentToHtml()
        .exec(),
      Reply
        .count({ commentId: commentId })
        .exec()
    ]);
  },

  // 通过评论 id 获取该评论下回复数
  getReplysCount: function getReplysCount(commentId) {
    return Reply.count({ commentId: commentId }).exec();
  }
};
