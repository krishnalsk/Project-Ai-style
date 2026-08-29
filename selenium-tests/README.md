# Style AI Web - Selenium E2E Test Suite

This folder contains the automated end-to-end (E2E) testing suite for the **Style AI** Next.js web application. It uses **Selenium WebDriver** (via Google Chrome in headless mode) to run through critical user scenarios, from registration to checkout, and compiles the execution analysis into a styled Excel spreadsheet.

## Prerequisites

Ensure you have the following installed on your machine:

1. **Node.js** (v18 or higher recommended)
2. **Google Chrome** browser (and that it is accessible on the system path)

## Test Cases Covered

The test suite covers the following 10 E2E scenarios:

- **TC_001:** Homepage Loading & Navigation Bar brand keyword checks.
- **TC_002:** User Registration & Signup Form submissions (using unique randomly generated accounts).
- **TC_003:** Bypassing the email verification screen (navigating directly to onboarding after signup).
- **TC_004:** Onboarding Configuration Setup (Steps 1, 2, and 3: Personal details, Skin Diagnosis, Comfort Preferences).
- **TC_005:** Dashboard Layout Verification (asserting that custom user profiles and quick action tiles are active).
- **TC_006:** AI Stylist Chatbot Querying (submitting text questions and waiting for response bubbles).
- **TC_007:** Shop Catalog & Product Detail selections (picking sizes/colors for the Azure French Linen Shirt).
- **TC_008:** Cart & Checkout Fulfillment Pipeline (adding to cart, checkout billing forms, placing COD orders, order success alerts).
- **TC_009:** Skin Forecast Dashboard widget displays.
- **TC_010:** Fabric Encyclopedia textile searching.

## Setup Instructions

1. Install dependencies from the terminal:
   ```bash
   npm install
   ```

2. Run the test suite:
   ```bash
   node run-tests.js
   ```

## Automatic Dev Server Booting

The script will automatically check if the Next.js dev server is running on `http://localhost:3000`. If it's not active, the test runner will automatically spawn the dev server in the background using `npm run dev` in the `style-ai-web` project directory, wait for it to be active, run the tests, and shut down the server afterwards.

## Execution Report

Upon completion, a styled Excel spreadsheet report named `selenium_test_report.xlsx` is generated in this folder. It contains:
- Detailed status log for each test case (**PASS** / **FAIL**).
- Precise execution durations.
- Stack traces or error descriptions for failed test cases.
- High-level suite metrics (Passed/Failed counts, Total Duration).
