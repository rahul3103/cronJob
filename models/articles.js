const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articlesSchema = new Schema({
  href: { type: String, required: true },
  published_on: { type: Date, required: true },
  publisher: { type: String, required: true },
  team_id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  article_id: {
    type: Schema.Types.ObjectId,
    ref: 'Links',
    required: true
  }
});

module.exports = mongoose.model('Articles', articlesSchema);
