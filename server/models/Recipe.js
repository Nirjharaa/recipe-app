// To show in which format the recipes will be stored in the database


const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  
  ingredients: {
    type: [String],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
