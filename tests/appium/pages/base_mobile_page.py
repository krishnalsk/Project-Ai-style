"""
base_mobile_page.py - Base mobile page object with UiAutomator2 helpers, scroll, and touch actions.
"""

from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BaseMobilePage:
    def __init__(self, driver, timeout=15):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)

    def find_by_content_desc(self, desc):
        return self.wait.until(EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, desc)))

    def click_desc(self, desc):
        self.find_by_content_desc(desc).click()

    def find_by_xpath(self, xpath):
        return self.wait.until(EC.presence_of_element_located((AppiumBy.XPATH, xpath)))
