"""
home_page.py - Page Object for Style AI Landing and Navigation.
"""

from selenium.webdriver.common.by import By
from .base_page import BasePage

class HomePage(BasePage):
    LOGO = (By.CSS_SELECTOR, "a[href='/']")
    NAVBAR = (By.TAG_NAME, "nav")
    AI_STYLIST_LINK = (By.CSS_SELECTOR, "a[href*='ai-stylist']")
    SKIN_FORECAST_LINK = (By.CSS_SELECTOR, "a[href*='skin-forecast']")
    LABEL_LENS_LINK = (By.CSS_SELECTOR, "a[href*='label-lens']")
    SHOP_LINK = (By.CSS_SELECTOR, "a[href*='shop']")
    CART_BUTTON = (By.CSS_SELECTOR, "a[href*='cart']")

    def open(self, base_url):
        self.navigate_to(base_url)

    def is_navbar_displayed(self):
        return self.is_visible(*self.NAVBAR)

    def go_to_shop(self):
        self.click(*self.SHOP_LINK)

    def go_to_ai_stylist(self):
        self.click(*self.AI_STYLIST_LINK)
