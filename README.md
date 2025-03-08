# Claude to T3 Chat Converter

A utility to convert Claude.ai chat exports to a format compatible with t3.chat's import feature.

## Prerequisites

- Node.js
- npm/yarn
- Claude.ai account with chat history

## Installation

1. Clone this repository
2. Install dependencies:

```bash
pnpm install
```

## Usage

### 1. Export Claude Data

1. Go to [claude.ai](https://claude.ai) > Settings > Account > Export Data
2. Wait for the email from Anthropic containing your data
3. Download and unzip the data
4. Place the conversations.json file in a `data` directory at the project root

### 2. Convert Your Data

The conversion process happens in two steps:

```bash
# Step 1: Clean and prepare conversations
pnpm run clean

# Step 2: Convert to T3 Chat format
pnpm run convert
```

This will generate a JSON file in the format: `t3chat-import-{timestamp}.json`

### 3. Import to T3 Chat

1. Visit [t3.chat](https://t3.chat)
2. Go to Settings > History & Sync
3. Use the import feature with your generated JSON file

## How It Works

The converter:

1. Removes empty conversations and duplicate messages from network errors
2. Processes threads and messages to match T3 Chat's schema
3. Validates the converted data
4. Outputs a compatible JSON file

## Note

Theo is constantly updating T3 Chat, so this script might not work for very long.

## Scripts

- `pnpm run clean` - Clean and prepare conversations
- `pnpm run convert` - Convert to T3 Chat format
- `pnpm run typecheck` - Type check the codebase
