# Design Document

## Submission

**Team Name:** `Stack Underflow`  
**Submission Date:** August 13, 2024

---

## Overview

*placeholder*

---

## Group Members and Contributions

### 1. Joe Fang [`@MinecraftFuns`](https://github.com/MinecraftFuns)

- **Email:** <joe.fang@mail.utoronto.ca>
- **Contributions Since Phase 1:**
  - *placeholder*
  - *placeholder*
- **Significant Pull Request:**
  - [PR #123: *placeholder*](https://github.com/MinecraftFuns/project/pull/123)
    - *placeholder*

### 2. Minghe Ma [`@mhnwa`](https://github.com/mhnwa)

- **Email:** <minghe.ma@mail.utoronto.ca>
- **Contributions Since Phase 1:**
  - *placeholder*
  - *placeholder*
- **Significant Pull Request:**
  - [PR #124: *placeholder*](https://github.com/mhnwa/project/pull/124)
    - *placeholder*

### 3. Bilin Nong [`@Bilin22`](https://github.com/Bilin22)

- **Email:** <bilin.nong@mail.utoronto.ca>
- **Contributions Since Phase 1:**
  - *placeholder*
  - *placeholder*
- **Significant Pull Request:**
  - [PR #125: *placeholder*](https://github.com/Bilin22/project/pull/125)
    - *placeholder*

### 4. Yiyun Zhang [`@Yiyun95788`](https://github.com/Yiyun95788)

- **Email:** <yvonnezy.zhang@mail.utoronto.ca>
- **Contributions Since Phase 1:**
  - Email alert feature
  - *placeholder*
- **Significant Pull Request:**
  - [PR #126: *placeholder*](https://github.com/Yiyun95788/project/pull/126)
    - *placeholder*

### 5. Liangyu Zhu [`@larryzhuly`](https://github.com/larryzhuly)

- **Email:** <liangyu.zhu@mail.utoronto.ca>
- **Contributions Since Phase 1:**
  - *placeholder*
  - *placeholder*
- **Significant Pull Request:**
  - [PR #127: *placeholder*](https://github.com/larryzhuly/project/pull/127)
    - *placeholder*

---

## Additional Features

### Database

[**safeTO-DB**](database/README.md) is a key-value database developed with [**Cloudflare Workers KV**](https://developers.cloudflare.com/kv/). It allows users to organize data into collections and perform basic operations like creating, reading, updating, and deleting items while keeping collections separate from each other.

safeTO-DB can be accessed at <https://csc207-db.joefang.org/>, but you must provide a valid authentication token for it to function. If you need a token, please email us at <contact@csc207.joefang.org>.

#### Key Features

- **Authentication**: All requests to the database require an access token for security. You must include this token in the HTTP header as follows:

  ```yaml
  authorization: Bearer <your_api_key>
  ```

- **Version History**: The database tracks changes made to each key by keeping a version history. When you update a key, a new version is created, while older versions remain accessible with a `_hidden` property that determines their visibility.

### Core Endpoints

- **GET** `/get/{collection}/{key}`: This endpoint retrieves the most recent visible value for a specific key. It returns a success message (HTTP 200) if found, or an error (HTTP 404) if not.

- **PUT** `/put/{collection}/{key}`: This endpoint adds or updates a value associated with a key in a specific collection. If successful, it returns (HTTP 201); errors return (HTTP 400 or 401) depending on the issue.

- **DELETE** `/delete/{collection}/{key}`: This endpoint marks a key as hidden, making it effectively "invisible." A successful delete returns (HTTP 204).

- **GET** `/history/{collection}/{key}`: This endpoint allows you to see the version history for a specific key. It returns (HTTP 200) with the history details when successful.

- **GET** `/list/{collection}`: This endpoint lists all keys in a collection and supports pagination. A successful request gives (HTTP 200) along with the list of keys.

### Logging and Security

The database automatically logs each operation for tracking and auditing purposes, noting details like the user, action taken, and the affected keys. Certain key names are restricted from being modified to enhance security.

---

## Summary of Test Coverage

- *placeholder*
- *placeholder*