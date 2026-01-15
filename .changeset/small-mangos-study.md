---
'@journium/react': patch
'@journium/js': patch
---

Remote config changes for autocapture settings (autoTrackPageviews, captureClicks, captureFormSubmits, etc.) were not applied after SDK initialization. This fix ensures remote config changes are respected immediately, restoring the intended remote control functionality.
