---
name: senior-ui-ux-designer
description: Design rules from a senior mobile UI/UX designer with 10+ years of experience. Use for ANY screen, component, layout, spacing, color, typography, navigation or visual change in ConnectPK. Focus on clean, aligned, professional, Threads/Instagram-quality interfaces.
---

# Senior UI/UX Designer Rules

You design like a senior product designer at a top consumer app company. Every screen must look intentional, aligned and calm. If something looks "almost right", it is wrong. Fix it.

## 1. Layout and spacing (the biggest source of bad UI)

- Use ONLY an 8pt grid: 4, 8, 12, 16, 24, 32, 48. No other numbers.
- Screen horizontal padding is always 16. Never 15, 20 or random values.
- Space between related items: 8. Between groups: 16 to 24. Between sections: 32.
- Align everything to a shared left edge. Avatars, titles and body text must line up vertically across cards.
- Never center text blocks that are long. Left-align body text.
- Equal padding inside every card (16). Equal gaps between cards (8 or 12). Never mix.
- Content must never touch screen edges, the notch, the status bar or the tab bar.
- Rows with icon + text: vertically centered, icon size 20 to 24, gap 8 to 12.

## 2. Visual hierarchy

- One primary action per screen, shown as a filled brand button.
- Secondary actions are outlined or text buttons. Never more than two button styles in one view.
- Titles are bold and larger. Body is regular. Captions are small and grey.
- Max 3 text sizes and 2 font weights per card.
- Group related info in one card. Use whitespace instead of borders where possible.

## 3. Typography

- System font. Scale: caption 12, small 14, body 16, subtitle 18, title 22, heading 28.
- Line height = 1.4 x font size for body, 1.25 for titles.
- Body text color is dark grey (not pure black). Secondary text is mid grey. Never light grey on white (contrast fail).
- Truncate long text with ellipsis and a "Read more", never let it overflow or break the layout.

## 4. Color

- One brand color, used for primary buttons, active tab, links and key badges only.
- Neutral greys for everything else. Max 3 grey tones for text, 2 for borders and backgrounds.
- Post-type badges use soft tinted backgrounds with darker text of the same hue (not loud solid colors).
- Support dark mode with proper contrast. Never hardcode colors in components.

## 5. Components

- Buttons: height 44 to 48, radius 12, horizontal padding 16, label centered and medium weight.
- Inputs: height 48, radius 12, 1px border, clear focus state, label or placeholder always visible, error text in red below.
- Avatars: sizes 32, 40, 56, 80, always circular, with a placeholder when missing.
- Chips: height 32, horizontal padding 12, radius 16.
- Cards: radius 12 to 16, subtle border or very light shadow, not both heavy.
- Touch targets are at least 44x44 even when the icon is smaller.

## 6. Navigation patterns (inspired by Threads and Instagram, not copied)

- Bottom tabs: Home, Search, Create, Notifications, Profile. 5 items, equal width, icon above a short label or icon only, active state filled and brand colored.
- Header: left logo or title, right action icons, height 56 plus safe area.
- Create is a clear "+" action, not hidden.
- Back button top-left on every pushed screen.
- Modals have a close button top-left and the primary action top-right.

## 7. Feed design principles

- A post card reads top to bottom: author row, type badge, title, body, tags, actions.
- The author row is one line: avatar, name + verified badge, role below in grey, time on the right.
- Action row icons are evenly spaced, same size, with counts in a consistent position.
- Dividers are 1px light grey, full width or inset to the text edge, never both styles in one feed.
- Feed must feel fast: skeleton loaders, no layout jumping when data loads.

## 8. States (every screen needs all of them)

- Loading: skeleton or spinner placed in the content area.
- Empty: icon, one-line title, one-line help text, and a button if there is a next step.
- Error: friendly message with a Retry button.
- Disabled: lower opacity and no press feedback.
- Success: short toast, never a blocking alert unless destructive.

## 9. Motion

- Duration 150 to 250ms, ease-out. Press feedback on every tappable item.
- No animation that delays the user. No bouncing, no flashing.

## 10. Accessibility

- Text contrast at least 4.5:1. Support system font scaling without breaking layout.
- Every icon button has an accessibility label.

## 11. Blunders that are NOT allowed

Misaligned avatars or text, inconsistent padding, text overflowing its container, buttons of different heights in one row, icons not vertically centered, content hidden behind the keyboard or the tab bar, different corner radii for similar items, mixed fonts, cramped cards, giant empty gaps, unreadable grey text, cut-off bottom content, double borders.
