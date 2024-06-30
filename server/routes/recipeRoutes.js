// defines an Express router for handling HTTP POST requests to add a recipe to a planner

const express = require('express');
const router = express.Router();
const Recipe = require('./models/recipe.js');

router.post('/add', async (req, res) => {
  try {
    const { name, ingredients, date } = req.body;
    const recipe = new Recipe({
      name,
      ingredients,
      date,
    });
    await recipe.save();
    res.status(201).send('Recipe added to planner successfully!');
  } catch (error) {
    console.error('Error adding recipe to planner:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
