import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/recipe_provider.dart';
import '../theme/app_theme.dart';
import '../models/recipe.dart';
import 'recipe_details_screen.dart';

class SavedScreen extends StatefulWidget {
  const SavedScreen({super.key});

  @override
  State<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends State<SavedScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = "";

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final recipeProvider = Provider.of<RecipeProvider>(context);
    final savedRecipes = recipeProvider.searchSavedRecipes(_searchQuery);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: AppColors.onSurfaceVariant),
          onPressed: () {},
        ),
        title: const Text(
          "CookSmart",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.warmOrange,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none, color: AppColors.onSurfaceVariant),
            onPressed: () {},
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 90), // Avoid being covered by bottom bar
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Header Title
              const Padding(
                padding: EdgeInsets.only(top: 8, bottom: 20),
                child: Text(
                  "Saved Recipes",
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: AppColors.whiteAccent,
                  ),
                ),
              ),

              // Search Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: AppColors.faintBorder, width: 1),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) {
                      setState(() {
                        _searchQuery = val;
                      });
                    },
                    decoration: const InputDecoration(
                      hintText: "Search your saved recipes...",
                      hintStyle: TextStyle(color: AppColors.mutedSage, fontSize: 16),
                      prefixIcon: Icon(Icons.search, color: AppColors.mutedSage, size: 20),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    ),
                    style: const TextStyle(color: AppColors.onSurface, fontSize: 16),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Recipes Grid
              if (savedRecipes.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 80),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.bookmark_border,
                          size: 80,
                          color: AppColors.whiteAccent.withOpacity(0.05),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          "No saved recipes found.",
                          style: TextStyle(color: AppColors.mutedSage, fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                )
              else
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: savedRecipes.length,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.8,
                    ),
                    itemBuilder: (context, index) {
                      final recipe = savedRecipes[index];
                      return _buildSavedCard(context, recipeProvider, recipe);
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSavedCard(BuildContext context, RecipeProvider provider, Recipe recipe) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => RecipeDetailsScreen(recipeId: recipe.id),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLow,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.faintBorder, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image area with Aspect Ratio
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                child: Stack(
                  children: [
                    Image.network(
                      recipe.image,
                      width: double.infinity,
                      height: double.infinity,
                      fit: BoxFit.cover,
                    ),
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withOpacity(0.4),
                            ],
                          ),
                        ),
                      ),
                    ),
                    // Saved Bookmark Toggle button
                    Positioned(
                      top: 8,
                      right: 8,
                      child: GestureDetector(
                        onTap: () => provider.toggleSaveRecipe(recipe.id),
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceContainer.withOpacity(0.8),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.bookmark,
                            size: 18,
                            color: AppColors.warmOrange,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            // Description card
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    recipe.name,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.whiteAccent,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.schedule, size: 14, color: AppColors.mutedSage),
                          const SizedBox(width: 2),
                          Text(
                            recipe.time,
                            style: const TextStyle(fontSize: 11, color: AppColors.mutedSage),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          const Icon(Icons.star, size: 14, color: AppColors.warmOrange),
                          const SizedBox(width: 2),
                          Text(
                            recipe.rating,
                            style: const TextStyle(fontSize: 11, color: AppColors.mutedSage),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
