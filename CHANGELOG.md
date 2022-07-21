# Change Log

Changes to the DHART branch (gEAR) will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased] - 2022-07

### Added
- Metadata assembly token.
- h5ad uploader class.
- Organisms: pig (img).

### Changed
- Metadata annotation_source and annotation_release_number now optional.
- CGI scripts (adjust shebang, see install notes).
- MariaDB-related ini/setup files (create_schema.sql).
- Organisms list (index.html).

### Fixed
- `ValueError: DataFrame index must be unique for orient='index'`, `ValueError: cannot reindex from a duplicate axis:` in lib/gear/metadata.py (drop NaNs from metadata).
- `AttributeError: module 'cgi' has no attribute 'escape'` in www/cgi (removed from Python 3.8, use html).
- Reset email: rely on gear.ini w/o password, sending from localhost, removed hard coded (except styling/color).
- 'create_github_issue.cgi`: remove hard coded (added to gear.ini), fix post request using GraphQL API (projects beta).

### Removed
- Organisms: chicken, marmoset.
