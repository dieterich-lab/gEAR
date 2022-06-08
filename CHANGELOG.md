# Change Log

Changes to the DHART branch (gEAR) will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased] - 2022-04

### Added 
- h5ad uploader class.
- Organisms: pig (img).

### Changed
- CGI scripts (adjust shebang, see install notes).
- MariaDB-related ini/setup files (create_schema.sql).
- Organisms list (index.html).

### Fixed
- `ValueError: DataFrame index must be unique for orient='index'`, `ValueError: cannot reindex from a duplicate axis:` in lib/gear/metadata.py (drop NaNs from metadata).
- `AttributeError: module 'cgi' has no attribute 'escape'` in www/cgi (removed from Python 3.8, use html).

### Removed
- Organisms: chicken, marmoset.
