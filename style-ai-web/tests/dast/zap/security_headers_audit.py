"""
security_headers_audit.py - Audits HTTP response headers for security hardening:
Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, etc.
"""

import requests

EXPECTED_HEADERS = [
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy"
]

def audit_target(url):
    try:
        res = requests.get(url, timeout=10)
        return {h: res.headers.get(h, "Missing") for h in EXPECTED_HEADERS}
    except Exception as e:
        return {"error": str(e)}
