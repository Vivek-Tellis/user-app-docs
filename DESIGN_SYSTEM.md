# Design System Documentation: Salonnz UserApp

## Table of Contents
1. [Overview](#overview)
2. [Color Palette](#color-palette)
3. [Typography Scale](#typography-scale)
4. [Spacing System](#spacing-system)
5. [Border Radius](#border-radius)
6. [Shadow/Elevation](#shadowelevation)
7. [Animation & Transitions](#animation--transitions)
8. [Responsive Breakpoints](#responsive-breakpoints)
9. [Dark Mode Variations](#dark-mode-variations)
10. [CSS Custom Properties](#css-custom-properties)
11. [Component Styling Standards](#component-styling-standards)

---

## Overview

The Salonnz UserApp uses a **CSS custom properties (variables)** system combined with **SCSS mixins** for styling. The design system is built on:
- **Tailwind CSS** for utility classes
- **NextUI** as the component library
- **Custom CSS variables** for dynamic theming per salon
- **SCSS mixins** for reusable patterns

**Theme Management**: Redux-controlled theme system with light/dark mode support and per-salon color customization.

---

## Color Palette

### Semantic Color System

The app uses a **semantic naming convention** with CSS custom properties for easy theming per salon.

#### Primary Brand Colors
```css
/* Main Brand Gradient */
--primary-color: #d350bb;
--gradient-background: linear-gradient(180deg, #d450bc 3.66%, #9b4dac 107.39%);

/* Light Theme Selection State */
--selected-bg-color: #ffe4fb;
--selectedborderColor: #d350bb;
```

#### Text Colors
```css
/* Headings and Primary Text */
--content-heading-color: #000000;
--bold-text: #444053;

/* Secondary and Muted Text */
--sub-primed-color: #737373;
--text-color: #737373;

/* Specific Text Colors */
--blacktext: #444053;
--graytext: #737373;
```

#### Background Colors
```css
/* Light Theme Backgrounds */
--background-color: #fffbfe;
--simple-back: #ffffff;

/* Darker Backgrounds */
--switcher-base: #efefef;
--darkswitcher: #efefef; /* Less dark background */
--darkbg: #fffbfe; /* Dark background reference */
```

#### Interactive Colors
```css
/* Links and Actions */
--link-color: #4285f4;

/* Success State */
--thank-screen: #2ce56f;

/* Error State */
--error-bg: #FB3813;
```

#### Border Colors
```css
--basic-border-color: #dadada;
--defaultbordercolor: #dadada;
```

#### State-Specific Colors
```css
/* Disabled States */
--disablebtnbg: #e2e2ea;
--disablebtntext: #737373;
```

### Color Usage by Context

| Semantic Name | CSS Variable | Usage |
|--------------|--------------|-------|
| Primary | `var(--primary-color)` | Main actions, selections, highlights |
| Success | `var(--thank-screen)` | Success messages, confirmations |
| Error | `var(--error-bg)` | Error messages, validation |
| Link | `var(--link-color)` | Links, navigation actions |
| Heading | `var(--content-heading-color)` | Page headings, titles |
| Text | `var(--text-color)` | Body text, descriptions |
| Muted | `var(--sub-primed-color)` | Secondary text, placeholders |
| Bold Text | `var(--bold-text)` | Important labels, headings |
| Background | `var(--background-color)` | Page background |
| Surface | `var(--simple-back)` | Card backgrounds, modals |
| Border | `var(--basic-border-color)` | Dividers, outlines |

---

## Typography Scale

### Font Weight System
```css
/* Weights Used */
font-weight: 300; /* Light - not commonly used */
font-weight: 400; /* Regular - default text */
font-weight: 500; /* Medium - labels, emphasized text */
font-weight: 600; /* Semibold - headings, buttons */
font-weight: 700; /* Bold - large headings */
```

### Font Size Scale

#### Headings
```css
/* Large Headings */
22px, 700 - Main page headers, large titles
18px, 600 - Section headers, card titles
16px, 600 - Subsections, prominent labels

/* Medium Headings */
22px, 600 - Service names, feature headers
20px, 600 - Item names in lists
18px, 600 - Staff names, category headers

/* Small Headings */
16px, 600 - Button text, tab headers
16px, 400 - Standard labels
14px, 700 - Strong emphasis labels
14px, 600 - Card item names
14px, 500 - Metadata, dates
14px, 400 - Body text, descriptions
```

#### Body Text
```css
12px, 400 - Small labels, date stamps, metadata
12px, 500 - Secondary information, captions
10px, 400 - Tiny labels, legal text
10px, 500 - Small badges, tags
```

### Typography Mixin

The `typo-master` mixin is used throughout the codebase:
```scss
@mixin typo-master($fontSize: 16px, $fontWeight: 500) {
  font-size: $fontSize;
  font-weight: $fontWeight;
}
```

### Common Typography Patterns

```scss
/* Section Headers */
@include title_pri_color(18px, 400);
@include description_bold_color(14px, 400);

/* Links */
@include link_pri_color(16px, 500);

/* Special Cases */
letter-spacing: 1.5px; /* Buttons, uppercase text */
letter-spacing: 0.5px; /* Greeting messages */
text-transform: capitalize; /* Names, titles */
text-transform: uppercase; /* Buttons (occasionally) */
```

### Responsive Typography

Using CSS `clamp()` for responsive scaling:
```scss
/* Responsive text examples */
@include typo-master(clamp(14px, 1.5vw, 18px), 600);
@include typo-master(clamp(24px, 3vw, 30px), 600);
@include typo-master(clamp(14px, 3vw, 18px), 400);
@include typo-master(clamp(16px, 2vw, 18px), 600);
```

---

## Spacing System

### Base Spacing Units

Based on the codebase analysis, the following spacing values are consistently used:

#### Common Gaps
```css
/* List and Card Spacing */
gap: 18px; /* Cards in grid, staff lists */
gap: 15px; /* Standard list items */
gap: 10px; /* Related items, small lists */
gap: 7px; /* Tightly related items */
gap: 5px; /* Minimal separation */
gap: 4px; /* Very tight spacing */
gap: 3px; /* Icon/text pairs */

/* Notification Badge */
padding: 6px; /* Badge padding */
```

#### Padding Values
```css
/* Page-level */
padding: 0 13px; /* Page margins */

/* Card Padding */
padding: 15px; /* Standard card internal padding */
padding: 8px 15px; /* Compact cards */

/* Component Padding */
padding: 10px 16px 10px 0; /* Label/value pairs */

/* Button Padding */
padding: 6px; /* Small buttons */
padding: 10px; /* Medium buttons */
padding: 15px; /* Large buttons */
```

#### Margin Values
```css
/* Vertical Spacing */
margin-bottom: 15px; /* Section spacing */

/* Layout Margins */
padding: 0 13px; /* Horizontal page margins */
```

#### Height Values
```css
/* Fixed Heights */
height: 48px; /* Action buttons */
height: 40px; /* Loader height */
height: 24px; /* Small avatars, icons */
height: 11rem; /* Header gradient height (176px) */
```

### Spacing Usage Patterns

| Context | Typical Spacing | Example |
|---------|----------------|---------|
| Page margins | 13px left/right | `padding: 0 13px` |
| Card gaps | 18px | `gap: 18px` |
| List item gaps | 15px | `gap: 15px` |
| Related items | 10px | `gap: 10px` |
| Tight pairs | 7px | `gap: 7px` |
| Very tight | 5px | `gap: 5px` |
| Icon+text | 3-5px | `gap: 5px` |
| Card padding | 15px | `padding: 15px` |
| Button height | 48px | `height: 48px` |

---

## Border Radius

### Standard Radius Values

```css
/* Cards and Containers */
border-radius: 10px; /* Most cards, buttons, inputs */
border-radius: 11px; /* Header gradients (rounded bottom) */

/* Circular Elements */
border-radius: 50%; /* Avatars, profile pictures, notification badges */
border-radius: 50%; /* Initials in avatars */

/* Small Elements */
border-radius: 6px; /* Notification badges (varies) */

/* Sharp Corners (rarely used) */
border-radius: 0; /* Headers, dividers */
```

### Radius Usage by Element Type

| Element Type | Radius | CSS |
|-------------|--------|-----|
| Primary buttons | 10px | `border-radius: 10px` |
| Cards | 10px | `border-radius: 10px` |
| Header gradient | 11px (bottom only) | `border-radius: 0 0 11px 11px` |
| Avatars | 50% | `border-radius: 50%` |
| Notification badges | 50% or 6px | `border-radius: 50%` or specific |
| Inputs | 10px (typically) | `border-radius: 10px` |

---

## Shadow/Elevation

### Shadow System

The app uses multiple shadow levels for depth and hierarchy:

#### Shadow Levels
```css
/* Default Shadow */
--shadow: 0px 1px 6px 0px rgba(169, 169, 169, 0.7);

/* Box Shadow */
--box-shadow: 0px 1px 8px 0px #00000040;

/* Booking Shadow */
--booking-shadow: 0px 1px 4px 0px #00000040;

/* Button Shadow */
box-shadow: 0px 4px 17px 0px #7757EF33;

/* Enhanced Shadow */
box-shadow: 0px 2px 48px 0px #0000000A;
```

### Shadow Usage by Elevation Level

| Level | Shadow Values | Usage |
|-------|--------------|-------|
| **Level 0 (Flat)** | No shadow | Headers, dividers, flat elements |
| **Level 1** | `0px 1px 4px 0px #00000040` | Cards, small components |
| **Level 2** | `0px 1px 6px 0px rgba(169, 169, 169, 0.7)` | Standard cards, inputs |
| **Level 3** | `0px 1px 8px 0px #00000040` | Elevated cards, modals |
| **Level 4** | `0px 2px 48px 0px #0000000A` | Selected states, emphasis |
| **Button Shadow** | `0px 4px 17px 0px #7757EF33` | Primary action buttons |

### iOS vs Android Shadows

**iOS Style (used):**
- Softer, more diffuse shadows
- Uses rgba with lower opacity
- Multiple layers for depth

**Android Style (alternative if needed):**
- Harder shadows with more opacity
- Using elevation property
- `elevation: 2` (equivalent to ~2px shadow)

---

## Animation & Transitions

### Transition Standards

```scss
@mixin transition($property: all, $duration: 400ms, $timing: ease) {
  transition: $property $duration $timing;
}
```

**Default transition:** 400ms ease for all properties

**Usage in codebase:**
```css
/* Header transitions */
transition: all 0.3s ease;

/* App container */
transition: all 300ms ease;

/* Icon rotation */
transform: rotate(180deg);
@include transition(); /* 400ms ease by default */

/* General button hover/press states */
@include transition(); /* Applied to buttons */
```

### Custom Keyframe Animations

#### Loading Animations
```css
@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes card {
  0% {
    opacity: 0;
    transform: translateY(100px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Usage */
animation: fade 0.7s linear;
animation: card 0.5s linear;
```

#### Navigation Animations (Tailwind)
```css
/* Slide in from left */
@keyframes slideInLeft {
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

/* Slide in from right */
@keyframes slideInRight {
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* Zoom in */
@keyframes zoomIn {
  0% { transform: scale(0.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Fade in */
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Fade up */
@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Fade down */
@keyframes fadeDown {
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Zoom fade up */
@keyframes zoomFadeUp {
  0% { opacity: 0; transform: translateY(40px) scale(0.9); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* Zoom fade down */
@keyframes zoomFadeDown {
  0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
```

#### Animation Usage Classes
```css
.animate {
  animation: card 0.5s linear;
}

.fade {
  animation: fade 0.7s linear;
}

/* Tailwind animations */
animate-slideInLeft: "slideInLeft 0.5s ease-out forwards"
animate-slideInRight: "slideInRight 0.5s ease-out forwards"
animate-slideUp: "slideUp 0.5s ease-out forwards"
animate-zoomIn: "zoomIn 0.5s ease-out forwards"
animate-fadeIn: "fadeIn 1s ease-out forwards"
animate-fadeUp: "fadeUp 0.5s ease-out forwards"
animate-fadeDown: "fadeDown 0.5s ease-out forwards"
animate-zoomFadeUp: "zoomFadeUp 1s ease-out forwards"
animate-zoomFadeDown: "zoomFadeDown 0.5s ease-out forwards"
```

### Animation Duration Standards

| Animation Type | Duration | Easing |
|---------------|----------|--------|
| Page transitions | 0.5s | ease-out |
| Hover effects | 0.3s | ease |
| State changes | 0.4s | ease (default) |
| Loading animations | 0.7s | linear |
| Micro-interactions | 0.2s | ease-in-out |

---

## Responsive Breakpoints

### Tailwind CSS Breakpoints (Default)

The app uses Tailwind's standard responsive breakpoints:

```javascript
// tailwind.config.js
// Default breakpoints (can be customized)
screens: {
  'sm': '640px',   // Small devices (mobile landscape)
  'md': '768px',   // Medium devices (tablets)
  'lg': '1024px',  // Large devices (desktop)
  'xl': '1280px',  // Extra large
  '2xl': '1536px', // 2X extra large
}
```

### Usage in Codebase

**Responsive Typography:**
```scss
/* Using clamp() for fluid typography */
@include typo-master(clamp(14px, 1.5vw, 18px), 600);
@include typo-master(clamp(24px, 3vw, 30px), 600);
@include typo-master(clamp(16px, 2vw, 18px), 600);
```

**Fluid Layout:**
```scss
/* Viewport-relative sizing */
width: calc(100% - 2.5rem);
```

### Responsive Patterns

| Breakpoint | Usage Pattern |
|-----------|---------------|
| **sm (640px+)** | Mobile landscape, small tablets |
| **md (768px+)** | Tablets, small laptops |
| **lg (1024px+)** | Desktop, large tablets |
| **xl (1280px+)** | Large desktop screens |
| **2xl (1536px+)** | Extra large displays |

**Note:** The app is primarily mobile-first with progressive enhancement for larger screens.

---

## Dark Mode Variations

### Dark Theme Configuration

The app supports dark mode through CSS attribute selector:

```css
[data-theme="dark"] {
  --background-color: #121111;     /* Dark background */
  --content-heading-color: #fff;   /* White headings */
  --text-color: #fff;              /* White text */
  --sub-primed-color: #dadada;     /* Light gray secondary */
  --switcher-base: #737373;        /* Darker switcher background */
  --bold-text: #fff;               /* White bold text */
  --simple-back: #644A3D;          /* Dark surface */
  --selected-bg-color: #d75c5c;    /* Dark mode selection */
}
```

### Color Adaptations for Dark Mode

| Light Mode | Dark Mode | Notes |
|-----------|-----------|-------|
| `#fffbfe` background | `#121111` | Much darker background |
| `#000000` headings | `#ffffff` | Inverted for readability |
| `#737373` text | `#ffffff` | Text becomes white |
| `#ffffff` surface | `#644A3D` | Dark surface color |
| `#ffe4fb` selection | `#d75c5c` | Dark mode selection state |
| `#efefef` switcher | `#737373` | Darker toggle background |

### Theme Implementation

**Redux Theme Slice:**
```typescript
// store/themeSlice.ts
interface ThemeState {
  theme: 'light' | 'dark';
}

toggleTheme: (state) => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('theme', state.theme);
}
```

**Per-Salon Theming:**
The app also supports dynamic theming per salon by overriding CSS variables at runtime:
```javascript
// Inject theme colors dynamically
document.documentElement.style.setProperty('--primary-color', salonTheme.primary);
document.documentElement.style.setProperty('--gradient-background', salonTheme.gradient);
```

---

## CSS Custom Properties

### Complete CSS Variables Reference

```css
:root {
  /* ===== COLORS ===== */
  /* Brand */
  --primary-color: #d350bb;
  --gradient-background: linear-gradient(180deg, #d450bc 3.66%, #9b4dac 107.39%);
  --selected-bg-color: #ffe4fb;
  --selectedborderColor: #d350bb;

  /* Text Colors */
  --content-heading-color: #000000;
  --header-heading-color: #ffffff;
  --bold-text: #444053;
  --text-color: #737373;
  --sub-primed-color: #737373;
  --main-button-text-color: #ffffff;
  --blacktext: #444053;
  --graytext: #737373;

  /* Background Colors */
  --background-color: #fffbfe;
  --simple-back: #ffffff;
  --switcher-base: #efefef;
  --darkswitcher: #var(--switcher-base);
  --darkbg: var(--background-color);

  /* State Colors */
  --link-color: #4285f4;
  --thank-screen: #2ce56f;  /* Success */
  --error-bg: #FB3813;      /* Error */

  /* Disabled States */
  --disablebtnbg: #e2e2ea;
  --disablebtntext: #737373;

  /* Borders */
  --basic-border-color: #dadada;
  --defaultbordercolor: #dadada;

  /* ===== SHADOWS ===== */
  --shadow: 0px 1px 6px 0px rgba(169, 169, 169, 0.7);
  --box-shadow: 0px 1px 8px 0px #00000040;
  --booking-shadow: 0px 1px 4px 0px #00000040;
}

/* Dark theme override */
[data-theme="dark"] {
  --background-color: #121111;
  --content-heading-color: #ffffff;
  --text-color: #ffffff;
  --sub-primed-color: #dadada;
  --switcher-base: #737373;
  --bold-text: #ffffff;
  --simple-back: #644A3D;
  --selected-bg-color: #d75c5c;
}
```

---

## Component Styling Standards

### Button Variants

#### Primary Button
```scss
.action_btn {
  @include size(100%, 48px);
  @include border-radius(10px);
  @include typo-master(16px, 600);
  letter-spacing: 1.5px;
  background: var(--gradient-background);
  color: #fff;
  box-shadow: 0px 4px 17px 0px #7757EF33;
  @include transition();
  text-transform: uppercase;

  &.disabled {
    background: #E2E2EA;
    color: var(--graytext);
    box-shadow: none;
  }

  &.border_variant {
    background: #fff;
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
    box-shadow: none;
  }
}
```

#### Button Specifications
| Property | Value |
|----------|-------|
| Height | 48px |
| Border Radius | 10px |
| Font Size | 16px |
| Font Weight | 600 |
| Letter Spacing | 1.5px |
| Text Transform | uppercase |
| Transition | 400ms ease |
| Shadow | `0px 4px 17px 0px #7757EF33` |

### Card Patterns

#### Standard Card
```scss
.basic_border_box {
  border: 1px solid var(--basic-border-color);
  padding: 15px;
  border-radius: 10px;
  width: 100%;
  background-color: var(--simple-back);
}
```

#### Card with Selection State
```css
.selected {
  position: relative;

  .radio_selector {
    .check-i {
      opacity: 1;
    }
  }
}

.radio_selector {
  color: var(--primary-color);
  @include transition();

  .check-i {
    position: absolute;
    opacity: 0;
    color: white;
  }
}
```

### Header Specifications

#### Sticky Header
```scss
.sticky-header {
  width: 100%;
  position: sticky;
  top: 0px;
  overflow: hidden;
  z-index: 10;
  border-radius: 0 0 11px 11px;
  background: var(--gradient-background);
  @include transition(all, 0.3s, ease);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 11rem;
    width: 100%;
    z-index: -2;
    background: var(--gradient-background);
  }
}
```

**Header Specifications:**
- Height: 11rem (176px) for gradient section
- Border radius: 0 0 11px 11px (bottom only)
- Z-index: 10 (above content)
- Transition: 0.3s ease for scroll effects

### Icon Sizes

| Icon Type | Size | Usage |
|----------|------|-------|
| Avatar | 24px | Profile pictures |
| Notification badge | 12px | Badge size |
| Notification badge padding | 6px | Badge internal padding |

### List Patterns

#### Appointment Card
```scss
.appoint_card {
  @include flex-center(row, space-between, center);
  padding: 8px 15px;

  .details_appoint {
    @include flex-center(row, flex-start, flex-start);
    color: var(--bold-text);

    .col_box {
      text-transform: capitalize;
      @include flex-center(column, flex-start, center);
      padding: 10px 16px 10px 0;
      gap: 5px;
      @include typo-master(12px, 400);

      &:nth-child(2) {
        padding: 10px 0 10px 16px;
        border-left: 1px solid var(--basic-border-color);
      }

      span {
        @include typo-master(14px, 700);
      }
    }
  }
}
```

---

## Best Practices

### 1. **Use CSS Variables for Theming**
Always reference colors via CSS custom properties to enable dynamic theming:
```css
/* Good */
background: var(--primary-color);
color: var(--text-color);

/* Avoid */
background: #d350bb;
color: #737373;
```

### 2. **Consistent Spacing**
Use standard spacing values rather than arbitrary numbers:
```css
/* Good */
gap: 15px;
padding: 15px;

/* Avoid */
gap: 13px;
padding: 14px;
```

### 3. **Use Mixins for Reusability**
Leverage SCSS mixins for consistency:
```scss
/* Good */
@include typo-master(16px, 600);
@include border-radius(10px);
@include transition();

/* Avoid */
font-size: 16px;
font-weight: 600;
border-radius: 10px;
transition: all 400ms ease;
```

### 4. **Maintain Typography Hierarchy**
Follow the established font scale:
- 22px, 700: Main headers
- 18px, 600: Section headers
- 16px, 400-600: Labels and buttons
- 14px, 400-700: Body text
- 12px, 400-500: Metadata
- 10px, 400-500: Small labels

### 5. **Transition Consistency**
Use standard transitions:
```scss
/* Default */
@include transition(); // 400ms ease all

/* For scroll effects */
transition: all 0.3s ease;

/* For loading */
animation: fade 0.7s linear;
```

### 6. **Responsive Design**
Use `clamp()` for fluid typography and maintain mobile-first approach:
```scss
@include typo-master(clamp(14px, 1.5vw, 18px), 600);
```

### 7. **Dark Mode Support**
Always test components in both light and dark themes:
```css
/* Check contrast in both themes */
[data-theme="dark"] {
  /* Adjust if needed */
}
```

---

## Migration to React Native

### Design Token Conversion

When migrating to React Native, these design tokens should be converted to:

#### Color Tokens (TypeScript)
```typescript
export const colors = {
  primary: '#d350bb',
  gradient: 'linear-gradient(180deg, #d450bc 3.66%, #9b4dac 107.39%)',
  text: {
    primary: '#000000',
    secondary: '#737373',
    heading: '#444053',
  },
  background: {
    primary: '#fffbfe',
    surface: '#ffffff',
  },
  // ... etc
};
```

#### Typography (StyleSheet)
```typescript
export const typography = {
  h1: { fontSize: 22, fontWeight: '700' },
  h2: { fontSize: 18, fontWeight: '600' },
  h3: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
  caption: { fontSize: 10, fontWeight: '400' },
};
```

#### Spacing (StyleSheet)
```typescript
export const spacing = {
  xs: 3,
  sm: 5,
  md: 7,
  lg: 10,
  xl: 15,
  xxl: 18,
};
```

#### Shadows (StyleSheet)
```typescript
export const shadows = {
  small: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 2 },
  medium: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.7, shadowRadius: 6, elevation: 3 },
  large: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 },
};
```

---

## Summary

This design system provides a **comprehensive, reusable set of design tokens** for the Salonnz UserApp:

### Key Metrics
- **Colors**: 20+ semantic color tokens
- **Typography**: 8 weight levels, 10 size variants
- **Spacing**: 9 standard spacing values
- **Border Radius**: 4 standard radius values
- **Shadow Levels**: 5 elevation levels
- **Animations**: 9 custom keyframes + standard transitions

### Design Principles
1. **Semantic naming** for colors and tokens
2. **CSS variables** for dynamic theming
3. **SCSS mixins** for code reuse
4. **Consistent spacing** throughout the app
5. **Mobile-first** responsive design
6. **Light/Dark theme** support
7. **Per-salon theming** capability

### Next Steps for React Native Migration
1. Convert CSS variables to TypeScript constants
2. Convert SCSS mixins to utility functions
3. Create theme context for light/dark mode
4. Maintain semantic naming for consistency
5. Preserve the color gradient system
6. Keep typography hierarchy intact

---

**Document Version**: 1.0
**Last Updated**: 2025-11-20
**Total Design Tokens**: 50+ documented
