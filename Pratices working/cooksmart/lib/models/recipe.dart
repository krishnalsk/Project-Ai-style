class Recipe {
  final String id;
  final String name;
  final String image;
  final String time;
  final String rating;
  final String difficulty;
  final int servings;
  final List<String> ingredients;
  final List<String> tags;
  final List<String> steps;

  Recipe({
    required this.id,
    required this.name,
    required this.image,
    required this.time,
    required this.rating,
    required this.difficulty,
    required this.servings,
    required this.ingredients,
    required this.tags,
    required this.steps,
  });

  factory Recipe.fromJson(Map<String, dynamic> json) {
    return Recipe(
      id: json['id'] as String,
      name: json['name'] as String,
      image: json['image'] as String,
      time: json['time'] as String,
      rating: json['rating'] as String,
      difficulty: json['difficulty'] as String,
      servings: json['servings'] as int,
      ingredients: List<String>.from(json['ingredients'] as List),
      tags: List<String>.from(json['tags'] as List),
      steps: List<String>.from(json['steps'] as List),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'image': image,
      'time': time,
      'rating': rating,
      'difficulty': difficulty,
      'servings': servings,
      'ingredients': ingredients,
      'tags': tags,
      'steps': steps,
    };
  }
}
