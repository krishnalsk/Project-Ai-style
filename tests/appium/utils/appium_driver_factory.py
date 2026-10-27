"""
appium_driver_factory.py - Initializes UiAutomator2 Android driver session.
"""

import os
from appium import webdriver
from appium.options.android import UiAutomator2Options

class AppiumDriverFactory:
    @staticmethod
    def get_options():
        options = UiAutomator2Options()
        options.platform_name = "Android"
        options.automation_name = "UiAutomator2"
        options.device_name = "Android Emulator"
        options.app_package = "com.example.best3"
        options.app_activity = "com.example.best3.MainActivity"
        options.no_reset = True
        return options
