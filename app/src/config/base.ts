
export const breakpointMap: { [key: string]: number } = {
  xs: 370,
  sm: 576,
  md: 852,
  lg: 1480,
  xl: 1960,
}

// const breakpoints: Breakpoints = Object.values(breakpointMap).map((breakpoint) => `${breakpoint}px`)

// const mediaQueries: MediaQueries = {
//   xs: `@media screen and (min-width: ${breakpointMap.xs}px)`,
//   sm: `@media screen and (min-width: ${breakpointMap.sm}px)`,
//   md: `@media screen and (min-width: ${breakpointMap.md}px)`,
//   lg: `@media screen and (min-width: ${breakpointMap.lg}px)`,
//   xl: `@media screen and (min-width: ${breakpointMap.xl}px)`,
//   nav: `@media screen and (min-width: ${breakpointMap.lg}px)`,
// }

export const shadows = {
  level1: '0 0 1px 0 rgba(0,0,0,0.70), 0 3px 4px -2px rgba(0,0,0,0.50)',
  active: '0px 0px 0px 1px #0098A1, 0px 0px 4px 8px rgba(255, 255, 255, 0.54)',
  success: '0px 0px 0px 1px #31D0AA, 0px 0px 0px 4px rgba(49, 208, 170, 0.2)',
  warning: '0px 0px 0px 1px #ED4B9E, 0px 0px 0px 4px rgba(237, 75, 158, 0.2)',
  focus: '0px 0px 0px 1px #B4D9F3, 0px 0px 0px 4px rgba(255, 255, 255, 0.04)',
  inset: 'inset 0px 2px 2px -1px #087FFE',
  innerTableInset: '0px -1px 7px 2px #3480f51c inset',
  card: '0px 5px 10px rgba(2, 74, 187, 0.25)',
  onHover: '0px 2px 5px rgba(2, 74, 187, 0.25)',
}

// const spacing: Spacing = [0, 4, 8, 16, 24, 32, 48, 64]

const radii = {
  small: '4px',
  default: '16px',
  card: '32px',
  circle: '50%',
}

const zIndices = {
  dropdown: 10,
  modal: 100,
}

export default {
  siteWidth: 1200,
  // breakpoints,
  // mediaQueries,
  // spacing,
  shadows,
  radii,
  zIndices,
}
