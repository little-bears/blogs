let mongoose = require("mongoose");
let BlogSchema = mongoose.Schema({
    title: String,
    classify: String, // 保存分类id
    content: String,
    ispublish: {
        type: Boolean,
        default: true
    },
    isdelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: "createtime",
        updatedAt: "updatetime",
    }
});
let Blog = mongoose.model("blog", BlogSchema);

exports.Blog = Blog;