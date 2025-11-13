# Unused Code Analysis

## CSS (assets/css/index.css)

### Completely Unused Classes/Selectors:

1. **`.pay`** (line 118-134) - Payment button styles, not used anywhere in HTML or JS
2. **`#conclusion`** (lines 158, 164, 912, 917) - Conclusion section styles. **Note:** This appears to be planned but never implemented. The CSS styles `#introduction ul li::before` and `#conclusion ul li::before` together, but only `#introduction` exists in HTML. The `#conclusion` element is completely missing from all HTML files.
3. **`.projectDescriptionContainer`** (lines 313-322, 936-939) - Project description container, not used in HTML or JS
4. **`.projectDescription`** (lines 325-337, 940-948) - Project description styles, not used in HTML or JS
5. **`.mobileprojectDescription`** (lines 774-783, 950-953) - Mobile project description, not used in HTML or JS
6. **`.full-w`** (line 512-514) - Full width class, not used in HTML or JS
7. **`.full-w-margins`** (lines 516-522, 958, 968) - Full width with margins, not used in HTML or JS
8. **`.mobile-andmore`** (lines 508-510, 885-887) - Mobile "and more" text, not used in HTML or JS
9. **`#spacer`** (line 504-506) - Spacer element, not used in HTML or JS
10. **`#close`** (lines 762, 874) - Close button styles, but only `#exit` is used in HTML. No JS references to `#close` found.

### Actually USED (not unused):

11. **`.pointer-events-none`** (line 977-979) - ✅ **USED** - Added/removed dynamically in `app.js` (lines 236, 241) via `classList.add/remove()`
12. **`.hidden`** (line 841) - ✅ **USED** - Used in screensaver.js, but screensaver is disabled, so conditionally unused

### Commented Out/Unused Code:

12. **Commented hover styles** (lines 1024-1030) - Project buttons hover effects are commented out

```css
/* #project-buttons button:hover .title {
  display: unset;
}

#project-buttons button:hover .num {
  display: none;
} */
```

## JavaScript

### Unused Functions:

1. **`initScreensaver()`** (screensaver.js, line 9) - Function is defined but commented out in app.js (line 19)
2. **`incrementSSImage()`** (screensaver.js, line 144) - Only called from `initScreensaver()`, so unused
3. **`throttle()`** (screensaver.js, line 169) - Only used by screensaver code, but screensaver is disabled

### Unused Code/Comments:

4. **Lightbox marquee references** (app.js, lines 11-14, 76-77) - Commented out code referencing `#lb-mqr` which doesn't exist

## HTML

### Missing Image References:

1. **`text.jpg`** - Referenced in index.html carousels (lines 139, 265, 400) but files may not exist:

   - `media/pages/publication-slavija/text.jpg` (line 139)
   - `media/pages/publication-gabagool/text.jpg` (line 265)
   - `media/pages/kalendar-mockup/text.jpg` (line 400)

2. **`tekst desiderata.jpg`** - Referenced in index.html (line 513) and publication-desiderata.html (line 108) - this one exists

### Unused Elements:

3. **`#close`** - CSS exists but HTML uses `#exit` instead

## Detailed Analysis

### `#conclusion` - Special Case

The `#conclusion` selector appears in CSS but the element doesn't exist in HTML. However, it's styled alongside `#introduction` which DOES exist:

- Line 158: `#introduction ul li::before, #conclusion ul li::before` - Shared pseudo-element styles
- Line 164: `#conclusion #contact` - Specific conclusion contact styles
- Lines 912, 917: Mobile responsive styles for `#conclusion`

This suggests `#conclusion` was planned (perhaps as a footer/contact section) but never implemented. The site uses `#info` instead for contact information.

### `.pointer-events-none` - Actually Used!

This class IS used dynamically via JavaScript:

- `app.js` line 236: `document.body.classList.add("pointer-events-none")`
- `app.js` line 241: `document.body.classList.remove("pointer-events-none")`

So this is NOT unused - it's applied/removed programmatically during page transitions.

### `.hidden` - Conditionally Unused

The `.hidden` class is used in `screensaver.js` but since the screensaver is disabled, it's effectively unused. However, if you re-enable the screensaver, this class would be needed.

## Summary

**Total Unused CSS Rules:** ~10 classes/selectors (`.pointer-events-none` is actually used)
**Total Unused JavaScript Functions:** 3 functions (screensaver-related)
**Total Commented Code:** Multiple sections
**Potential Missing Files:** 3 text.jpg files (need verification)
**Planned but Unimplemented:** `#conclusion` element (CSS exists but HTML doesn't)

## Recommendations

1. Remove all screensaver-related code (CSS, JS) since it's disabled
2. Remove unused CSS classes (`.pay`, `#conclusion`, `.projectDescription*`, etc.)
3. Remove commented-out code blocks
4. Verify if `text.jpg` files exist for all projects
5. Remove `#close` CSS if only `#exit` is used
6. Clean up unused mobile/responsive styles that aren't needed
