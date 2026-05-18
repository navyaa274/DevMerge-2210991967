const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 0, max: 100, default: 0 },
  color: { type: String, default: 'indigo' }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  tech: [{ type: String }]
}, { _id: false });

const studentPortfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
  headline: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [skillSchema],
  projects: [projectSchema],
  visibility: { type: String, enum: ['private', 'public'], default: 'private' }
}, { timestamps: true });

module.exports = mongoose.model('StudentPortfolio', studentPortfolioSchema);
