// Service worker (Manifest V3).
// Opens the Side Panel when the toolbar icon is clicked.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('[AJO Payload Generator] setPanelBehavior failed:', error))
