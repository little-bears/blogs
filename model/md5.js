let crypto = require("crypto");
exports.cryption = function (possWd) {
    let md5 = crypto.createHash("md5");
    return md5.update(possWd).digest("base64");
}