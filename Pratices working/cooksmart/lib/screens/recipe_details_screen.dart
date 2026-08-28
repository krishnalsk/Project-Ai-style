import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/recipe_provider.dart';
import '../theme/app_theme.dart';
import '../models/recipe.dart';

class RecipeDetailsScreen extends StatefulWidget {
  final String recipeId;

  const RecipeDetailsScreen({super.key, required this.recipeId});

  @override
  State<RecipeDetailsScreen> createState() => _RecipeDetailsScreenState();
}

class _RecipeDetailsScreenState extends State<RecipeDetailsScreen> {
  // Set to keep track of checked ingredients for strike-through effect
  final Set<int> _checkedIngredients = {};

  @override
  Widget build(BuildContext context) {
    final recipeProvider = Provider.of<RecipeProvider>(context);
    
    // Find recipe in database or show error if not found
    final recipe = recipeProvider.recipesDb.firstWhere(
      (r) => r.id == widget.recipeId,
      orElse: () => Recipe(
        id: "unknown",
        name: "Recipe Not Found",
        image: "",
        time: "",
        rating: "",
        difficulty: "",
        servings: 0,
        ingredients: [],
        tags: [],
        steps: [],
      ),
    );

    if (recipe.id == "unknown") {
      return Scaffold(
        appBar: AppBar(title: const Text("Error")),
        body: const Center(child: Text("Recipe not found.")),
      );
    }

    final isSaved = recipeProvider.isRecipeSaved(recipe.id);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, color: AppColors.whiteAccent, size: 28),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Recipe Details",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.whiteAccent,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(
              isSaved ? Icons.bookmark : Icons.bookmark_border,
              color: isSaved ? AppColors.warmOrange : AppColors.whiteAccent,
            ),
            onPressed: () => recipeProvider.toggleSaveRecipe(recipe.id),
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 120), // Leave space for bottom FAB
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Hero Image
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: AspectRatio(
                    aspectRatio: 16 / 9,
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.faintBorder, width: 1),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.5),
                            blurRadius: 16,
                            offset: const Offset(0, 8),
                          ),
                        ],
                        image: DecorationImage(
                          image: NetworkImage(recipe.image),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),
                ),

                // Title & Details
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        recipe.name,
                        style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          fontSize: 28,
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      // Metadata Row
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _buildMetaBadge(Icons.schedule, recipe.time),
                            const SizedBox(width: 12),
                            _buildMetaBadge(Icons.restaurant, "${recipe.servings} Servings"),
                            const SizedBox(width: 12),
                            _buildMetaBadge(Icons.bar_chart, recipe.difficulty),
                            const SizedBox(width: 12),
                            _buildMetaBadge(Icons.star, recipe.rating, isRating: true),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Ingredients List Section
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Ingredients",
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceCard,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.faintBorder, width: 1),
                        ),
                        child: Column(
                          children: List.generate(recipe.ingredients.length, (index) {
                            final ingredient = recipe.ingredients[index];
                            final isChecked = _checkedIngredients.contains(index);
                            return Column(
                              children: [
                                GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      if (isChecked) {
                                        _checkedIngredients.remove(index);
                                      } else {
                                        _checkedIngredients.add(index);
                                      }
                                    });
                                  },
                                  child: Row(
                                    children: [
                                      Checkbox(
                                        value: isChecked,
                                        activeColor: AppColors.warmOrange,
                                        checkColor: Colors.white,
                                        side: const BorderSide(color: AppColors.mutedSage),
                                        onChanged: (bool? val) {
                                          setState(() {
                                            if (val == true) {
                                              _checkedIngredients.add(index);
                                            } else {
                                              _checkedIngredients.remove(index);
                                            }
                                          });
                                        },
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          ingredient,
                                          style: TextStyle(
                                            fontSize: 16,
                                            color: isChecked ? AppColors.mutedSage : AppColors.onSurface,
                                            decoration: isChecked ? TextDecoration.lineThrough : null,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                if (index < recipe.ingredients.length - 1)
                                  const Divider(color: AppColors.faintBorder, height: 16),
                              ],
                            );
                          }),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Preparation Steps
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Preparation",
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                      const SizedBox(height: 16),
                      Column(
                        children: List.generate(recipe.steps.length, (index) {
                          final step = recipe.steps[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 20),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 32,
                                  height: 32,
                                  decoration: const BoxDecoration(
                                    color: AppColors.surfaceContainer,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                    child: Text(
                                      "${index + 1}",
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.warmOrange,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Text(
                                    step,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      height: 1.6,
                                      color: AppColors.onSurface,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Floating Save Button at Bottom
          Positioned(
            left: 20,
            right: 20,
            bottom: 24,
            child: ElevatedButton.icon(
              onPressed: () => recipeProvider.toggleSaveRecipe(recipe.id),
              icon: Icon(
                isSaved ? Icons.favorite : Icons.favorite_border,
                size: 20,
                color: Colors.white,
              ),
              label: Text(
                isSaved ? "Saved to Cookbook" : "Save Recipe",
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.warmOrange,
                foregroundColor: Colors.white,
                shadowColor: AppColors.warmOrange.withOpacity(0.4),
                elevation: 8,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetaBadge(IconData icon, String label, {bool isRating = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.faintBorder, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: isRating ? AppColors.warmOrange : AppColors.mutedSage,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: isRating ? AppColors.warmOrange : AppColors.mutedSage,
            ),
          ),
        ],
      ),
    );
  }
}
