---
name: ui-qa-checklist
description: Strict UI quality assurance checklist and audit method. Use to review screens for alignment, spacing, overflow, consistency and platform issues before and after UI changes.
---

# UI QA Checklist

Review each screen like a picky senior designer. Report problems before fixing.

## Method

1. Open the screen in all states: loading, empty, error, filled, long text, very short text.
2. Check at 360x640, 390x844, 430x932, and web at 1280 wide.
3. Check light and dark mode.
4. Record every issue as: Screen | Problem | Severity (high, medium, low) | Fix.

## Alignment and spacing

- [ ] Left edges align across all elements
- [ ] Horizontal padding is 16 everywhere
- [ ] Gaps follow the 4, 8, 12, 16, 24, 32 scale only
- [ ] Icons and text are vertically centered in rows
- [ ] Equal gaps between cards and sections

## Text

- [ ] No overflow, no cut-off text, long text truncates correctly
- [ ] Only the defined font sizes and weights are used
- [ ] Contrast is readable in light and dark mode

## Components

- [ ] Buttons share the same height and radius
- [ ] Inputs share the same height, border and focus style
- [ ] Avatars are circular with placeholders
- [ ] Touch targets are at least 44x44
- [ ] Pressed states exist

## Safe areas and keyboard

- [ ] Nothing hides behind the notch, status bar, tab bar or navigation bar
- [ ] Keyboard never covers inputs or the send button
- [ ] Last list item is fully visible above the tab bar

## States

- [ ] Loading, empty and error states exist and look good
- [ ] No layout jump when data loads

## Consistency

- [ ] Same card style in feed, detail, profile and search
- [ ] Same header style on every screen
- [ ] Same icon set and size
- [ ] No hardcoded colors or random spacing

## Logic safety

- [ ] No Supabase query, auth, validation or business logic file was changed
