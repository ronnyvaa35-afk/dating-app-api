const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const GENDERS = [
  'man', 'woman', 'non-binary', 'genderqueer', 'genderfluid',
  'transgender man', 'transgender woman', 'hijra', 'agender',
  'two-spirit', 'intersex', 'questioning', 'other',
];

const ORIENTATIONS = [
  'gay', 'lesbian', 'bisexual', 'pansexual', 'queer',
  'asexual', 'demisexual', 'fluid', 'questioning', 'other',
];

const PRONOUNS = ['he/him', 'she/her', 'they/them', 'ze/zir', 'any', 'other'];

// Grindr-style tribes
const TRIBES = [
  'bear', 'clean-cut', 'daddy', 'discreet', 'geek', 'jock',
  'leather', 'otter', 'poz', 'rugged', 'trans', 'twink', 'versatile',
];

const LOOKING_FOR = ['chat', 'dates', 'friendship', 'networking', 'relationship', 'right now'];

const INDIAN_LANGUAGES = [
  'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati',
  'Urdu', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'English', 'Other',
];

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  age: { type: Number, required: true, min: 18, max: 100 },
  gender: { type: String, required: true, enum: GENDERS },
  pronouns: { type: String, enum: PRONOUNS, default: 'other' },
  sexualOrientation: { type: String, required: true, enum: ORIENTATIONS },
  tribes: [{ type: String, enum: TRIBES }],
  lookingFor: [{ type: String, enum: LOOKING_FOR }],
  bio: { type: String, maxlength: 500, default: '' },
  photos: [{ type: String }],
  height: { type: String, default: '' },
  weight: { type: String, default: '' },
  ethnicity: { type: String, default: '' },
  languages: [{ type: String, enum: INDIAN_LANGUAGES }],
  hivStatus: {
    type: String,
    enum: ['negative', 'negative on PrEP', 'positive', 'positive undetectable', 'prefer not to say'],
    default: 'prefer not to say',
  },
  lastTestedDate: { type: Date },

  // Safety: discreet mode hides profile from screenshots / blurs photo in grid
  discreetMode: { type: Boolean, default: false },
  // Safety: trusted contacts for check-in feature
  trustedContacts: [{ type: String }],

  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
  },

  showDistance: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },

  taps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
