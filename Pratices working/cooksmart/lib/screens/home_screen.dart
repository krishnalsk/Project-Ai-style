import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/recipe_provider.dart';
import '../theme/app_theme.dart';
import '../models/recipe.dart';
import 'recipe_details_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
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
    final searchResults = recipeProvider.searchRecipes(_searchQuery);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 90), // Avoid being covered by bottom bar
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "CookSmart",
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppColors.warmOrange,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "Find your next meal",
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.onSurface,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.faintBorder, width: 1),
                        image: const DecorationImage(
                          image: NetworkImage(
                            "https://lh3.googleusercontent.com/aida-public/AB6AXuCeJtpVJKF1ZXOZ376NSQrUe0VXXS0ap1WhKtta_7dTTW9Ryp_vKmzCcdG2Z92i67ZlZtOx0MQQsmpSoPTG2L3OVrUoSRRNLb1hrrz9pDOpUto1Fq8RfFoVBMqjWMVouhIRByQRw9RABaq2aJXsWWmDBX7gEOfLiAHF1Ol2UYqdTuZjXIGzZcqCWgW3VjakJMvUvGeng8L8j9J5YFoJ_HRssaTsqZGJ1VFdWvq9jTgoz5fAiHrNVhDhZhV4H6tIRp_4PkmU5qYtZnid",
                          ),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Search Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.surfaceCard,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.faintBorder, width: 1),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) {
                      setState(() {
                        _searchQuery = val;
                      });
                    },
                    decoration: InputDecoration(
                      hintText: "Search recipes, cuisines...",
                      hintStyle: const TextStyle(color: AppColors.mutedSage, fontSize: 16),
                      prefixIcon: const Icon(Icons.search, color: AppColors.onSurfaceVariant, size: 20),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    ),
                    style: const TextStyle(color: AppColors.onSurface, fontSize: 16),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Conditional Display based on Search Query
              if (_searchQuery.trim().isNotEmpty) ...[
                // Search Results
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    "Search Results (${searchResults.length})",
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                ),
                const SizedBox(height: 16),
                if (searchResults.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Text(
                        "No recipes found.",
                        style: TextStyle(color: AppColors.mutedSage),
                      ),
                    ),
                  )
                else
                  GridView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.8,
                    ),
                    itemCount: searchResults.length,
                    itemBuilder: (context, index) {
                      return _buildRecipeGridCard(context, searchResults[index]);
                    },
                  ),
              ] else ...[
                // Featured Recipes Section
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    "Featured Recipes",
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 250,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    children: recipeProvider.recipesDb
                        .where((r) => r.id == "steak" || r.id == "noodles")
                        .map((recipe) => _buildFeaturedCard(context, recipe))
                        .toList(),
                  ),
                ),
                const SizedBox(height: 24),

                // Categories Section
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    "Categories",
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                ),
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.4,
                    children: [
                      _buildCategoryCard(context, Icons.egg_alt, "Breakfast"),
                      _buildCategoryCard(context, Icons.lunch_dining, "Lunch"),
                      _buildCategoryCard(context, Icons.dinner_dining, "Dinner"),
                      _buildCategoryCard(context, Icons.cake, "Dessert"),
                      _buildCategoryCard(context, Icons.eco, "Vegan"),
                      _buildCategoryCard(context, Icons.monitor_weight, "Healthy"),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeaturedCard(BuildContext context, Recipe recipe) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => RecipeDetailsScreen(recipeId: recipe.id),
          ),
        );
      },
      child: Container(
        width: 280,
        margin: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          color: AppColors.surfaceCard,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.faintBorder, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Stack
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(23)),
              child: Stack(
                children: [
                  Image.network(
                    recipe.image,
                    height: 150,
                    width: double.infinity,
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
                            Colors.black.withOpacity(0.6),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.warmOrange,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        "Featured",
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Title & Info
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    recipe.name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: AppColors.whiteAccent,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.schedule, size: 16, color: AppColors.mutedSage),
                      const SizedBox(width: 4),
                      Text(
                        recipe.time,
                        style: const TextStyle(fontSize: 12, color: AppColors.mutedSage),
                      ),
                      const SizedBox(width: 16),
                      const Icon(Icons.star, size: 16, color: AppColors.warmOrange),
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
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryCard(BuildContext context, IconData icon, String label) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _searchController.text = label;
          _searchQuery = label;
        });
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surfaceCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.faintBorder, width: 1),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppColors.warmOrange, size: 32),
            const SizedBox(height: 8),
            Text(
              label,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: AppColors.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecipeGridCard(BuildContext context, Recipe recipe) {
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
          color: AppColors.surfaceCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.faintBorder, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                child: Image.network(
                  recipe.image,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
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
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.schedule, size: 12, color: AppColors.mutedSage),
                          const SizedBox(width: 2),
                          Text(
                            recipe.time,
                            style: const TextStyle(fontSize: 10, color: AppColors.mutedSage),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          const Icon(Icons.star, size: 12, color: AppColors.warmOrange),
                          const SizedBox(width: 2),
                          Text(
                            recipe.rating,
                            style: const TextStyle(fontSize: 10, color: AppColors.mutedSage),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
