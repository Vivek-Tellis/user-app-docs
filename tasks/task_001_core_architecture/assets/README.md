# Assets - Task 001: Core Architecture

## Required Assets

### Loading Animations
**Files needed:**
- `loading-animation.json` - Lottie animation for loading screen
- `spinner.gif` - Fallback spinner animation

**Purpose:** Visual feedback during app initialization and auth checks

### Error Illustrations
**Files needed:**
- `error-illustration.svg` - Generic error illustration
- `network-error.svg` - Network error illustration
- `404-error.svg` - 404 page illustration

**Purpose:** Display in error states for better UX

### App Icon & Splash Screen
**Files needed:**
- `icon.png` - App icon (1024x1024)
- `splash-logo.png` - Logo for splash screen (512x512)

**Purpose:** App branding during launch

## Directory Structure
```
assets/
├── animations/
│   ├── loading-animation.json
│   └── spinner.gif
├── illustrations/
│   ├── error-illustration.svg
│   ├── network-error.svg
│   └── 404-error.svg
├── branding/
│   ├── icon.png
│   └── splash-logo.png
└── README.md
```

## Notes
- Use Lottie animations for smooth loading states
- Ensure all illustrations are accessible (proper contrast)
- App icon must meet platform requirements (iOS/Android)
- Splash screen should show quickly (< 2 seconds)
