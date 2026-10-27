"""
shop_page.py - Page Object for Style AI Shop & Product Catalog.
"""

from selenium.webdriver.common.by import By
from .base_page import BasePage

class ShopPage(BasePage):
    CATALOG_GRID = (By.CSS_SELECTOR, "div.grid, div[class*='grid']")
    PRODUCT_CARDS = (By.CSS_SELECTOR, "div[class*='product'], div[class*='card']")
    SEARCH_INPUT = (By.CSS_SELECTOR, "input[type='search'], input[placeholder*='Search']")

    def open(self, base_url):
        self.navigate_to(f"{base_url.rstrip('/')}/shop")

    def get_product_count(self):
        cards = self.driver.find_elements(*self.PRODUCT_CARDS)
        return len(cards)
