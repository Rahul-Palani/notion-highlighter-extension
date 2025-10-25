# Quick Highlighter Chrome Extension

A Chrome extension (Manifest V3) that allows you to highlight text on any webpage and optionally save highlights to Notion.

## Features

- 🟡 **Highlight text** - Right-click selected text and choose "Highlight selection" (yellow)
- 🔵 **Save to Notion** - Right-click selected text and choose "Save highlight to Notion" (light blue)
- ❌ **Remove highlights** - Hover over any highlight to see an X button and click to remove
- 💾 **Notion integration** - Automatically saves highlights with metadata (quote, source URL, page title, etc.)

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the extension folder

## Setup for Notion Integration

1. Create a Notion integration at [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Copy your integration secret token
3. Create a database in Notion with these properties:
   - **Name** (Title)
   - **Quote** (Text)
   - **Source URL** (URL)
   - **Page Title** (Text)
   - **Color** (Text)
   - **Created At** (Date)
4. Share the database with your integration (click ••• → Connections)
5. Copy your database ID from the URL
6. Open extension options and enter:
   - Notion Integration Secret
   - Notion Database ID

## Usage

1. Navigate to any website
2. Select text on the page
3. Right-click and choose:
   - **"Highlight selection"** - Creates a yellow highlight on the page
   - **"Save highlight to Notion"** - Creates a blue highlight AND saves to your Notion database
4. Hover over any highlight to see the X button
5. Click X to remove the highlight

## Files

- `manifest.json` - Extension configuration (MV3)
- `background.js` - Service worker for context menu and Notion API
- `content.js` - Content script for highlighting functionality
- `options.html` - Settings page UI
- `options.js` - Settings page logic

## Technologies

- Manifest V3
- Chrome Extensions API
- Notion API v2022-06-28
- Vanilla JavaScript
Backlog
-fix issues with delete button

## License
MIT
