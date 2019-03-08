const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const linksSchema = new Schema({
  href: { type: String, required: true },
  published_on: { type: Date, required: true },
  publisher: { type: String, required: true },
  team_id: { type: String, required: true },
  title: { type: String, required: true },
  _id: { type: Number, required: true }
});

module.exports = mongoose.model('Links', linksSchema);
