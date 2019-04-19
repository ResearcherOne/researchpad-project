# Version Auto Updater

## Description

Basic express server to pull latest release information from GitHub using
webhooks. Webhook version information will be stored in directories setup
in the config.json file. Version files will be created in these directories
with the names of version releases. Future releases of this may store this
information in a database instead of files.

Latest release url from GitHub can be used to download the .zip file of
the latest release from an electronjs application.

## Support

- darwin

## API

### GET /updates/darwin/latest?v={current version}

- Query Params: v - current version
- Returns: url for .zip file for latest release

### POST /release/darwin

- GitHub webhook integration for darwin releases
- Release Naming: xxxx.xxxx.xxxx
- Release Branch: setup in config.json

### GET /updates/win32/latest - does nothing

### POST /release/win32 - does nothing
