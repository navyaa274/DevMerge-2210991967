const mongoose = require('mongoose');

/**
 * Payment Model
 * Represents payments made by students
 */

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentType: {
    type: String,
    enum: ['tuition', 'fee', 'fine', 'other'],
    required: true
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash', 'online'],
    required: true
  },
  dueDate: Date,
  paidAt: Date,
  reference: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
paymentSchema.index({ student: 1, status: 1 });
paymentSchema.index({ dueDate: 1 });

// Update updatedAt on save
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
