let mongoose = require("mongoose");
let ClassifySchema = mongoose.Schema({
    classify: String,
    order: {
      type: Number,
      default: 999
    },
    publishtotal: {
      type: Number,
      default: 0
    }
  }, {
    timestamps: {
        createdAt: "createtime",
        updatedAt: "updatetime",
    }
});
let Classify = mongoose.model("classify", ClassifySchema);

exports.Classify = Classify;