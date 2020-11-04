let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blog', { useUnifiedTopology: true, useNewUrlParser: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("数据库已连接~");
});
exports.db = db;