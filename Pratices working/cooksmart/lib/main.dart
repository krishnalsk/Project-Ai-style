import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/recipe_provider.dart';
import 'theme/app_theme.dart';
import 'screens/app_navigation.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ChangeNotifierProvider(
      create: (_) => RecipeProvider(),
      child: const CookSmartApp(),
    ),
  );
}

class CookSmartApp extends StatelessWidget {
  const CookSmartApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CookSmart',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const AppNavigation(),
    );
  }
}
