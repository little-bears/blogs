let db = require("../model/db.js");
let md5 = require("../model/md5.js");
let { User } = require("../model/User.js");
let mongoose = require("mongoose");
let { Blog } = require("../model/Blog.js");
let { Classify } = require("../model/Classify.js");

// 初始化项目-添加系统默认用户
exports.init = function (req, res, next) {
  console.log('服务器启动成功，想你访问地址：http://localhost:3001');
  User.countDocuments({}, function (err, total) {
    if (err) {
      res.send("查找数据总条数发生未知错误");
    } else {
      if (total === 0) {
        User.create({
          name: 'admin',
          passwd: md5.cryption(md5.cryption('admin2020'))
        }, function (err, docs) {
          if (err) {
            console.log('----------------------')
            console.log('添加User模型失败！')
            console.log('----------------------')
          } else {
            console.log('----------------------')
            console.log('添加User模型成功~~~')
            console.log('----------------------')
          }
        });
      }
    }
  })
}

// 富文本编辑器
exports.doUeditor = function (req, res, next) {
  //客户端上传文件设置
  var imgDir = '/images/ueditor/'
  var ActionType = req.query.action;
  if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
    var file_url = imgDir; //默认图片上传地址
    /*其他上传格式的地址*/
    if (ActionType === 'uploadfile') {
      file_url = '/file/ueditor/'; //附件
    }
    if (ActionType === 'uploadvideo') {
      file_url = '/video/ueditor/'; //视频
    }
    res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    res.setHeader('Content-Type', 'text/html');
  }
  //  客户端发起图片列表请求
  else if (req.query.action === 'listimage') {
    var dir_url = imgDir;
    res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
  }
  // 客户端发起其它请求
  else {
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/ueditor/nodejs/config.json');
  }
}
// 渲染页面
// 1、前端
// (1) 渲染首页
exports.showIndex = function (req, res, next) {
  let classifyMap = {};
  Classify.find().sort({
    order: 1
  }).exec(function (err, classify) {
    if (err) {
      res.send(err);
    } else {
      classify.forEach(function (item) {
        classifyMap[item._id] = item.classify
      })
      let where = {
        ispublish: true,
        isdelete: false
      };
      Blog.find(where).sort({
        updatetime: -1
      }).limit(5).exec(function (err, docs) {
        if (err) {
          res.send(err);
        } else {
          res.render("index", {
            data: {
              currentUrl: 'index',
              docs,
              classify,
              classifyMap
            }
          })
        }
      });
    }
  });
}
// (2) 渲染笔记列表页
exports.showBlog = function (req, res, next) {
  let pageSize = 6; // 分页条数
  let classifyMap = {};
  Classify.find().sort({
    order: 1
  }).exec(function (err, classify) {
    if (err) {
      res.send(err);
    } else {
      let allPulishCount = 0;
      classify.forEach(function (item) {
        classifyMap[item._id] = item.classify;
        allPulishCount += item.publishtotal;
      })
      let where = {
        ispublish: true,
        isdelete: false
      };
      if (req.query.classify) {
        where.classify = req.query.classify
      }
      let page; // 请求页数
      if (req.query.page) {
        page = req.query.page < 1 ? 1 : req.query.page;
      } else {
        page = 1;
      }
      Blog.find(where).countDocuments().exec(function (err, total) {
        let pageTotal = Math.floor((total + pageSize - 1) / pageSize);
        let currentPage = page > pageTotal ? pageTotal : page;
        if (err) {
          res.send(err);
        } else {
          if (total <= 0) {
            res.render("blog", {
              data: {
                currentUrl: 'blog',
                docs: [],
                classify,
                classifyMap,
                currentId: req.query.classify,
                pageTotal: 0,
                currentPage: 0,
                allPulishCount
              }
            })
          } else {
            Blog.find(where).skip((currentPage - 1) * pageSize).limit(pageSize).sort({
              createtime: -1
            }).exec(function (err, docs) {
              if (err) {
                res.send(err);
              } else {
                res.render("blog", {
                  data: {
                    currentUrl: 'blog',
                    docs,
                    classify,
                    classifyMap,
                    currentId: req.query.classify,
                    pageTotal,
                    currentPage,
                    allPulishCount
                  }
                })
              }
            });
          }
        }
      })
    }
  });
}
// (3) 渲染笔记详情页
exports.getDetail = function (req, res, next) {
  if (req.params.id && req.params.id.length != 24) {
    res.render("detail", {
      data: {
        currentUrl: 'detail',
        article: null
      }
    })
  } else {
    Blog.find({
      _id: mongoose.Types.ObjectId(req.params.id)
    }, function (err, docs) {
      if (err) {
        res.send(err);
      } else {
        if (docs.length > 0) {
          let classify = docs[0].classify;
          Blog.find({
            ispublish: true,
            isdelete: false,
            classify
          }).sort({
            updatetime: -1
          }).limit(8).exec(function (err, list) {
            if (err) {
              res.send(err)
            } else {
              res.render("detail", {
                data: {
                  currentUrl: 'detail',
                  article: docs[0],
                  list
                }
              })
            }
          })
        } else {
          res.render("detail", {
            data: {
              currentUrl: 'detail',
              article: null
            }
          })
        }
      }
    });
  }
}
// (4) 渲染简历页
exports.showResume = function (req, res, next) {
  res.render("resume", {
    data: {
      currentUrl: 'resume'
    }
  })
}

// 2、后端
// 判断系统是否登录
exports.checkSession = function (req, res, next) {
  if (req.session && req.session.userName) {
    next()
  } else {
    res.render('back-admin')
  }
}
// (1) 渲染后台添加笔记页
exports.showBlogEdit = function (req, res, next) {
  Classify.find().sort({
    createtime: -1
  }).exec(function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      let id = req.query.id;
      if (id) { // 修改笔记
        Blog.find({
          _id: mongoose.Types.ObjectId(id)
        }, function (err, article) {
          if (err) {
            res.send(err);
          } else {
            res.render("back-layout", {
              tplt: "back-blog-edit",
              data: {
                classify: docs,
                article: article[0]
              }
            })
          }
        });
      } else { // 新增笔记
        res.render("back-layout", {
          tplt: "back-blog-edit",
          data: {
            classify: docs,
            article: {}
          }
        })
      }

    }
  });
}
// (2) 渲染笔记分类页
exports.showBlogClassify = function (req, res, next) {
  Classify.find().sort({
    order: 1
  }).exec(function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      res.render("back-layout", {
        tplt: "back-blog-classify",
        data: {
          docs
        }
      })
    }
  });
}
// (3) 渲染后台笔记管理页
exports.showBlogList = function (req, res, next) {
  let pageSize = 10;
  let classifyMap = {};
  Classify.find().exec(function (err, classify) {
    if (err) {
      res.send(err);
    } else {
      classify.forEach(function (item) {
        classifyMap[item._id] = item.classify
      })
      let where = { isdelete: false };
      if (req.query.classify) {
        where.classify = req.query.classify
      }
      let page; // 请求页数
      if (req.query.page) {
        page = req.query.page < 1 ? 1 : req.query.page;
      } else {
        page = 1;
      }
      Blog.find(where).countDocuments().exec(function (err, total) {
        let pageTotal = Math.floor((total + pageSize - 1) / pageSize);
        let currentPage = page > pageTotal ? pageTotal : page;
        if (err) {
          res.send(err);
        } else {
          if (total <= 0) {
            res.render("back-layout", {
              tplt: "back-blog",
              data: {
                docs: [],
                classify,
                queryClassify: req.query.classify || '',
                classifyMap,
                pageTotal: 0,
                currentPage: 0
              }
            })
          } else {
            Blog.find(where).skip((currentPage - 1) * pageSize).limit(pageSize).sort({
              ispublish: 1,
              createtime: -1,
            }).exec(function (err, docs) {
              if (err) {
                res.send(err);
              } else {
                res.render("back-layout", {
                  tplt: "back-blog",
                  data: {
                    docs,
                    classify,
                    queryClassify: req.query.classify || '',
                    classifyMap,
                    pageTotal,
                    currentPage
                  }
                })
              }
            })
          }
        }
      })
    }
  })
}
// (4) 渲染后台首页
exports.showBackIndex = function (req, res, next) {
  let classifyMap = {},
    groupResult = {};
  Classify.find().exec(function (err, classify) {
    if (err) {
      res.send(err);
    } else {
      classify.forEach(function (item) {
        classifyMap[item._id] = item.classify
      })
      for (let key in classifyMap) {
        groupResult[classifyMap[key]] = 0;
      }
      Blog.find({ isdelete: false }).sort({ updatetime: -1 }).exec(function (err, docs) {
        if (err) {
          res.send(err);
        } else {
          docs.forEach(function (item) {
            groupResult[classifyMap[item.classify]]++;
          })
          let data = {
            list: docs.slice(0, 10),
            xData: Object.keys(groupResult),
            yData: Object.values(groupResult)
          }
          res.render("back-layout", {
            tplt: "back-index",
            data
          })
        }
      })
    }
  })
}
// (5) 渲染后台登录页
exports.showAdmin = function (req, res, next) {
  if (req.session && req.session.userName) {
    let classifyMap = {},
      groupResult = {};
    Classify.find().exec(function (err, classify) {
      if (err) {
        res.send(err);
      } else {
        classify.forEach(function (item) {
          classifyMap[item._id] = item.classify
        })
        for (let key in classifyMap) {
          groupResult[classifyMap[key]] = 0;
        }
        Blog.find({ isdelete: false }).sort({ updatetime: -1 }).exec(function (err, docs) {
          if (err) {
            res.send(err);
          } else {
            docs.forEach(function (item) {
              groupResult[classifyMap[item.classify]]++;
            })
            let data = {
              list: docs.slice(0, 10),
              xData: Object.keys(groupResult),
              yData: Object.values(groupResult)
            }
            res.render("back-layout", {
              tplt: "back-index",
              data
            })
          }
        })
      }
    })
  } else {
    res.render("back-admin")
  }
}
// (6) 渲染后台笔记回收站页
exports.showBlogBin = function (req, res, next) {
  let classifyMap = {};
  Classify.find().exec(function (err, classify) {
    if (err) {
      res.send(err);
    } else {
      classify.forEach(function (item) {
        classifyMap[item._id] = item.classify
      })
      Blog.find({ isdelete: true }).sort({
        createtime: -1
      }).exec(function (err, docs) {
        if (err) {
          res.send(err);
        } else {
          res.render("back-layout", {
            tplt: "back-blog-bin",
            data: {
              docs,
              classifyMap
            }
          })
        }
      });
    }
  })
}
// 数据接口
// (1) 添加笔记分类
exports.saveClassify = function (req, res, next) {
  let id = req.body.id;
  if (id) { // 修改分类
    Classify.updateOne({
      _id: mongoose.Types.ObjectId(id)
    }, {
      $set: {
        classify: req.body.classify,
        order: req.body.order,
        publishtotal: req.body.publishtotal
      }
    }, function (err, docs) {
      if (err) {
        res.send({
          code: 1,
          msg: "修改失败"
        });
      } else {
        res.send({
          code: 0,
          msg: "修改成功"
        });
      }
    })
  } else { // 新增分类
    Classify.find({ classify: req.body.classify }).exec(function (err, docs) {
      if (err) {
        res.send({
          code: 1,
          msg: "添加失败"
        });
      } else {
        if (docs.length > 0) {
          res.send({
            code: 1,
            msg: "添加失败，分类已存在~"
          });
        } else {
          Classify.create({
            classify: req.body.classify,
            order: req.body.order,
            publishtotal: req.body.publishtotal
          }, function (err, docs) {
            if (err) {
              res.send({
                code: 1,
                msg: "添加失败"
              });
            } else {
              res.send({
                code: 0,
                msg: "添加成功"
              });
            }
          });
        }
      }
    })
  }
}
// (2) 删除笔记分类
exports.deleteClassify = function (req, res, next) {
  Blog.find({ classify: req.body.id }).exec(function (err, docs) {
    if (err) {
      res.send({
        code: 1,
        msg: "删除失败"
      });
    } else {
      if (docs.length > 0) {
        res.send({
          code: 1,
          msg: "该分类下存在文章，删除失败"
        });
      } else {
        Classify.deleteOne({
          _id: mongoose.Types.ObjectId(req.body.id)
        }, function (err) {
          if (err) {
            res.send({
              code: 1,
              msg: "删除失败"
            });
          } else {
            res.send({
              code: 0,
              msg: "删除成功"
            });
          }
        });
      }
    }
  })
}
// (3) 添加笔记
exports.saveBlog = function (req, res, next) {
  let id = req.body.id;
  if (id) { // 修改笔记
    Blog.find({ _id: mongoose.Types.ObjectId(id) }).exec(function (err, docs) {
      if (err) {
        res.send(err)
      } else {
        let originDoc = docs[0];
        Blog.updateOne({
          _id: mongoose.Types.ObjectId(id)
        }, {
          $set: {
            title: req.body.title,
            classify: req.body.classify,
            ispublish: req.body.ispublish,
            isdelete: req.body.isdelete,
            content: req.body.content
          }
        }, function (err, docs) {
          if (err) {
            res.send({
              code: 1,
              msg: "修改失败"
            });
          } else {
            res.send({
              code: 0,
              msg: "修改成功"
            });
          }
        })
        if (JSON.parse(originDoc.ispublish) != JSON.parse(req.body.ispublish)) { // 发布状态发生变化
          if (JSON.parse(req.body.ispublish)) { // 未发布->发布
            Classify.updateOne({
              _id: mongoose.Types.ObjectId(req.body.classify)
            }, {
              $inc: {
                publishtotal: 1
              }
            }).exec(function (err, result) {
              console.log(result)
            })
          } else { // 发布->未发布
            Classify.updateOne({
              _id: mongoose.Types.ObjectId(req.body.classify)
            }, {
              $inc: {
                publishtotal: -1
              }
            }).exec(function (err, result) {
              console.log(result)
            })
          }
        }
      }
    })
  } else { // 添加笔记
    Blog.create({
      title: req.body.title,
      classify: req.body.classify,
      ispublish: req.body.ispublish,
      isdelete: req.body.isdelete,
      content: req.body.content
    }, function (err, docs) {
      if (err) {
        res.send({
          code: 1,
          msg: "提交失败"
        });
      } else {
        res.send({
          code: 0,
          msg: "提交成功"
        });
      }
    });
    if (JSON.parse(req.body.ispublish)) { //发布博客，更新该分类文章发布数量
      Classify.updateOne({
        _id: mongoose.Types.ObjectId(req.body.classify)
      }, {
        $inc: {
          publishtotal: 1
        }
      }).exec(function (err, result) {
        console.log(result)
      })
    }
  }
}
// (4) 删除笔记 - 标记删除
exports.deleteBlog = function (req, res, next) {
  let id = req.body.id;
  Blog.find({ _id: mongoose.Types.ObjectId(id) }).exec(function(err, docs){
    if(err){
      res.send(err)
    }else{
      let originDoc = docs[0];
      Blog.updateOne({
        _id: mongoose.Types.ObjectId(id)
      }, {
        $set: {
          isdelete: true
        }
      }, function (err) {
        if (err) {
          res.send({
            code: 1,
            msg: "删除失败"
          });
        } else {
          res.send({
            code: 0,
            msg: "删除成功"
          });
        }
      });
      if(JSON.parse(originDoc.ispublish)){ // 删除发布状态的文章，更新该分类文章的发布数量
        Classify.updateOne({
          _id: mongoose.Types.ObjectId(originDoc.classify)
        }, {
          $inc: {
            publishtotal: -1
          }
        }).exec(function (err, result) {
          console.log(result)
        })
      }
    }
  })
}
// (5) 后台登录
exports.AdminLogin = function (req, res, next) {
  let md5pwd = md5.cryption(md5.cryption(req.body.passwd));
  let where = {
    name: req.body.name,
    passwd: md5pwd,
  };
  User.find(where, function (err, docs) {
    if (err) {
      res.send({
        code: 1,
        msg: "查找发生未知错误~"
      });
    } else {
      if (docs.length > 0) {
        // 设置session - 保存当前用户姓名
        req.session.userName = req.body.name;
        res.send({
          code: 0,
          msg: '登录成功'
        });

      } else {
        res.send({
          code: 1,
          msg: "登录失败,账号不存在"
        });
      }
    }
  })
}
// (6) 恢复笔记
exports.recoverBlog = function (req, res, next) {
  let id = req.body.id;
  Blog.find({ _id: mongoose.Types.ObjectId(id) }).exec(function(err, docs){
    if(err){
      res.send(err)
    }else{
      let originDoc = docs[0];
      Blog.updateOne({
        _id: mongoose.Types.ObjectId(id)
      }, {
        $set: {
          isdelete: false
        }
      }, function (err) {
        if (err) {
          res.send({
            code: 1,
            msg: "恢复失败"
          });
        } else {
          res.send({
            code: 0,
            msg: "恢复成功"
          });
        }
      });
      if(JSON.parse(originDoc.ispublish)){ // 恢复发布状态的文章，更新该分类文章的发布数量
        Classify.updateOne({
          _id: mongoose.Types.ObjectId(originDoc.classify)
        }, {
          $inc: {
            publishtotal: 1
          }
        }).exec(function (err, result) {
          console.log(result)
        })
      }
    }
  })
}
// (7) 删除笔记 - 永久删除
exports.destroyBlog = function (req, res, next) {
  Blog.deleteOne({
    _id: mongoose.Types.ObjectId(req.body.id)
  }, function (err) {
    if (err) {
      res.send({
        code: 1,
        msg: "删除失败"
      });
    } else {
      res.send({
        code: 0,
        msg: "删除成功"
      });
    }
  });
}