let config = require('config-lite')(__dirname);
let Mongolass = require('mongolass');
let mongolass = new Mongolass();
mongolass.connect(config.mongodb);

let moment = require('moment');
let objectIdToTimestamp = require('objectid-to-timestamp');

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
  afterFind: function (results) {
    results.forEach(function (item) {
      item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
    });
    return results;
  },
  afterFindOne: function (result) {
    if (result) {
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
    }
    return result;
  }
});

exports.User = mongolass.model('User', {
  name: { type: 'string' },
  password: { type: 'string' },
  avatar: { type: 'string' },
  gender: { type: 'string', enum: ['m', 'f', 'x'] },
  bio: { type: 'string' }
});
exports.User.index({ name: 1 }, { unique: true }).exec();// 根据用户名找到用户，用户名全局唯一

exports.Post = mongolass.model('Post', {
  author: { type: Mongolass.Types.ObjectId },
  title: { type: 'string' },
  content: { type: 'string' },
  pv: { type: 'number' }
});
exports.Post.index({ author: 1, _id: -1 }).exec();// 按创建时间降序查看用户的文章列表

exports.Comment = mongolass.model('Comment', {
  author: { type: Mongolass.Types.ObjectId },
  content: { type: 'string' },
  post: { type: Mongolass.Types.ObjectId }
});
exports.Comment.index({ post: 1, _id: 1 }).exec();// 通过文章 id 获取该文章下所有留言，按留言创建时间升序
exports.Comment.index({ author: 1, _id: 1 }).exec();// 通过用户 id 和留言 id 删除一个留言

exports.Reply = mongolass.model('Reply', {
  fromAuthor: { type: Mongolass.Types.ObjectId },// 评论者
  toAuthor: { type: Mongolass.Types.ObjectId },// 被评论者
  content: { type: 'string' },
  commentId: { type: Mongolass.Types.ObjectId },// 根评论
  targetId: { type: Mongolass.Types.ObjectId },// 被评论的 Comment 或 Reply 的 id
  replyType: { type: 'number', enum: [0, 1] },// 0 评论 Comment 1 评论 Reply
});
exports.Reply.index({ commentId: 1, _id: 1 }).exec();// 通过评论 id 获取该评论下所有回复，按回复创建时间升序
exports.Reply.index({ fromAuthor: 1, _id: 1 }).exec();// 通过用户 id 和回复 id 删除一个回复

exports.Tag = mongolass.model('Tag', {
  post: { type: Mongolass.Types.ObjectId },
  name: { type: 'string', maxlength: 10 }
});
exports.Tag.index({ post: -1, _id: 1 }).exec();// 通过文章 id 获取该文章的所有标签，按标签创建时间升序
exports.Tag.index({ name: 1, post: -1 }).exec();// 通过标签名获取所有标签，按文章创建时间降序
