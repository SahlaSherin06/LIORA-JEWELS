const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  category:    { type: String, required: true },
  image:       { type: String },
  rating:      { type: Number, default: 0 },
  description: { type: String },
  reviews:     { type: Array, default: [] },
  stock:       { type: Number, default: 0 },
  isDeleted:   { type: Boolean, default: false }
}, { timestamps: true });

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
  }
});

module.exports = mongoose.model('Product', productSchema);