/** @brief Stores previously seen entries to detect new ones */
let previousEntries = new Set();


/** @brief Fetches history data from the API */
export async function fetchHistory(onHistoryReceived) {
  try {
    const response = await fetch('/api/get-history');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data.success && Array.isArray(data.history)) {
      return onHistoryReceived(data.history, previousEntries, updatePreviousEntries);
    }
  } catch (error) {
    console.error('Failed to fetch history:', error);
    document.getElementById('winners-list').innerHTML = 
      '<div class="error">Failed to load history</div>';
    return null;
  }
}


/** @brief Updates the set of previously seen entries */
function updatePreviousEntries(newEntries) {
  previousEntries = newEntries;
}


/** @brief Helper function to escape HTML and prevent XSS */
export function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
