"""
locustfile.py - Official Locust Load Testing Scenario for Style AI.
Simulates 100 concurrent virtual users navigating catalog, AI stylist, and fabric encyclopedia.
"""

from locust import HttpUser, task, between

class StyleAiShopper(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def view_homepage(self):
        self.client.get("/")

    @task(2)
    def browse_shop_catalog(self):
        self.client.get("/shop")

    @task(2)
    def view_ai_stylist(self):
        self.client.get("/ai-stylist")

    @task(1)
    def view_fabric_encyclopedia(self):
        self.client.get("/fabric-encyclopedia")

    @task(1)
    def view_skin_forecast(self):
        self.client.get("/skin-forecast")
