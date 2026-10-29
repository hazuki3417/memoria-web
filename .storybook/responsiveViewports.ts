/** Representative Storybook/VRT viewports for Memoria's adopted responsive classes.
 * Boundaries: Compact < 768px, Medium 768–1407px, Wide >= 1408px.
 * Review sizes are examples, not layout breakpoints.
 */
export const responsiveViewports = {
  compact: { name: "compact", width: 375, height: 812 },
  medium: { name: "medium", width: 1024, height: 768 },
  wide: { name: "wide", width: 1440, height: 900 },
} as const
