// Background service worker for Quick Highlighter extension

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "quickHighlight",
    title: "Highlight selection",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "saveToNotion",
    title: "Save highlight to Notion",
    contexts: ["selection"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "quickHighlight" && tab.id) {
    // Execute a small script to dispatch custom event to content script
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.dispatchEvent(new CustomEvent("qh:highlightNow"));
      }
    });
  }
  
  if (info.menuItemId === "saveToNotion" && tab.id) {
    handleSaveToNotion(info, tab);
  }
});

// Handle saving highlight to Notion
async function handleSaveToNotion(info, tab) {
  try {
    // Get Notion credentials from storage
    const storage = await chrome.storage.local.get(['notionToken', 'notionDbId']);
    let { notionToken, notionDbId } = storage;
    
    // Check if credentials are configured
    if (!notionToken || !notionDbId) {
      console.warn('⚠️ Quick Highlighter: Notion credentials not configured. Please set them in the extension options.');
      return;
    }
    
    // Normalize database ID (remove dashes if present)
    notionDbId = notionDbId.replace(/-/g, '');
    
    // Extract selection data from the page
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractSelectionData
    });
    
    if (!result || !result.result) {
      console.warn('⚠️ Quick Highlighter: No selection data extracted.');
      return;
    }
    
    const selectionData = result.result;
    
    // Skip if no quote
    if (!selectionData.quote) {
      console.warn('⚠️ Quick Highlighter: No text selected.');
      return;
    }
    
    // Prepare Notion API payload
    const notionPayload = {
      parent: { database_id: notionDbId },
      properties: {
        "Name": {
          title: [
            {
              text: {
                content: selectionData.quote.slice(0, 50) || "Highlight"
              }
            }
          ]
        },
        "Quote": {
          rich_text: [
            {
              text: {
                content: selectionData.quote
              }
            }
          ]
        },
        "Source URL": {
          url: selectionData.pageUrl
        },
        "Page Title": {
          rich_text: [
            {
              text: {
                content: selectionData.pageTitle
              }
            }
          ]
        },
        "Color": {
          rich_text: [
            {
              text: {
                content: selectionData.color
              }
            }
          ]
        },
        "Created At": {
          date: {
            start: selectionData.createdAt
          }
        }
      }
    };
    
    // Send to Notion API
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notionPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Quick Highlighter: Notion API error (${response.status}):`, errorText);
      return;
    }
    
    const responseData = await response.json();
    console.log('✅ Quick Highlighter: Successfully saved to Notion:', responseData);
    
    // Also highlight the text on the page in blue
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.dispatchEvent(new CustomEvent("qh:highlightNotion"));
      }
    });
    
  } catch (error) {
    console.error('❌ Quick Highlighter: Error saving to Notion:', error);
  }
}

// Function to extract selection and metadata from the page
function extractSelectionData() {
  const selection = window.getSelection();
  
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }
  
  const range = selection.getRangeAt(0);
  const quote = selection.toString().trim();
  
  // Extract prefix (40 chars before selection)
  let prefix = '';
  try {
    const preRange = range.cloneRange();
    preRange.setStart(range.startContainer, Math.max(0, range.startOffset - 40));
    preRange.setEnd(range.startContainer, range.startOffset);
    prefix = preRange.toString().trim();
  } catch (e) {
    // If extraction fails, leave empty
  }
  
  // Extract suffix (40 chars after selection)
  let suffix = '';
  try {
    const postRange = range.cloneRange();
    const endContainer = range.endContainer;
    const maxOffset = endContainer.textContent ? endContainer.textContent.length : range.endOffset;
    postRange.setStart(range.endContainer, range.endOffset);
    postRange.setEnd(range.endContainer, Math.min(maxOffset, range.endOffset + 40));
    suffix = postRange.toString().trim();
  } catch (e) {
    // If extraction fails, leave empty
  }
  
  return {
    quote: quote,
    prefix: prefix,
    suffix: suffix,
    pageTitle: document.title,
    pageUrl: location.href,
    color: "#fff59d",
    createdAt: new Date().toISOString()
  };
}

/*
 * DEVELOPER INSTRUCTIONS:
 * 
 * How to load:
 * 1. Open Chrome and navigate to chrome://extensions
 * 2. Enable "Developer mode" toggle in the top right
 * 3. Click "Load unpacked" button
 * 4. Select this extension's folder
 * 
 * How to use:
 * 1. Navigate to any website
 * 2. Select some text on the page
 * 3. Right-click on the selection
 * 4. Click "Highlight selection" from the context menu
 * 5. The selected text will be highlighted with a yellow background
 */
