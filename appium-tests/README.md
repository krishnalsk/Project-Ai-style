# Style AI - Android Appium E2E Testing Framework

This directory contains the automated end-to-end (E2E) testing suite for the **Style AI** Android mobile application. It utilizes **Appium** driven by **WebDriverIO** (Node.js client) to run through critical user scenarios on an emulator or physical device. Upon completion, the suite automatically compiles the execution analysis and pass/fail metrics into a beautifully formatted Excel spreadsheet.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Setup Instructions](#-setup-instructions)
3. [Running the Tests](#-running-the-tests)
4. [Excel Report Structure](#-excel-report-structure)

---

## ⚙️ Prerequisites

Before executing the tests, ensure you have the following installed on your machine:

1. **Node.js** (v18 or higher)
2. **Java Development Kit (JDK)** (Required for Android build tools and SDK)
3. **Android Studio & SDK** (With an Android Virtual Device / Emulator configured)
4. **Appium Server**:
   ```bash
   npm install -g appium
   ```
5. **Appium UiAutomator2 Driver**:
   ```bash
   appium driver install uiautomator2
   ```

---

## 🛠 Setup Instructions

### 1. Start the Android Emulator
Launch your Android Virtual Device (AVD) from Android Studio, or list and start it via command line:
```bash
emulator -list-avds
emulator -avd <Your_Device_Name>
```
Verify the device is connected by running `adb devices`.

### 2. Build the Android App APK
The Appium script expects the debug APK to be compiled and present at `app/build/outputs/apk/debug/app-debug.apk`. 

Navigate to the project root directory and run the Gradle assembler:
- **Windows (PowerShell/CMD)**:
  ```powershell
  .\gradlew.bat assembleDebug
  ```
- **macOS/Linux**:
  ```bash
  ./gradlew assembleDebug
  ```

### 3. Install Test Dependencies
Navigate to this testing directory and install WebDriverIO and ExcelJS:
```bash
cd appium-tests
npm install
```

---

## 🚀 Running the Tests

1. **Start the Appium Server**:
   In a separate terminal panel, start the Appium server on its default port:
   ```bash
   appium
   ```

2. **Execute the Test Suite**:
   In this directory (`appium-tests/`), launch the test runner:
   ```bash
   npm test
   ```
   *This executes the `node run-tests.js` script.*

---

## 📊 Excel Report Structure

After the automation finishes, it compiles and saves a styled report file named **`appium_test_report.xlsx`** inside this folder. The report includes:

- **E2E Test Details Table**:
  - **Test ID**: Unique code (`TC_001`, `TC_002`, etc.)
  - **Test Case Name**: Summary of the flow (Onboarding, Login, Dashboard, Try-On, Checkout)
  - **Duration (ms)**: Time taken to execute the test case
  - **Status**: **PASS** (highlighted in soft green) or **FAIL** (highlighted in soft red)
  - **Execution Details / Error Logs**: Full assertion status or exception stack trace details if a test fails
- **Summary Statistics Panel**:
  - Total tests executed
  - Count of passed and failed test cases
  - Sum duration of E2E verification
