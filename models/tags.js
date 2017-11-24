let Tag = require('../lib/mongo').Tag;

let moment = require('moment');
let objectIdToTimestamp = require('objectid-to-timestamp');

module.exports = {
  // 创建一个标签
  create: function create(tag) {
    return Tag.create(tag).exec();
  },

  // 通过标签 id 删除一个标签
  delTagById: function delTagById(tagId) {
    return Tag.remove({ _id: tagId }).exec();
  },

  // 通过文章 id 和标签名获取标签信息
  getTagByName: function getTagByName(postId, name) {
    return Tag
      .findOne({ post: postId, name: name })
      .exec();
  },

  // 通过文章 id 获取该文章的标签数
  getTagsCount: function getTagsCount(postId) {
    return Tag.count({ post: postId }).exec();
  },

  // 通过标签名获取拥有此类标签的所有文章
  getPostsByTagName: function getPostsByTagName(name, page) {
    if (!page) {
      page = 1;
    }
    let pageSize = 3;

    return Promise.all([
      Tag
        .find({ name: name }, { skip: (page - 1) * pageSize, limit: pageSize })
        .populate({ path: 'post', model: 'Post' })    // 外键
        .populate({ path: 'post.author', model: 'User' })
        .exec()
        .then(function (posts) {
          return posts.map(function (item) {
            item = item.post;
            item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
            return item;
          });
        }),
      Tag
        .count({ name: name })
        .exec()
    ]);
  },

  // 根据文章 id 删除文章下的所有标签
  delTagsByPostId: function delTagsByPostId(postId) {
    return Tag
      .remove({ post: postId })
      .exec();
  },

  // 根据文章 id 获取文章下的所有标签
  getTagsByPostId: function getTagsByPostId(postId) {
    return Tag
      .find({ post: postId })
      .exec();
  }
};
