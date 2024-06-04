const express = require("express");
const { Recipes, User } = require("../models");
const router = express.Router();

// Home route
router.get("/", async (req, res) => {
  try {
    const recipeData = await Recipes.findAll({
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
    });

    // Serialize data so the template can read it
    const recipes = recipeData.map((recipe) => recipe.get({ plain: true }));

    res.render("home", {
      recipes,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});


router.get("/dashboard", async (req, res) => {
  try {
    // Fetch user's data along with their associated recipes
    const userData = await User.findAll(req.session.user_id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Recipes }],
    });

    // if (!userData) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // Extract user and recipes data
    const user = userData.map((post) => post.get({ plain: true }));

    // Render the dashboard template with user and recipes data
    res.render("dashboard", { user, logged_in: req.session.logged_in });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Dashboard route
// router.get('/dashboard', async (req, res) => {
//   try {
//     // Fetch recipes from the database
//     const recipes = await Recipes.findAll({ where: { user_id: req.session.user_id } });

//     // Map over the fetched recipes and convert them to plain objects
//     const recipePosts = recipes.map((recipe) => recipe.get({ plain: true }));

//     // Render the dashboard template with recipes data
//     res.render('dashboard', { recipes: recipePosts });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// Login route
router.get("/login", (req, res) => {
  // If the user is already logged in, redirect the request to the dashboard
  if (req.session.logged_in) {
    res.redirect("/dashboard");
    return;
  }

  res.render("login");
});

// Register route
router.get("/register", (req, res) => {
  // If the user is already logged in, redirect the request to the dashboard
  // if (req.session.logged_in) {
  //   res.redirect("/dashboard");
  //   return;
  // }

  res.render("register");
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed", error: err });
    }
    res.redirect("/login");
  });
});

module.exports = router;
