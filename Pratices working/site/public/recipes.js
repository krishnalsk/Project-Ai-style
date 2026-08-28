// CookSmart Shared Recipe Database
const recipesDb = [
  {
    id: "steak",
    name: "Garlic Butter Steak Bites",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1lAsgAHqH2b1Pa4wbLE_6AD9B7tYGBreZLwEjyDlxUDbKPhnkRcGLZBKJIfdoTCAc-wisN96otFer7T3U_iJ6u3bcN2TL7FPWfT1xHY0GwpYjudOh2Nbeh2ouuX0vn6rMJlHGsiTOgeY1W4oencaXomAnXR_NL61IcsXKEKV3Lzjb0w3uPOti5yLfA3dVf-irATYG9F1rx0fB1veVCLFyFCCa5n5QzjcxHMB0g920WSZzpICWAKKp1aw5zi1PWxkM7Tis2edZ35uM",
    time: "25 min",
    rating: "4.9",
    difficulty: "Medium",
    servings: 2,
    ingredients: [
      "1 lb Sirloin steak (cubed)",
      "4 tbsp Unsalted butter",
      "4 cloves Garlic (minced)",
      "2 tbsp Fresh parsley (chopped)",
      "1 tbsp Olive oil",
      "1 tsp Garlic powder",
      "Salt and pepper (to taste)"
    ],
    tags: ["steak", "garlic", "butter", "parsley", "beef"],
    steps: [
      "Cut the steak into bite-sized cubes and pat dry with paper towels.",
      "Season the steak bites generously with salt, pepper, and garlic powder.",
      "Heat olive oil in a cast-iron skillet over high heat until smoking.",
      "Add steak bites in a single layer and sear for 2 minutes without moving, then flip and sear for another 2 minutes.",
      "Reduce heat to medium, add butter, minced garlic, and fresh parsley. Spoon the melted butter over the steak for 1 minute."
    ]
  },
  {
    id: "noodles",
    name: "Spicy Sesame Noodles",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpTtZejf4K7V18aA7VyjNWHghjGXx_AhBd8P4Dc5CDIpOW4MjCqo1oZhAgmq4R82u6PhYYwVmdlVr9yQIapqyglJwb8XIHYXlKQG1mDSdfzlFJD_Y2RrzNnZFglqf3ldhs_FwBJFCre-ymbuVYKvlMpGuvvEdvzVTO3zIyDk3hcmjnRzJFUMz8V6t15Sl8zt-f3zYC6tRTRaSB_FlcFeIXY5N_tpQ5SY6_YXhl3GQA8bjLVWGmXUBayQJoicBbjjxMu9FBQh0ov_ET",
    time: "15 min",
    rating: "4.8",
    difficulty: "Easy",
    servings: 2,
    ingredients: [
      "8 oz Ramen or Soba noodles",
      "2 tbsp Sesame paste (or peanut butter)",
      "1 tbsp Sesame oil",
      "2 tbsp Soy sauce",
      "1 tbsp Chili oil (with flakes)",
      "2 cloves Garlic (minced)",
      "2 Scallions (chopped)",
      "1 tsp Toasted sesame seeds"
    ],
    tags: ["noodles", "sesame oil", "chili oil", "scallions", "soy sauce", "garlic", "pasta"],
    steps: [
      "Cook noodles in boiling water according to package instructions, then drain and rinse with cold water.",
      "In a small bowl, whisk together sesame paste, soy sauce, sesame oil, chili oil, minced garlic, and a splash of warm water.",
      "Toss the noodles with the sauce until fully coated.",
      "Garnish with chopped scallions, toasted sesame seeds, and extra chili oil if desired."
    ]
  },
  {
    id: "tuscan-chicken",
    name: "Creamy Tuscan Garlic Chicken",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800",
    time: "30 min",
    rating: "4.7",
    difficulty: "Medium",
    servings: 3,
    ingredients: [
      "3 Chicken breasts",
      "1 cup Heavy cream",
      "1/2 cup Chicken broth",
      "1 tsp Garlic powder",
      "1 cup Fresh spinach",
      "1/2 cup Cherry tomatoes (halved)",
      "1/2 cup Grated Parmesan cheese",
      "1 tbsp Olive oil"
    ],
    tags: ["chicken", "garlic", "spinach", "cherry tomatoes", "cream", "parmesan", "broth"],
    steps: [
      "Season chicken breasts with salt, pepper, and Italian seasoning.",
      "Heat olive oil in a large skillet over medium-high heat and cook chicken for 5-6 minutes per side until golden brown and cooked through. Remove chicken.",
      "In the same skillet, add minced garlic and cherry tomatoes, cooking until the tomatoes begin to burst.",
      "Add fresh spinach and let it wilt, then pour in heavy cream and grated parmesan cheese. Simmer for 3 minutes.",
      "Return chicken to the skillet, spooning the creamy sauce over it, and cook for another 2 minutes before serving."
    ]
  },
  {
    id: "avocado-toast",
    name: "Avocado & Poached Egg Toast",
    image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=800",
    time: "10 min",
    rating: "4.6",
    difficulty: "Easy",
    servings: 1,
    ingredients: [
      "2 slices Sourdough bread",
      "1 Ripe avocado",
      "2 Fresh eggs",
      "1 tbsp Butter",
      "1/2 tsp Chili flakes",
      "Salt and pepper (to taste)"
    ],
    tags: ["avocado", "egg", "bread", "butter", "chili flakes"],
    steps: [
      "Toast sourdough bread slices until golden and crisp.",
      "Mash avocado in a small bowl with a pinch of salt, pepper, and a squeeze of lemon juice.",
      "Poach the eggs in simmering water with a splash of vinegar for 3-4 minutes.",
      "Spread mashed avocado evenly over toast slices, top each with a poached egg, and garnish with chili flakes."
    ]
  }
];

// Helper to match recipes based on input ingredients list (array of strings)
function matchRecipes(inputIngredients) {
  if (!inputIngredients || inputIngredients.length === 0) return [];
  
  // Normalize input ingredients
  const normalizedInputs = inputIngredients.map(i => i.toLowerCase().trim());
  
  // Score each recipe based on how many input ingredients match the recipe tags
  const scored = recipesDb.map(recipe => {
    let score = 0;
    normalizedInputs.forEach(input => {
      // Direct tag match or ingredient name includes the input word
      const matchesTag = recipe.tags.some(tag => tag.includes(input) || input.includes(tag));
      const matchesIngred = recipe.ingredients.some(ing => ing.toLowerCase().includes(input));
      if (matchesTag || matchesIngred) {
        score += 2; // Match gets 2 points
      }
    });
    return { ...recipe, score };
  });
  
  // Filter out zero scores and sort descending
  return scored.filter(r => r.score > 0).sort((a, b) => b.score - a.score);
}
