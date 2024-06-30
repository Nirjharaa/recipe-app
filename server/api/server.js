import express from "express"; // Express.js for building server
import axios from 'axios'; // Axios for making HTTP requests
import cors from "cors"; // CORS for cross-origin resource sharing
import mongoose from 'mongoose'; 
import "dotenv/config";

// Create an Express application
const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://nirjharaapatel:jrW8qHc3cENUO5Ji@cluster0.8l1jnq6.mongodb.net/recipe-app-db?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB Atlas'));

// Define Recipe Schema
const recipeSchema = new mongoose.Schema({
  name: String,
  ingredients: [String],
  instructions: String,
});
const Recipe = mongoose.model('Recipe', recipeSchema);

// Define Planner Schema
const plannerSchema = new mongoose.Schema({
  recipeName: String,
  date: Date,
});
const Planner = mongoose.model('Planner', plannerSchema);

// Define Recipe Schema for the new recipe
const newRecipeSchema = mongoose.Schema({
  name: String,
  description: String,
  ingredients: [String],
  imageUrl: String,
  userId: String,
});

// Check if the model already exists before creating it
const NewRecipe = mongoose.models.NewRecipe || mongoose.model('NewRecipe', newRecipeSchema);

app.use(cors());   //enables CORS for all routes
app.use(express.json());  //parse JSON bodies of incoming requests

// Routes for existing functionalities

// Route to fetch recipes from external API
app.get('/recipes/:query', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.edamam.com/search?q=${req.params.query}&app_id=${process.env.APP_ID}&app_key=${process.env.APP_KEY}`
    );
    res.json(response.data.hits);//Each recipe hit contains information about a specific recipe, such as its name, ingredients, and other details
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to save recipe to MongoDB
app.post('/nutrition', async (req, res) => {
  try {
    const { recipeName, ingredients, instructions } = req.body;
    const recipe = new Recipe({
      name: recipeName,
      ingredients: ingredients,
      instructions: instructions,
    });
    await recipe.save();
    res.json({ message: 'Recipe saved successfully' });
  } catch (error) {
    console.error('Error saving recipe to MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to add recipe to planner
app.post('/add-to-planner', async (req, res) => {
  try {
    const { recipe, date } = req.body;
    const plannerEntry = new Planner({
      recipeName: recipe.recipe.label,
      recipeInfo:recipe.recipe.ingredients,

      date: new Date(date),
    });
    await plannerEntry.save();
    res.status(200).json({ message: 'Recipe added to planner successfully' });
  } catch (error) {
    console.error('Error adding recipe to planner:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to fetch planner entries for a specified date
app.get('/planner/:date', async (req, res) => {
  try {
    const startDate = new Date(req.params.date);
    startDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
    const endDate = new Date(req.params.date);
    endDate.setHours(23, 59, 59, 999); // Set to the end of the day

    const plannerEntries = await Planner.find({
      date: { $gte: startDate, $lte: endDate }
    });

    res.json(plannerEntries);
  } catch (error) {
    console.error('Error fetching planner entries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Route to fetch created recipes
app.get('/created-recipes', async (req, res) => {
  try {
    const createdRecipes = await NewRecipe.find();
    res.json(createdRecipes);
  } catch (error) {
    console.error('Error fetching created recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to create and save a new recipe
app.post('/create-recipe', async (req, res) => {
  try {
    const { name, description, ingredients, imageUrl, userId } = req.body;
    const newRecipe = new NewRecipe({
      name,
      description,
      ingredients,
      imageUrl,
      userId,
    });
    const savedRecipe = await newRecipe.save();
    res.json(savedRecipe);
  } catch (error) {
    console.error('Error creating recipe: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is listening to port ${PORT}`);
});
