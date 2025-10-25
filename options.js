// Options page script for Quick Highlighter

// Load saved settings when page loads
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['notionToken', 'notionDbId'], (result) => {
    if (result.notionToken) {
      document.getElementById('notionToken').value = result.notionToken;
    }
    if (result.notionDbId) {
      document.getElementById('notionDbId').value = result.notionDbId;
    }
  });
});

// Save settings when form is submitted
document.getElementById('settingsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const notionToken = document.getElementById('notionToken').value.trim();
  const notionDbId = document.getElementById('notionDbId').value.trim();
  const statusDiv = document.getElementById('status');
  
  // Validate inputs
  if (!notionToken || !notionDbId) {
    statusDiv.className = 'status error';
    statusDiv.textContent = '❌ Both fields are required!';
    return;
  }
  
  // Save to chrome storage
  chrome.storage.local.set({
    notionToken: notionToken,
    notionDbId: notionDbId
  }, () => {
    statusDiv.className = 'status success';
    statusDiv.textContent = '✅ Settings saved successfully!';
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  });
});
