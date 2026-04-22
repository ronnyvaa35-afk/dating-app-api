const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  age: { type: Number, required: true, min: 18, max: 100 },
  gender: { type: String, required: true, enum: ['male', 'female', 'non-binary', 'other'] },
  bio: { type: String, maxlength: 500, default: '' },
  photos: [{ type: String }],
  location: {
    city: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  preferences: {
    genderInterest: [{ type: String, enum: ['male', 'female', 'non-binary', 'other'] }],
    ageMin: { type: Number, default: 18 },
    ageMax: { type: Number, default: 99 },
    maxDistance: { type: Number, default: 50 },
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
