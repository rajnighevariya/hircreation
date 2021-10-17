const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    imagurl: String,
    imagetitle: String
});

module.exports = mongoose.model('product', productSchema);