let express = require("express");
const session = require("express-session");
let app = express();
let path = require("path");
// 注册全局格式化时间函数
let moment = require('moment');
app.locals.dateFormat = function (date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}
app.locals.YMDFormat = function (date) {
  if (!date) date = new Date();
  return moment(date).format('YYYY-MM-DD');
}
// 引入JSON解析中间件
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

//配置中间件
app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: ({ maxAge: 8 * 60 * 60 * 1000, secure: false })
}));

// 引入第三方模块解析formData请求
let multipart = require('connect-multiparty')
let multipartyMiddleware = multipart();

// 引入ueditor
let ueditor = require('ueditor');
// 引入路由文件
let router = require("./router/index.js");
// 设置静态资源目录
app.use(express.static("./public"));
// 设置ejs模板引擎
app.set("view engine", "ejs");

// 设置允许跨域访问
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});

// 设置中间件处理ueditor的后台请求
app.use("/ueditor/getImg", ueditor(path.join(__dirname, "public"), router.doUeditor));

// 页面路由
// 1、前端
// (1) 渲染首页
app.get("/", router.showIndex);
// (2) 渲染笔记列表页
app.get("/blog", router.showBlog);
// (3) 渲染笔记详情页
app.get("/detail", router.getDetail);
// (4) 渲染简历页
app.get("/resume", router.showResume);
// (5) 代码在线测试页
app.get("/code", router.showCode);

// 2、后端
// (1) 渲染后台创建笔记页
app.get("/back-blog-edit", router.checkSession, router.showBlogEdit);
// (2) 渲染笔记分类页
app.get("/back-blog-classify", router.checkSession, router.showBlogClassify);
// (3) 渲染后台笔记管理页
app.get("/back-blog", router.checkSession, router.showBlogList);
// (4) 渲染后台首页
app.get("/back-index", router.checkSession, router.showBackIndex);
// (5) 渲染后台登录页
app.get("/admin", router.showAdmin);
// (6) 渲染后台笔记回收站
app.get("/back-blog-bin", router.checkSession, router.showBlogBin);
// (7)渲染代码列表页
app.get("/back-code", router.checkSession, router.showCodeList);
// (8) 渲染代码编辑代码页
app.get("/back-code-edit", router.checkSession, router.showCodeEidt);


// 数据接口
// (1) 创建笔记分类
app.post("/saveClassify", multipartyMiddleware, router.saveClassify);
// (2) 删除笔记分类
app.post("/deleteClassify", router.deleteClassify);
// (3) 创建笔记
app.post("/saveBlog", multipartyMiddleware, router.saveBlog);
// (4) 删除笔记
app.post("/deleteBlog", router.deleteBlog);
// (5) 后台登录
app.post("/admin", router.AdminLogin);
// (6) 恢复笔记
app.post("/recoverBlog", router.recoverBlog);
// (7) 永久删除笔记
app.post("/destroyBlog", router.destroyBlog);
// (8) 创建代码片段
app.post("/saveCode", multipartyMiddleware, router.saveCode);
// (9) 删除代码片段
app.post("/deleteCode", router.deleteCode);

// 配置404页面
app.use(function(req,res){
	res.render("404");
})

// 设置服务器端口
app.listen(3001, router.init);