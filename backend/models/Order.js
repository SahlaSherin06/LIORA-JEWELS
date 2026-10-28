const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:  { type: String },
  items:     { type: Array, required: true },
  total:     { type: Number, required: true },
  shippingInfo: {
    firstName: String,
    lastName:  String,
    email:     String,
    phone:     String,
    address:   String,
  },
  status:        { type: String, enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'], default: 'pending' },
  estimatedDelivery: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);