"""
webdriver_factory.py - WebDriver initialization with headless CI options.
"""

import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

class WebDriverFactory:
    @staticmethod
    def get_driver(headless=True):
        options = Options()
        if headless or os.environ.get("CI") == "true":
            options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--ignore-certificate-errors")
        
        driver = webdriver.Chrome(options=options)
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(5)
        return driver
