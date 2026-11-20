import time
import requests
from config import Config, ConfigError


class GitAlertsAPIClient:
    """Thin wrapper around the GitAlerts REST API.

    Credentials are resolved in this order:
      1. GITALERTS_API_TOKEN     - a ready-made access token (expires after 24h)
      2. GITALERTS_REFRESH_TOKEN - a refresh token, exchanged for access tokens automatically
      3. GITALERTS_USERNAME + GITALERTS_PASSWORD - legacy login on every expiry

    The token modes exist so an MCP client config never has to hold an account
    password. See mcp-server/README.md.
    """

    def __init__(self) -> None:
        self.base_url = Config.get_env("GITALERTS_API_BASE_URL").rstrip("/")
        self.api_token = Config.get_env("GITALERTS_API_TOKEN", required=False)
        self.refresh_token = Config.get_env("GITALERTS_REFRESH_TOKEN", required=False)
        self.username = Config.get_env("GITALERTS_USERNAME", required=False)
        self.password = Config.get_env("GITALERTS_PASSWORD", required=False)

        if not (self.api_token or self.refresh_token or (self.username and self.password)):
            raise ConfigError(
                "No GitAlerts credentials configured. Set GITALERTS_REFRESH_TOKEN "
                "(recommended), GITALERTS_API_TOKEN, or the legacy "
                "GITALERTS_USERNAME + GITALERTS_PASSWORD pair."
            )

        self.access_token = self.api_token
        self.access_token_expiry = float("inf") if self.api_token else 0

    def _login(self):
        # A pre-issued access token is used as-is; it cannot be renewed by us.
        if self.api_token:
            return

        if self.refresh_token:
            response = requests.post(
                url=f"{self.base_url}/api/token/refresh/",
                json={"refresh": self.refresh_token},
                timeout=10,
            )
            response.raise_for_status()
            self.access_token = response.json()["access"]
            # Refresh slightly early so a request never races the expiry check.
            self.access_token_expiry = time.time() + (23 * 60 * 60)
            return

        response = requests.post(
            url=f"{self.base_url}/api/token/",
            json={"username": self.username, "password": self.password},
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        self.access_token = data["access"]
        self.access_token_expiry = time.time() + (24 * 60 * 60)

    def _get_token(self):
        if not self.access_token or time.time() >= self.access_token_expiry:
            self._login()
        assert self.access_token is not None
        return self.access_token

    def _send(self, method: str, path: str, token: str, **kwargs):
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }
        return requests.request(
            method=method,
            url=f"{self.base_url}{path}",
            headers=headers,
            timeout=15,
            **kwargs,
        )

    def request(self, method: str, path: str, **kwargs):
        response = self._send(method, path, self._get_token(), **kwargs)

        # A minted access token can expire mid-session; renew once and retry.
        if response.status_code == 401 and (self.refresh_token or self.username):
            self.access_token = None
            self.access_token_expiry = 0
            response = self._send(method, path, self._get_token(), **kwargs)

        response.raise_for_status()

        if response.status_code == 204 or not response.content:
            return None

        return response.json()
