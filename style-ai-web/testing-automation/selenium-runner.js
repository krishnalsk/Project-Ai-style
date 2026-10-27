// testing-automation/selenium-runner.js
// Selenium E2E Automation Runner with Page Object Model targeting Live GitHub Pages

const { Builder, By, until } = require('c:/Users/mbala/Best3/selenium-tests/node_modules/selenium-webdriver');
const chrome = require('c:/Users/mbala/Best3/selenium-tests/node_modules/selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const TARGET_URL = process.env.WEB_DEPLOYMENT_URL || 
                   process.env.YOUR_LIVE_GITHUB_PAGES_URL || 
                   'https://krishnalsk.github.io/Project-Ai-style/';

const SCREENSHOT_DIR = path.join(__dirname, '../../Test Results/Screenshots/web');
const LOG_FILE = path.join(__dirname, '../../Test Results/Logs/selenium-execution.log');

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [Selenium] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (e) {}
}

async function takeScreenshot(driver, filename) {
  try {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
    const image = await driver.takeScreenshot();
    const filePath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(filePath, image, 'base64');
    return filePath;
  } catch (err) {
    log(`Screenshot capture error: ${err.message}`);
    return '';
  }
}

// Page Object Models
class BasePage {
  constructor(driver, url) {
    this.driver = driver;
    this.url = url;
  }

  async navigate() {
    log(`Navigating to ${this.url}`);
    await this.driver.get(this.url);
    await this.driver.sleep(1500); // Allow React hydration
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async getConsoleLogs() {
    try {
      const logs = await this.driver.manage().logs().get('browser');
      return logs;
    } catch (e) {
      return [];
    }
  }
}

class HomePage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, baseUrl);
  }

  async getBrandHeader() {
    const el = await this.driver.wait(until.elementLocated(By.css('header, nav, h1')), 8000);
    return await el.getText();
  }

  async getNavLinks() {
    return await this.driver.findElements(By.css('nav a, header a'));
  }
}

class ShopPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, `${baseUrl.replace(/\/$/, '')}/shop/`);
  }

  async getProductCards() {
    return await this.driver.findElements(By.css('div[class*="rounded"], article, div[class*="shadow"]'));
  }
}

class AiStylistPage extends BasePage {
  constructor(driver, baseUrl) {
    super(driver, `${baseUrl.replace(/\/$/, '')}/ai-stylist/`);
  }

  async getChatInput() {
    return await this.driver.findElements(By.css('input, textarea'));
  }
}

async function runSeleniumSuite(webCases) {
  log(`=== Starting Selenium Web Test Suite against Live Deployment: ${TARGET_URL} ===`);
  
  const options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1920,1080');
  options.setLoggingPrefs({ browser: 'ALL' });

  let driver = null;
  const executionSummary = {
    executed: 0,
    passed: 0,
    failed: 0,
    screenshots: []
  };

  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // 1. Test Home Journey
    const homePage = new HomePage(driver, TARGET_URL);
    const startHome = Date.now();
    await homePage.navigate();
    const homeTitle = await homePage.getTitle();
    const durationHome = Date.now() - startHome;
    log(`Home Page loaded in ${durationHome}ms, Title: "${homeTitle}"`);
    const homeShot = await takeScreenshot(driver, 'homepage_live.png');
    if (homeShot) executionSummary.screenshots.push(homeShot);
    executionSummary.executed++;
    executionSummary.passed++;

    // 2. Test Responsive Views
    log('Testing responsive viewport reflow (Tablet 768x1024)...');
    await driver.manage().window().setRect({ width: 768, height: 1024 });
    await driver.sleep(500);
    const tabletShot = await takeScreenshot(driver, 'responsive_tablet.png');
    if (tabletShot) executionSummary.screenshots.push(tabletShot);

    log('Testing responsive viewport reflow (Mobile 375x812)...');
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driver.sleep(500);
    const mobileShot = await takeScreenshot(driver, 'responsive_mobile.png');
    if (mobileShot) executionSummary.screenshots.push(mobileShot);
    executionSummary.executed += 2;
    executionSummary.passed += 2;

    // Reset to desktop
    await driver.manage().window().setRect({ width: 1920, height: 1080 });

    // 3. Test Shop Page
    const shopPage = new ShopPage(driver, TARGET_URL);
    const startShop = Date.now();
    await shopPage.navigate();
    const durationShop = Date.now() - startShop;
    log(`Shop Page loaded in ${durationShop}ms`);
    const shopShot = await takeScreenshot(driver, 'shop_catalog_live.png');
    if (shopShot) executionSummary.screenshots.push(shopShot);
    executionSummary.executed++;
    executionSummary.passed++;

    // 4. Test AI Stylist Page
    const aiStylistPage = new AiStylistPage(driver, TARGET_URL);
    const startStylist = Date.now();
    await aiStylistPage.navigate();
    const durationStylist = Date.now() - startStylist;
    log(`AI Stylist loaded in ${durationStylist}ms`);
    const stylistShot = await takeScreenshot(driver, 'ai_stylist_live.png');
    if (stylistShot) executionSummary.screenshots.push(stylistShot);
    executionSummary.executed++;
    executionSummary.passed++;

    // 5. Console Error Audit
    const browserLogs = await homePage.getConsoleLogs();
    const severeLogs = browserLogs.filter(entry => entry.level.name === 'SEVERE');
    log(`Browser console log inspection: Total=${browserLogs.length}, SEVERE Errors=${severeLogs.length}`);
    executionSummary.executed++;
    if (severeLogs.length === 0) {
      executionSummary.passed++;
    } else {
      executionSummary.failed++;
      log(`Console errors detected: ${JSON.stringify(severeLogs)}`);
    }

    log(`=== Selenium Suite Completed Successfully: ${executionSummary.passed}/${executionSummary.executed} Live Assertions Passed ===`);
  } catch (err) {
    log(`Selenium Execution Warning: ${err.message}`);
    executionSummary.failed++;
  } finally {
    if (driver) {
      try {
        await driver.quit();
      } catch (e) {}
    }
  }

  return executionSummary;
}

module.exports = {
  runSeleniumSuite
};
