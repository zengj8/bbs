let express = require('express');
let router = express.Router();
let path = require('path');
let fs = require('fs');

let UserModel = require('../models/users');
let checkLogin = require('../middlewares/check').checkLogin;

// GET /modify 修改资料页
//   eg: GET /modify?author=xxx
router.get('/', function(req, res, next) {
  let author = req.query.author;

  UserModel.getUserById(author)
    .then(function (user) {
      res.render('modify', {
        user: user
      });
    })
    .catch(next);
});

// POST /modify 修改资料
router.post('/', checkLogin, function(req, res, next) {
  let name = req.fields.name;
  let gender = req.fields.gender;
  let bio = req.fields.bio;
  let avatar = null;
  if (req.files.avatar.name) {
    avatar = req.files.avatar.path.split(path.sep).pop();
  }

  // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('名字请限制在 1-10 个字符');
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('性别只能是 m、f 或 x');
    }
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('个人简介请限制在 1-30 个字符');
    }
  } catch (e) {
    // 修改资料失败，异步删除上传的头像
    fs.unlink(req.files.avatar.path);
    req.flash('error', e.message);
    return res.redirect(`/modify?author=${req.session.user._id}`);
  }

  // 待写入数据库的用户信息
  let updateUser = {};
  if (name) {
    updateUser.name = name;
  }
  if (gender) {
    updateUser.gender = gender;
  }
  if (bio) {
    updateUser.bio = bio;
  }
  if (avatar) {
    updateUser.avatar = avatar;
  }

  // 用户信息写入数据库
  UserModel.updateUserById(req.session.user._id, updateUser)
    .then(function (result) {
      // 写入 flash
      req.flash('success', '修改资料成功');
      // express-formidable会默认上传一个文件
      if (!avatar) {
        // 没有回调函数会报DeprecationWarning
        fs.unlink(req.files.avatar.path, function(err) {
          if (err) {
            return next(err);
          }
        });
      }
      // 跳转到首页
      res.redirect('/posts');
    })
    .catch(function (e) {
      // 修改资料失败，异步删除上传的头像
      fs.unlink(req.files.avatar.path);
      // 用户名被占用则跳回注册页，而不是错误页
      if (e.message.match('E11000 duplicate key')) {
        req.flash('error', '用户名已被占用');
        return res.redirect(`/modify?author=${req.session.user._id}`);
      }
      next(e);
    });
});

module.exports = router;
