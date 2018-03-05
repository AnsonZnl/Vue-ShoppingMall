var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var produtSchema = new Schema({
	"productId":String,
	"productName":String,
	"productNum":Number,
	"checked":Number,
	"productUrl":String,
	"salePrice":Number,
	"productImage":String
});

module.exports = mongoose.model('Good',produtSchema);