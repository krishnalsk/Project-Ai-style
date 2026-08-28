---
page: shopping
---
Generate the Shopping List Screen of the CookSmart mobile app.

### Screen Requirements:
1. **Device Frame Container**: Designed specifically for a mobile layout (max-width: 480px) and centered on the screen, matching the dimensions and layout of the other screens.
2. **App Header**: 
   - A back button on the left linking back to `saved.html`.
   - Displays the title "Shopping List" in the center (bold, high-contrast white).
3. **Aggregated Ingredient Checklist**:
   - A list of ingredients aggregated from the user's saved recipes.
   - Grouped by recipe (e.g. "Garlic Butter Steak Bites" ingredients listed below it, followed by "Creamy Tuscan Garlic Chicken" ingredients).
   - Each item has a checkbox on the left and the ingredient name. When checked, the text becomes struck through and opacity lowers (using the checked style).
4. **Action Buttons**:
   - A "Clear Checked Items" button at the bottom of the list styled in secondary ghost style (transparent background, Faint Border, white text).
   - A floating share/export button at the bottom.
5. **Empty State Composition**:
   - An elegant placeholder layout for when there are no items in the shopping list (because there are no saved recipes or all items are cleared).
   - Includes a shopping cart outline icon in Muted Sage, text "Your shopping list is empty", and a CTA button "Find Recipes" that links to `index.html` styled in solid Warm Orange.
6. **Bottom Navigation Bar**:
   - Same bottom navigation bar as the other screens:
     - **Home** (Inactive, muted) -> links to `index.html`
     - **Ingredients** (Inactive, muted) -> links to `ingredients.html`
     - **Saved** (Active, highlighted in warm orange) -> links to `saved.html`
   - Maintain the blurred transparent look and thin border.

### DESIGN SYSTEM (REQUIRED):
- **Theme**: Dark Mode
- **Canvas Charcoal**: #0C0A09 (Stone 950 deep warm black) for primary background
- **Surface Card**: #1C1917 (Stone 900) for container backgrounds
- **White Accent**: #FFFFFF for main titles and primary body text
- **Warm Orange**: #EA580C (Orange 600) for interactive elements, active navigation states, and CTAs
- **Muted Sage**: #78716C (Stone 500) for secondary captions and description text
- **Faint Border**: rgba(120, 113, 108, 0.15) for inputs and card strokes
- **Typography**: Font family: "Outfit" (loaded from Google Fonts).
- **Corner Roundness**: All cards and inputs have rounded corners (16px / rounded-2xl). Buttons are highly rounded.
- **Banned AI Patterns**: No emojis, no pure black background (#000000), no neon blue or purple glows, no Inter font, no broken image links.
