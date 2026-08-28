import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/recipe.dart';

class RecipeProvider with ChangeNotifier {
  // Pre-populated recipe database matching the designs
  final List<Recipe> _recipesDb = [
    Recipe(
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
      ],
    ),
    Recipe(
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
      ],
    ),
    Recipe(
      id: "tuscan-chicken",
      name: "Creamy Tuscan Garlic Chicken",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtAw-xgHQTZa-pdIIJgf4hgePQeAzcTl6sNuRztCpJM95BZNyWodZ41ST_4NSQi5alsPd4yToVvx204T12bUT9ImpFMFn9pqb6Lw04wMadv57_6SxiW9NvQLpsNvl2F0vFdLqWPuW1tKTluSRMlYWOmk8Od5Ezmu02O46PYkhQxp6nGzNFjgwaaboOXYAUQXlGdm0Ds1oPEfnQynTY3JWbPqQKe3OGgdsSaVxejeW9oN3sAS6_uenPHb4jDGQ9EXWP0IZQGdM5VuUG",
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
      ],
    ),
    Recipe(
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
      ],
    ),
    Recipe(
      id: "salmon",
      name: "Honey Glazed Salmon",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnLQaqy0axmVZJrrStz9OzcZsPCBjw4ac-LSNDRSwcweA0F1oQbSd0DH1xTaNscRezXzLcOwh1QuZv7jdyIMrdDJ-zgu645fioO-SCzE1Gl59BEjbtruyNxymXQHMBglMMFoU1vC4jA5KMELF6lXwI5PdPNXjzWJFehc8ClMwykh3DextgpYZTlr93N5V4esHNwqn94CrI1bESss9ZSZRLPgJH8Af0VyUy5gduarqMbb-AXlVb5fztcKLE6l-LvYNGnPpKQYIxfMRC",
      time: "20 min",
      rating: "4.8",
      difficulty: "Easy",
      servings: 2,
      ingredients: [
        "2 Salmon fillets",
        "3 tbsp Honey",
        "2 tbsp Soy sauce",
        "1 tbsp Lemon juice",
        "2 cloves Garlic (minced)",
        "1 bunch Asparagus",
        "1 cup Quinoa",
        "1 tbsp Olive oil"
      ],
      tags: ["salmon", "honey", "soy sauce", "asparagus", "fish", "quinoa"],
      steps: [
        "Rinse and cook quinoa according to package instructions.",
        "In a small bowl, whisk honey, soy sauce, lemon juice, and minced garlic together.",
        "Heat olive oil in a skillet over medium-high heat. Add salmon fillets, skin side down.",
        "Cook salmon for 4 minutes, flip, and pour the honey glaze mixture into the pan.",
        "Spoon the bubbling glaze over the salmon for another 3-4 minutes until cooked through.",
        "Serve salmon glazed alongside steamed quinoa and grilled asparagus."
      ],
    ),
    Recipe(
      id: "lemon-chicken",
      name: "Lemon Herb Chicken",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIrtOjUwtKRTmTkZ6pgG56heoVXNDdatRs7Yls7oKzZhHU3-WsQOjl9jmh27WiAppRD0gE8Ga27EyEs0X-fK5P7F7stPv6EC3Exs8KCDgrdThLdmt-L1VxEw1q5tI7uOUodOcDLj_gF8CpHATUNupOJs1R4b4DKygB_d2GLRLww7oV3qkRSCZ4-SGcBqjfSKbI8gBxyGG5m87oW94Ts4_rFlZuozvMyefmYf3rW-oBop07Ks8s-sKCwELxcG0HaLYnVsycKBt0yMlW",
      time: "35 min",
      rating: "4.7",
      difficulty: "Medium",
      servings: 3,
      ingredients: [
        "3 Chicken breasts",
        "2 tbsp Lemon juice",
        "1 tbsp Fresh thyme (chopped)",
        "3 cloves Garlic (minced)",
        "2 tbsp Olive oil",
        "2 tbsp Butter",
        "Salt and pepper (to taste)"
      ],
      tags: ["chicken", "lemon", "thyme", "garlic", "herb"],
      steps: [
        "Season chicken breasts generously with salt, pepper, and fresh thyme.",
        "Heat olive oil in a large skillet over medium-high heat. Add chicken breasts and cook for 6-8 minutes on each side until golden and cooked through.",
        "Reduce heat to low, add butter and minced garlic, and sauté for 1 minute.",
        "Drizzle lemon juice over chicken and spoon the pan juices over the breasts. Let simmer for 2 minutes before serving."
      ],
    ),
    Recipe(
      id: "avocado-pasta",
      name: "Avocado Pasta",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ3S56IlMTA1PEeZ1N3ExGFWBmwJMdg15gVhwV8_90bNgunsd4ppxyckQ1A52VOHcJxUqZHwJ5TSp9BjBYnnM9H10sA2J6iXPs5Oady3NeiyCu5jl9JbrMvl_m3FbMUmeWWJNuoeoQ4FHMPkCs0pQs-byttve1-rY99JS9u2Q8iM9AzEABA633oKISEW_I6oFSP-MTZpdSn1-AnaR9I5wSaSAznWsHk_Z8xqyzOt5nZRixaU-mU9auNr2ddNlRehCeERk_AIDauktT",
      time: "15 min",
      rating: "4.5",
      difficulty: "Easy",
      servings: 2,
      ingredients: [
        "8 oz Pasta (Spaghetti or Penne)",
        "2 Ripe avocados (pitted)",
        "1 cup Cherry tomatoes (halved)",
        "2 cloves Garlic",
        "1/2 cup Fresh basil leaves",
        "2 tbsp Lemon juice",
        "2 tbsp Olive oil",
        "Salt and pepper (to taste)"
      ],
      tags: ["avocado", "pasta", "basil", "cherry tomatoes", "vegan", "garlic"],
      steps: [
        "Cook pasta in boiling salted water according to package directions, then drain.",
        "In a blender or food processor, combine pitted avocados, garlic, basil leaves, lemon juice, and olive oil. Blend until smooth and creamy.",
        "Toss the hot pasta with the blended avocado sauce until evenly coated.",
        "Gently stir in the halved cherry tomatoes and season with salt and pepper. Garnish with fresh basil."
      ],
    )
  ];

  final List<String> _pantryIngredients = ["Chicken breast", "Garlic cloves", "Cherry tomatoes"];
  final Set<String> _savedRecipeIds = {"steak", "salmon", "lemon-chicken", "avocado-pasta"};

  List<Recipe> get recipesDb => _recipesDb;
  List<String> get pantryIngredients => _pantryIngredients;
  Set<String> get savedRecipeIds => _savedRecipeIds;

  RecipeProvider() {
    _loadFromPrefs();
  }

  // Load from local storage
  Future<void> _loadFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedIds = prefs.getStringList('saved_recipes');
      if (savedIds != null) {
        _savedRecipeIds.clear();
        _savedRecipeIds.addAll(savedIds);
      }
      final ingredients = prefs.getStringList('pantry_ingredients');
      if (ingredients != null) {
        _pantryIngredients.clear();
        _pantryIngredients.addAll(ingredients);
      }
      notifyListeners();
    } catch (e) {
      if (kDebugMode) print("Error loading from SharedPreferences: $e");
    }
  }

  // Save to local storage
  Future<void> _saveSavedRecipes() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('saved_recipes', _savedRecipeIds.toList());
    } catch (e) {
      if (kDebugMode) print("Error saving recipes to SharedPreferences: $e");
    }
  }

  Future<void> _saveIngredients() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('pantry_ingredients', _pantryIngredients);
    } catch (e) {
      if (kDebugMode) print("Error saving ingredients to SharedPreferences: $e");
    }
  }

  // Add / Remove Ingredients
  void addIngredient(String ingredient) {
    final cleaned = ingredient.trim();
    if (cleaned.isNotEmpty && !_pantryIngredients.any((i) => i.toLowerCase() == cleaned.toLowerCase())) {
      _pantryIngredients.add(cleaned);
      _saveIngredients();
      notifyListeners();
    }
  }

  void removeIngredient(String ingredient) {
    _pantryIngredients.removeWhere((i) => i.toLowerCase() == ingredient.toLowerCase());
    _saveIngredients();
    notifyListeners();
  }

  void clearAllIngredients() {
    _pantryIngredients.clear();
    _saveIngredients();
    notifyListeners();
  }

  // Toggle Saved status
  void toggleSaveRecipe(String recipeId) {
    if (_savedRecipeIds.contains(recipeId)) {
      _savedRecipeIds.remove(recipeId);
    } else {
      _savedRecipeIds.add(recipeId);
    }
    _saveSavedRecipes();
    notifyListeners();
  }

  bool isRecipeSaved(String recipeId) {
    return _savedRecipeIds.contains(recipeId);
  }

  // Search recipes database by term
  List<Recipe> searchRecipes(String query) {
    if (query.trim().isEmpty) return _recipesDb;
    final term = query.toLowerCase().trim();
    return _recipesDb.where((recipe) {
      return recipe.name.toLowerCase().contains(term) ||
          recipe.tags.any((tag) => tag.toLowerCase().contains(term)) ||
          recipe.ingredients.any((ing) => ing.toLowerCase().contains(term));
    }).toList();
  }

  // Search ONLY saved recipes by term
  List<Recipe> searchSavedRecipes(String query) {
    final saved = _recipesDb.where((r) => _savedRecipeIds.contains(r.id)).toList();
    if (query.trim().isEmpty) return saved;
    final term = query.toLowerCase().trim();
    return saved.where((recipe) {
      return recipe.name.toLowerCase().contains(term) ||
          recipe.tags.any((tag) => tag.toLowerCase().contains(term)) ||
          recipe.ingredients.any((ing) => ing.toLowerCase().contains(term));
    }).toList();
  }

  // Ported matching algorithm from recipes.js
  List<Recipe> matchRecipesFromPantry() {
    if (_pantryIngredients.isEmpty) return [];

    final normalizedInputs = _pantryIngredients.map((i) => i.toLowerCase().trim()).toList();

    List<MapEntry<Recipe, int>> scored = [];

    for (var recipe in _recipesDb) {
      int score = 0;
      for (var input in normalizedInputs) {
        // Direct tag match or tag contains input / input contains tag
        bool matchesTag = recipe.tags.any((tag) => tag.toLowerCase().contains(input) || input.contains(tag.toLowerCase()));
        bool matchesIngred = recipe.ingredients.any((ing) => ing.toLowerCase().contains(input));
        if (matchesTag || matchesIngred) {
          score += 2;
        }
      }
      if (score > 0) {
        scored.add(MapEntry(recipe, score));
      }
    }

    // Sort descending by score
    scored.sort((a, b) => b.value.compareTo(a.value));

    return scored.map((entry) => entry.key).toList();
  }
}
