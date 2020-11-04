let mongoose = require("mongoose");
let UserSchema = mongoose.Schema({
    name: String,
    passwd: String,
}, {
    timestamps: {
        createdAt: "createtime",
        updatedAt: "updatetime",
    }
});
let User = mongoose.model("user", UserSchema);

exports.User = User;