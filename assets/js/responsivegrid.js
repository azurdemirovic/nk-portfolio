/**
 * Responsive Grid Sizing
 * Adjusts grid item sizes based on number of photos and viewport space
 * to better fill the viewport - more photos = smaller items, fewer photos = larger items
 */

function adjustGridSizing() {
  // Only apply to project pages, not videography
  const projectContainer = document.querySelector(
    'div[data-barba-namespace="project"]'
  );
  if (!projectContainer) return;

  const gridContainer = projectContainer.querySelector(".gridContainer");
  if (!gridContainer) return;

  const gridItems = gridContainer.querySelectorAll(".grid-item");
  const itemCount = gridItems.length;

  if (itemCount === 0) return;

  // Calculate available space within the tinted-bg container
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth;

  // Get the tinted-bg container (parent that scrolls)
  const tintedBg = projectContainer.querySelector(".tinted-bg");
  if (!tintedBg) return;

  // Get actual computed heights of all elements that take up space above the grid
  const headerContainer = projectContainer.querySelector("#headerContainer");
  let headerTotalHeight = 0;
  if (headerContainer) {
    const headerStyles = window.getComputedStyle(headerContainer);
    headerTotalHeight =
      headerContainer.offsetHeight +
      (parseInt(headerStyles.marginBottom) || 0) +
      (parseInt(headerStyles.marginTop) || 0);
  }

  // Find projectText element (sibling before gridContainer)
  let textElement = gridContainer.previousElementSibling;
  while (textElement && !textElement.classList.contains("projectText")) {
    textElement = textElement.previousElementSibling;
  }
  let textTotalHeight = 0;
  if (textElement) {
    const textStyles = window.getComputedStyle(textElement);
    textTotalHeight =
      textElement.offsetHeight +
      (parseInt(textStyles.marginTop) || 0) +
      (parseInt(textStyles.marginBottom) || 0);
  }

  // Get footer element (sibling after grid)
  let footerElement = gridContainer.nextElementSibling;
  while (footerElement && footerElement.id !== "footer") {
    footerElement = footerElement.nextElementSibling;
  }
  let footerHeight = 0;
  if (footerElement) {
    const footerStyles = window.getComputedStyle(footerElement);
    footerHeight =
      footerElement.offsetHeight +
      (parseInt(footerStyles.paddingTop) || 0) +
      (parseInt(footerStyles.paddingBottom) || 0) +
      (parseInt(footerStyles.marginTop) || 0) +
      (parseInt(footerStyles.marginBottom) || 0);
  }

  // Get marquee spacer height (the <br /> inside it)
  const marqueeSpacer = projectContainer.querySelector(".marquee-spacer");
  let marqueeSpacerHeight = 0;
  if (marqueeSpacer) {
    marqueeSpacerHeight = marqueeSpacer.offsetHeight;
  }

  // Get grid container margins
  const gridStyles = window.getComputedStyle(gridContainer);
  const gridMarginTop = parseInt(gridStyles.marginTop) || 0;
  const gridMarginBottom = parseInt(gridStyles.marginBottom) || 0;

  // tinted-bg padding: 14px top, calc(14px + 42px) bottom = 56px bottom total
  // The padding-bottom already accounts for marquee space (30px + 12px = 42px)
  // clientHeight already excludes padding, so use it directly
  const tintedBgClientHeight = tintedBg.clientHeight || viewportHeight;

  // Available space for grid = client height minus all other elements
  // Note: clientHeight excludes padding, so we don't need to subtract it separately
  let availableHeight =
    tintedBgClientHeight -
    headerTotalHeight -
    textTotalHeight -
    footerHeight -
    marqueeSpacerHeight -
    gridMarginTop -
    gridMarginBottom;

  // Safety check: ensure availableHeight is reasonable (at least 200px)
  if (availableHeight < 200) {
    // Fallback: calculate from viewport minus known elements
    const marqueeSpace = 42; // Already accounted in padding-bottom
    availableHeight = Math.max(200, viewportHeight * 0.4); // Use 40% of viewport as minimum
  }

  // Get the actual width of projectText to ensure alignment
  let maxContainerWidth = 1101; // Default width
  if (textElement) {
    const textStyles = window.getComputedStyle(textElement);
    const textWidth = textElement.offsetWidth;
    // Use the same width as projectText to ensure perfect alignment
    maxContainerWidth = textWidth;
  } else {
    // Fallback: calculate from viewport if text element not found
    const tintedBgPaddingSides = 32; // 16px left + 16px right
    maxContainerWidth = Math.min(1101, viewportWidth - tintedBgPaddingSides);
  }

  // Also ensure we don't exceed tinted-bg client width
  const tintedBgClientWidth = tintedBg.clientWidth || viewportWidth;
  maxContainerWidth = Math.min(maxContainerWidth, tintedBgClientWidth);

  // On mobile (viewport < 800px), respect the CSS 2-column layout
  if (viewportWidth < 800) {
    gridContainer.style.gridTemplateColumns = "1fr 1fr";
    // On mobile, ensure grid matches text width for alignment
    if (textElement) {
      gridContainer.style.width = textElement.offsetWidth + "px";
      gridContainer.style.maxWidth = textElement.offsetWidth + "px";
    } else {
      gridContainer.style.maxWidth = "";
    }
    return;
  }

  // CRITICAL: Always set grid container width to match projectText for perfect alignment
  if (textElement) {
    const textWidth = textElement.offsetWidth;
    gridContainer.style.width = textWidth + "px";
  }

  // Calculate optimal column count and item size
  // Goal: fill viewport efficiently while maintaining aspect ratio
  // CRITICAL: Grid must NEVER exceed availableHeight to prevent scrolling
  // Assuming images have similar aspect ratios (around 1.5:1 based on project images)

  // Try different column counts (2-6 columns)
  let bestColumns = 4;
  let bestScore = Infinity;
  let bestTotalHeight = 0;

  for (let cols = 2; cols <= 6; cols++) {
    const rows = Math.ceil(itemCount / cols);
    let itemWidth = (maxContainerWidth - (cols - 1) * 14) / cols; // 14px gap
    let itemHeight = itemWidth * 0.666; // Approximate 1.5:1 aspect ratio (1/1.5 = 0.666)

    let totalHeight = rows * itemHeight + (rows - 1) * 14;

    // If grid exceeds available height, scale down the items to fit
    if (totalHeight > availableHeight) {
      // Calculate scale factor to fit within available height
      const scaleFactor = availableHeight / totalHeight;
      itemWidth = itemWidth * scaleFactor;
      itemHeight = itemWidth * 0.666;
      totalHeight = rows * itemHeight + (rows - 1) * 14;
    }

    // Only consider if it fits (with a small tolerance) and meets minimum width
    if (totalHeight <= availableHeight + 5 && itemWidth >= 150) {
      // Score based on how well it fills the viewport
      // Lower is better - prefer grids that fill viewport without too much empty space
      const emptySpace = Math.abs(availableHeight - totalHeight);

      // Penalize unbalanced layouts (e.g., 3 items in 2 columns = 2 top, 1 bottom)
      const itemsInLastRow = itemCount % cols;
      const isUnbalanced =
        itemsInLastRow !== 0 && itemsInLastRow < cols && rows > 1;
      const balancePenalty = isUnbalanced ? 200 : 0; // Heavily penalize unbalanced layouts

      // Penalize too many rows
      const rowPenalty = rows > 3 ? (rows - 3) * 50 : 0;

      // For exactly 3 items, strongly prefer 3 columns (all in one row)
      const threeItemsPenalty = itemCount === 3 && cols !== 3 ? 300 : 0;

      // For very few items (1-2), prefer fewer columns for larger display
      const fewItemsPenalty = itemCount <= 2 && cols > itemCount ? 150 : 0;

      const score =
        emptySpace +
        rowPenalty +
        balancePenalty +
        threeItemsPenalty +
        fewItemsPenalty;

      if (score < bestScore) {
        bestScore = score;
        bestColumns = cols;
        bestTotalHeight = totalHeight;
      }
    }
  }

  // Safety check: if no configuration fits, use 4 columns as default
  // This should rarely happen, but ensures we don't break the layout
  if (bestScore === Infinity) {
    bestColumns = 4;
  }

  // Apply the optimal column count
  gridContainer.style.gridTemplateColumns = `repeat(${bestColumns}, 1fr)`;

  // Calculate the actual item size to ensure it fits within viewport
  const finalRows = Math.ceil(itemCount / bestColumns);
  let finalItemWidth =
    (maxContainerWidth - (bestColumns - 1) * 14) / bestColumns;
  let finalItemHeight = finalItemWidth * 0.666;
  let finalTotalHeight = finalRows * finalItemHeight + (finalRows - 1) * 14;

  // Use slightly smaller availableHeight for safety margin (5% buffer)
  const safeAvailableHeight = availableHeight * 0.95;

  // CRITICAL: Always use text width for perfect alignment with projectText
  // The container width must match text width - we calculate item sizes within that fixed width
  let finalContainerWidth = maxContainerWidth;
  if (textElement) {
    finalContainerWidth = textElement.offsetWidth;
  }

  // Recalculate item sizes with the fixed container width (matching text)
  finalItemWidth = (finalContainerWidth - (bestColumns - 1) * 14) / bestColumns;
  finalItemHeight = finalItemWidth * 0.666;
  finalTotalHeight = finalRows * finalItemHeight + (finalRows - 1) * 14;

  // If grid exceeds available height, scale down item sizes but keep container width fixed
  if (finalTotalHeight > safeAvailableHeight) {
    // Calculate scale factor to fit within available height
    const scaleFactor = safeAvailableHeight / finalTotalHeight;

    // Scale down item dimensions (container width stays fixed for alignment)
    finalItemWidth = finalItemWidth * scaleFactor;
    finalItemHeight = finalItemWidth * 0.666;
    finalTotalHeight = finalRows * finalItemHeight + (finalRows - 1) * 14;
  } else {
    // Grid fits - try to fill space better by increasing item sizes if there's room
    const remainingHeight = safeAvailableHeight - finalTotalHeight;
    if (remainingHeight > 50 && itemCount > 0) {
      // If there's significant remaining space, try to use it (max 15% increase)
      const maxPossibleHeight = safeAvailableHeight;
      const scaleUpFactor = Math.min(
        1.15,
        maxPossibleHeight / finalTotalHeight
      );

      if (scaleUpFactor > 1.01) {
        finalItemWidth = finalItemWidth * scaleUpFactor;
        finalItemHeight = finalItemWidth * 0.666;
        finalTotalHeight = finalRows * finalItemHeight + (finalRows - 1) * 14;
      }
    }
  }

  // Always set container width to match text for perfect alignment
  gridContainer.style.width = finalContainerWidth + "px";
  gridContainer.style.maxWidth = finalContainerWidth + "px";

  // Use these final calculated values for height checks
  const finalItemWidthCheck = finalItemWidth;
  const finalItemHeightCheck = finalItemHeight;
  const finalTotalHeightCheck = finalTotalHeight;

  // Set max-height to ensure grid never exceeds viewport
  gridContainer.style.maxHeight =
    Math.min(finalTotalHeightCheck, safeAvailableHeight) + "px";

  // Also set max-width and max-height on grid items to ensure images don't exceed calculated size
  // This prevents images from overflowing their grid cells and getting cropped
  gridItems.forEach((item) => {
    const img = item.querySelector("img");
    if (img) {
      img.style.maxWidth = "100%";
      img.style.maxHeight = finalItemHeightCheck + "px";
      img.style.width = "auto";
      img.style.height = "auto";
      // Ensure the grid item itself doesn't exceed its cell size
      item.style.maxWidth = "100%";
      item.style.maxHeight = finalItemHeightCheck + "px";
    }
  });
}

// Run on page load and resize
let resizeTimeout;
function debouncedAdjustGrid() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(adjustGridSizing, 100);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(adjustGridSizing, 200); // Wait for layout to settle
    window.addEventListener("resize", debouncedAdjustGrid);
  });
} else {
  setTimeout(adjustGridSizing, 200);
  window.addEventListener("resize", debouncedAdjustGrid);
}

// Also run after Barba.js transitions
if (typeof barba !== "undefined") {
  document.addEventListener("barba:after-enter", function (event) {
    if (event.next.namespace === "project") {
      setTimeout(adjustGridSizing, 300);
    }
  });
}
