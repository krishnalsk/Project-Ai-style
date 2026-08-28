import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/recipe_provider.dart';
import '../theme/app_theme.dart';
import '../models/recipe.dart';
import 'recipe_details_screen.dart';

class IngredientsScreen extends StatefulWidget {
  const IngredientsScreen({super.key});

  @override
  State<IngredientsScreen> createState() => _IngredientsScreenState();
}

class _IngredientsScreenState extends State<IngredientsScreen> {
  final TextEditingController _ingredientController = TextEditingController();

  @override
  void dispose() {
    _ingredientController.dispose();
    super.dispose();
  }

  void _addCurrentIngredient(RecipeProvider provider) {
    final text = _ingredientController.text.trim();
    if (text.isNotEmpty) {
      provider.addIngredient(text);
      _ingredientController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    final recipeProvider = Provider.of<RecipeProvider>(context);
    final ingredients = recipeProvider.pantryIngredients;

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.only(bottom: 160), // Add padding for bottom CTA and Nav Bar
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top App Bar
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const SizedBox(width: 40), // Placeholder for symmetry
                          const Text(
                            "Pantry Ingredients",
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: AppColors.whiteAccent,
                            ),
                          ),
                          const SizedBox(width: 40),
                        ],
                      ),
                    ),

                    // Hero Text
                    const SizedBox(height: 16),
                    const Text(
                      "What's in your kitchen?",
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w600,
                        color: AppColors.whiteAccent,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      "Type what ingredients you have, and we'll craft a custom recipe.",
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.mutedSage,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Input Section
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.surfaceCard,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.faintBorder, width: 1),
                            ),
                            child: TextField(
                              controller: _ingredientController,
                              onSubmitted: (_) => _addCurrentIngredient(recipeProvider),
                              decoration: const InputDecoration(
                                hintText: "e.g., Chicken, Spinach, Onion",
                                hintStyle: TextStyle(color: AppColors.mutedSage, fontSize: 16),
                                prefixIcon: Icon(Icons.kitchen_outlined, color: AppColors.mutedSage, size: 20),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                              ),
                              style: const TextStyle(color: AppColors.onSurface, fontSize: 16),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton.icon(
                          onPressed: () => _addCurrentIngredient(recipeProvider),
                          icon: const Icon(Icons.add, size: 18, color: Colors.white),
                          label: const Text(
                            "Add",
                            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.warmOrange,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Ingredients Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "My Ingredients (${ingredients.length})",
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.whiteAccent,
                          ),
                        ),
                        if (ingredients.isNotEmpty)
                          GestureDetector(
                            onTap: () => recipeProvider.clearAllIngredients(),
                            child: const Text(
                              "Clear All",
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.mutedSage,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Chip list or empty blender state
                    if (ingredients.isEmpty)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 60),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.blender,
                                size: 120,
                                color: AppColors.whiteAccent.withOpacity(0.05),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                "Your pantry is empty",
                                style: TextStyle(color: AppColors.mutedSage),
                              ),
                            ],
                          ),
                        ),
                      )
                    else
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: ingredients.map((ingredient) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF292524), // Stone 800
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.faintBorder, width: 1),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  ingredient,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: AppColors.whiteAccent,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                GestureDetector(
                                  onTap: () => recipeProvider.removeIngredient(ingredient),
                                  child: const Icon(
                                    Icons.close,
                                    size: 16,
                                    color: AppColors.mutedSage,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                  ],
                ),
              ),
            ),

            // Fixed Bottom CTA
            Positioned(
              left: 20,
              right: 20,
              bottom: 90, // Positioned above the Bottom Nav Bar (75px + margin)
              child: ElevatedButton.icon(
                onPressed: () {
                  final matches = recipeProvider.matchRecipesFromPantry();
                  _showMatchesSheet(context, matches);
                },
                icon: const Icon(Icons.auto_awesome, size: 20, color: Colors.white),
                label: const Text(
                  "Generate Recipe",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.warmOrange,
                  foregroundColor: Colors.white,
                  shadowColor: AppColors.warmOrange.withOpacity(0.3),
                  elevation: 8,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Visual modal showing generated/matching recipes
  void _showMatchesSheet(BuildContext context, List<Recipe> matches) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Matching Recipes (${matches.length})",
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.whiteAccent,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Icon(Icons.close, color: AppColors.mutedSage),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (matches.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: Text(
                      "No recipes match your ingredients.\nTry adding more items like Steak, Salmon, or Noodles!",
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppColors.mutedSage),
                    ),
                  ),
                )
              else
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: matches.length,
                    itemBuilder: (context, index) {
                      final recipe = matches[index];
                      return GestureDetector(
                        onTap: () {
                          Navigator.pop(context); // Close sheet
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => RecipeDetailsScreen(recipeId: recipe.id),
                            ),
                          );
                        },
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.canvasCharcoal,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.faintBorder, width: 1),
                          ),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.network(
                                  recipe.image,
                                  width: 60,
                                  height: 60,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      recipe.name,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.whiteAccent,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.schedule, size: 14, color: AppColors.mutedSage),
                                        const SizedBox(width: 4),
                                        Text(
                                          recipe.time,
                                          style: const TextStyle(fontSize: 12, color: AppColors.mutedSage),
                                        ),
                                        const SizedBox(width: 16),
                                        const Icon(Icons.star, size: 14, color: AppColors.warmOrange),
                                        const SizedBox(width: 4),
                                        Text(
                                          recipe.rating,
                                          style: const TextStyle(fontSize: 12, color: AppColors.mutedSage),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.mutedSage),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
