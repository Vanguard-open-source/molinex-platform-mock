# Changelog

All notable changes to Molinex Mock API are documented in this file.

## [Unreleased]

### Added

- Public user registration, demo token issuance and commercial inquiry endpoints matching the backend contract.
- Three clearly synthetic demo accounts and optional bearer-token access through MOCK_REQUIRE_TOKEN.
- ProblemDetail errors and local execution documentation.

### Changed

- Numeric waste, machine and maintenance identities and references; server-assigned creation IDs.
- Block user/credential listing and unsupported plan/role endpoints.
- Reject a missing database path instead of silently creating an empty database.
