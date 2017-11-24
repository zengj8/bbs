## bbs

使用 Express + MongoDB 搭建多人博客

## 开发环境

- Node.js: `7.10.0`
- MongoDB: `3.4.3`
- Express: `4.14.0`

## 功能及路由设计

1. 注册
    1. 注册页：`GET /signup`
    2. 注册（包含上传头像）：`POST /signup`
2. 登录
    1. 登录页：`GET /signin`
    2. 登录：`POST /signin`
3. 登出：`GET /signout`
4. 查看文章
    1. 主页：`GET /posts`
    2. 个人主页：`GET /posts?author=xxx`
    3. 查看一篇文章（包含留言）：`GET /posts/:postId/page/:page`
5. 发表文章
    1. 发表文章页：`GET /posts/create`
    2. 发表文章：`POST /posts/create`
6. 修改文章
    1. 修改文章页：`GET /posts/:postId/edit`
    2. 修改文章：`POST /posts/:postId/edit`
7. 删除文章：`GET /posts/:postId/remove`
8. 留言
    1. 创建留言：`POST /comments/:postId/comment`
    2. 删除留言：`GET /comments/:commentId/remove`
9. 回复
    1. 创建回复：`POST /replys/:targetId/reply`
    2. 删除回复：`GET /replys/:replyId/remove`
10. 标签
    1. 创建标签：`POST /tags/:postId/tag`
    2. 删除标签：`GET /tags/:tagId/remove`
    3. 点击标签查看文章：`GET /tags/:name/page/:page`
   
## ps
在 [nswbmw](https://github.com/nswbmw/N-blog) 的基础上修改的（前端懒得搞 - -）
纯后端渲染实现
后续考虑用自己的框架完善
