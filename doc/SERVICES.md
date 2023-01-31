# Services

A list of external services available in TZDB,
and information required for authenticating with them.

- [Discord](https://discord.com)
  * TZDB service name: `discord`
  * Sign in at `https://discord.com/oauth2/authorize`
  * Query params:
    - `response_type=code`
    - `client_id=1069981963139694736`
    - `scope=identify`
    - `redirect_uri=TODO`
    - `prompt=consent`
  * Value to pass through to TZDB: `code` query param from returning URI