import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const Color canvasCharcoal = Color(0xFF0C0A09);
  static const Color surfaceCard = Color(0xFF1C1917);
  static const Color whiteAccent = Color(0xFFFFFFFF);
  static const Color warmOrange = Color(0xFFEA580C);
  static const Color mutedSage = Color(0xFF78716C);
  static const Color faintBorder = Color(0x2678716C); // rgba(120, 113, 108, 0.15)
  
  // Containers
  static const Color surfaceContainerLowest = Color(0xFF100E0D);
  static const Color surfaceContainerLow = Color(0xFF1D1B1A);
  static const Color surfaceContainer = Color(0xFF221F1E);
  static const Color surfaceContainerHigh = Color(0xFF2C2928);
  static const Color surfaceContainerHighest = Color(0xFF373433);
  
  static const Color onSurface = Color(0xFFE8E1DF);
  static const Color onSurfaceVariant = Color(0xFFE2BFB2);
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.canvasCharcoal,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.warmOrange,
        secondary: AppColors.mutedSage,
        surface: AppColors.surfaceCard,
        background: AppColors.canvasCharcoal,
        onBackground: AppColors.onSurface,
        onSurface: AppColors.onSurface,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.outfit(
          fontSize: 40,
          height: 1.2,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.8,
          color: AppColors.whiteAccent,
        ),
        headlineLarge: GoogleFonts.outfit(
          fontSize: 32,
          height: 1.25,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.32,
          color: AppColors.whiteAccent,
        ),
        headlineMedium: GoogleFonts.outfit(
          fontSize: 24,
          height: 1.33,
          fontWeight: FontWeight.w600,
          color: AppColors.whiteAccent,
        ),
        bodyLarge: GoogleFonts.outfit(
          fontSize: 18,
          height: 1.6,
          fontWeight: FontWeight.w400,
          color: AppColors.onSurface,
        ),
        bodyMedium: GoogleFonts.outfit(
          fontSize: 16,
          height: 1.5,
          fontWeight: FontWeight.w400,
          color: AppColors.onSurface,
        ),
        labelLarge: GoogleFonts.outfit(
          fontSize: 14,
          height: 1.43,
          fontWeight: FontWeight.w500,
          letterSpacing: 0.14,
          color: AppColors.whiteAccent,
        ),
        bodySmall: GoogleFonts.outfit(
          fontSize: 12,
          height: 1.33,
          fontWeight: FontWeight.w400,
          color: AppColors.mutedSage,
        ),
      ),
      cardTheme: const CardTheme(
        color: AppColors.surfaceCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: BorderSide(color: AppColors.faintBorder, width: 1),
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.faintBorder,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
