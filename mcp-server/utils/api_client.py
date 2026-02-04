import os
import time
import requests
from typing import Dict
from config import Config


class GitAlertsAPIClient:
    def __init__(self) -> None:
        self.base_url = Config.get_env("GITALERTS_API_BASE_URL")
        self.username = Config.get_env("GITALERTS_USERNAME")
        self.password = Config.get_env("GITALERTS_PASSWORD")

        self.access_token = None
        self.access_token_expiry = 0

    def _login(self):
        response = requests.post(
            url=f"{self.base_url}/api/token/",
            json={"username": self.username, "password": self.password},
        )
        response.raise_for_status()
        data = response.json()

        self.access_token = data["access"]
        self.access_token_expiry = time.time() + (24 * 60 * 60)

    def _get_token(self):
        if not self.access_token or time.time() >= self.access_token_expiry:
            self._login()
        return self.access_token

    def request(self, method: str, path: str, **kwargs):
        token = self._get_token()
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }
        response = requests.request(
            method=method,
            url=f"{self.base_url}{path}",
            headers=headers,
            **kwargs,
        )
        response.raise_for_status()

        if response.status_code == 204 or not response.content:
            return None

        return response.json()
