"""
base_page.py - Base Page Object with explicit waits, locator helpers, and screenshot utility.
"""

import os
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class BasePage:
    def __init__(self, driver, timeout=10):
        self.driver = driver
        self.timeout = timeout
        self.wait = WebDriverWait(driver, timeout)

    def navigate_to(self, url):
        self.driver.get(url)

    def find(self, by, locator):
        return self.wait.until(EC.presence_of_element_located((by, locator)))

    def find_visible(self, by, locator):
        return self.wait.until(EC.visibility_of_element_located((by, locator)))

    def click(self, by, locator):
        element = self.wait.until(EC.element_to_be_clickable((by, locator)))
        element.click()

    def type_text(self, by, locator, text):
        element = self.find_visible(by, locator)
        element.clear()
        element.send_keys(text)

    def is_visible(self, by, locator):
        try:
            return self.find_visible(by, locator).is_displayed()
        except (TimeoutException, NoSuchElementException):
            return False

    def get_title(self):
        return self.driver.title

    def take_screenshot(self, filepath):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        return self.driver.save_screenshot(filepath)
