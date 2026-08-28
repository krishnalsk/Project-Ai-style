# Site Constitution: CookSmart Mobile App

## 1. Core Identity
- **Project Name:** CookSmart
- **Stitch Project ID:** 11269082295761255451
- **Mission:** A smart, interactive recipe generator and cookbook app that helps users create delicious meals from ingredients they have on hand.
- **Target Audience:** Home cooks, busy professionals, and food enthusiasts seeking quick, personalized recipe ideas.
- **Voice:** Warm, helpful, culinary-focused, modern.

## 2. Visual Language
- **Vibe:** Deep dark canvas with warm, fire-like orange accents, clean typography, and a polished mobile app feel.
- **Atmosphere:** Cosy, warm, functional, premium.

## 3. Architecture & File Structure
- **Production Folder:** `site/public/`
- **Design Staging:** `.stitch/designs/`
- **Navigation Strategy:** Sticky bottom mobile tab bar with four buttons: Home (featured/categories), Ingredients (input/generate), Saved (grid of saved recipes).

## 4. Live Sitemap
- `[x]` `index.html` - Screen 1: Home screen with featured recipes, categories, and search.
- `[x]` `ingredients.html` - Screen 2: Ingredient input screen with tags and "Generate" CTA.
- `[x]` `recipe.html` - Screen 3: Recipe result detail page with instructions, ingredient list, and "Save" button.
- `[x]` `saved.html` - Screen 4: Saved recipes grid.

## 5. The Roadmap (Backlog)
### High Priority
- `[x]` Initialize layout structure for mobile viewport.
- `[x]` Design individual screens using Google Stitch.
- `[x]` Hook up navigation routing via bottom tab bar.
### Medium Priority
- `[x]` Implement dynamic client-side recipe matching database (JSON-based in JS).
- `[x]` Build the ingredient list tags and matching script.
- `[x]` Establish localStorage persistence for saved recipes.
### Low Priority
- Add success toasts when saving recipes.
- `[x]` Create empty states for the Saved Recipes Grid.
- Micro-animations for button clicks and tag additions.

## 6. Creative Freedom Guidelines
- If recipe details are brief, embellish them with culinary tips, prep times, and difficulty ratings.
- Style categories with recognizable icons or food representations.
- Build clean skeleton loaders while "generating" a recipe.
