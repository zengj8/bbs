let marked = require('marked');
let Comment = require('../lib/mongo').Comment;
let ReplyModel = require('./replys');

// 将 comment 的 content 从 markdown 转换成 html
Comment.plugin('contentToHtml', {
  afterFind: function (comments) {
    return comments.map(function (comment) {
      comment.content = marked(comment.content);
      return comment;
    });
  }
});

module.exports = {
  // 创建一个留言
  create: function create(comment) {
    return Comment.create(comment).exec();
  },

  // 通过用户 id 和留言 id 删除一个留言
  delCommentById: function delCommentById(commentId, author) {
    return Comment.remove({ author: author, _id: commentId })
      .exec()
      .then(function (res) {
        // 文章删除后，再删除该文章下的所有留言
        if (res.result.ok && res.result.n > 0) {      // n为删除的数据数
          return ReplyModel.delReplysByCommentId(commentId);
        }
      });
  },

  // 通过文章 id 删除该文章下所有留言
  delCommentsByPostId: function delCommentsByPostId(postId, author) {
    // 先拿到评论 id，然后再删除这些评论下的所有留言
    return Comment.find({ post: postId }, { _id: 1 })
      .then( (comments) => {
        // 这两个地方必须使用箭头函数或者 hack 写法，否则 this 指向全局对象
        return Promise.all(comments.map( (comment) => {
          return this.delCommentById(comment._id, author);
        }));
      });
  },

  // 通过文章 id 获取该文章下所有留言，按留言创建时间升序
  getComments: function getComments(postId, page) {
    let pageSize = 5;
    return Promise.all([
      Comment
        .find({ post: postId }, { skip: (page - 1) * pageSize, limit: pageSize })
        .populate({ path: 'author', model: 'User' })    // 外键
        .sort({ _id: 1 })
        .addCreatedAt()
        .contentToHtml()
        .exec(),
      Comment
        .count({ post: postId })
        .exec()
    ]);
  },

  // 通过文章 id 获取该文章下留言数
  getCommentsCount: function getCommentsCount(postId) {
    return Comment.count({ post: postId }).exec();
  }
};
