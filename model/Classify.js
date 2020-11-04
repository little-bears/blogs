let mongoose = require("mongoose");
let ClassifySchema = mongoose.Schema({
    classify: String,
    order: Number
}, {
    timestamps: {
        createdAt: "createtime",
        updatedAt: "updatetime",
    }
});
let Classify = mongoose.model("classify", ClassifySchema);

exports.Classify = Classify;