let mongoose = require("mongoose");
let CodeSchema = mongoose.Schema({
  title: String,
  code: String,
}, {
  timestamps: {
    createdAt: "createtime",
    updatedAt: "updatetime",
  }
});
let Code = mongoose.model("code", CodeSchema);

exports.Code = Code;