"""
excel_reporter.py - Helper to export test execution records into formatted Excel.
"""

import json
from pathlib import Path
import openpyxl

def load_inventory_cases(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["cases"]
