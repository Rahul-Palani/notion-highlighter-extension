// Content script for Quick Highlighter extension

// Inject styles for highlights
(function injectStyles() {
  if (document.getElementById("qh-highlight-styles")) return;
  
  const style = document.createElement("style");
  style.id = "qh-highlight-styles";
  style.textContent = `
    .qh-highlight {
      background-color: #fff59d !important;
      border-radius: 2px;
      padding: 0 0.05em;
      position: relative;
      display: inline;
    }
    .qh-highlight:hover {
      outline: 1px solid #f9a825;
    }
    .qh-highlight-notion {
      background-color: #bbdefb !important;
      border-radius: 2px;
      padding: 0 0.05em;
      position: relative;
      display: inline;
    }
    .qh-highlight-notion:hover {
      outline: 1px solid #2196f3;
    }
    .qh-remove-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 16px;
      height: 16px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 10px;
      line-height: 16px;
      text-align: center;
      cursor: pointer;
      display: none;
      z-index: 10000;
      padding: 0;
      font-weight: bold;
      pointer-events: auto;
    }
    .qh-remove-btn:hover {
      background: #d32f2f;
      transform: scale(1.1);
    }
    .qh-highlight:hover .qh-remove-btn,
    .qh-highlight-notion:hover .qh-remove-btn,
    .qh-remove-btn:hover {
      display: block;
    }
    .qh-highlight,
    .qh-highlight-notion {
      cursor: default;
    }
  `;
  document.head.appendChild(style);
})();

// Main highlight function
function highlightSelection(isNotion = false) {
  const selection = window.getSelection();
  
  // Early exit if no selection
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return;
  }
  
  // Check if selection is already inside a highlight
  const commonAncestor = selection.getRangeAt(0).commonAncestorContainer;
  const parentElement = commonAncestor.nodeType === Node.TEXT_NODE 
    ? commonAncestor.parentElement 
    : commonAncestor;
  
  if (parentElement && (parentElement.closest(".qh-highlight") || parentElement.closest(".qh-highlight-notion"))) {
    // Already highlighted, skip
    selection.collapseToEnd();
    return;
  }
  
  // Process each range in the selection
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    
    // Skip if range is empty
    if (range.collapsed) continue;
    
    try {
      // Create highlight span
      const highlight = document.createElement("span");
      highlight.className = isNotion ? "qh-highlight-notion" : "qh-highlight";
      
      // Create remove button
      const removeBtn = document.createElement("button");
      removeBtn.className = "qh-remove-btn";
      removeBtn.textContent = "×";
      removeBtn.setAttribute("aria-label", "Remove highlight");
      removeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeHighlight(highlight);
      });
      
      // Extract and wrap the selected content
      const contents = range.extractContents();
      highlight.appendChild(contents);
      highlight.appendChild(removeBtn);
      
      // Insert the highlight at the range position
      range.insertNode(highlight);
      
      // Move range to after the highlight
      range.setStartAfter(highlight);
      range.setEndAfter(highlight);
    } catch (error) {
      console.error("Quick Highlighter: Failed to highlight range", error);
    }
  }
  
  // Collapse selection to end to prevent re-highlighting
  selection.collapseToEnd();
}

// Remove highlight function
function removeHighlight(highlightElement) {
  const parent = highlightElement.parentNode;
  if (!parent) return;
  
  // Move all child nodes (except the remove button) out of the highlight
  while (highlightElement.firstChild) {
    const child = highlightElement.firstChild;
    // Skip the remove button
    if (child.classList && child.classList.contains('qh-remove-btn')) {
      highlightElement.removeChild(child);
      continue;
    }
    parent.insertBefore(child, highlightElement);
  }
  
  // Remove the now-empty highlight span
  parent.removeChild(highlightElement);
  
  // Normalize the parent to merge adjacent text nodes
  parent.normalize();
}

// Listen for highlight event from background script
document.addEventListener("qh:highlightNow", () => {
  highlightSelection(false);
});

// Listen for Notion highlight event from background script
document.addEventListener("qh:highlightNotion", () => {
  highlightSelection(true);
});

/*
 * DEVELOPER INSTRUCTIONS:
 * 
 * This content script:
 * - Injects CSS styles for the .qh-highlight class
 * - Listens for a custom "qh:highlightNow" event dispatched by the background script
 * - Wraps selected text in a <span class="qh-highlight"> element
 * - Avoids nesting highlights by checking if selection is already highlighted
 * - Collapses selection after highlighting to prevent repeated wrapping
 * 
 * The highlight color (#fff59d) is a light yellow that's easy on the eyes.
 * Hover effect adds a subtle golden outline for better visibility.
 */
