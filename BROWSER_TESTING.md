# ⚠️ CRITICAL: Browser Testing Notice

## Right-Click and Text Selection Testing

**IMPORTANT:** If you are viewing this site in the **internal Cursor Browser**, please test in a **real browser** like Chrome, Firefox, or Edge.

The Cursor internal browser may have restrictions that block right-click and text selection functionality, even though the code is correctly configured to allow it.

### To Verify Right-Click Works:

1. **Open the site in Chrome/Firefox/Edge** (not Cursor's internal browser)
2. Right-click anywhere on the page
3. You should see the standard browser context menu
4. Try selecting text - it should work everywhere, including code blocks

### What's Been Configured:

✅ Global CSS with `user-select: text !important`  
✅ CodeBlock component with explicit text selection enabled  
✅ EnableContextMenu component to ensure context menu isn't blocked  
✅ No JavaScript preventing right-click or text selection  

If right-click still doesn't work in a real browser, check:
- Browser extensions that might block context menus
- Browser security settings
- System-level restrictions

