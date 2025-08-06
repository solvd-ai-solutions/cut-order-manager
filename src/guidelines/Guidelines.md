**Add your own guidelines here**
<!--

System Guidelines

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
## Solv Solutions Micro-Apps

### Unified Design Style Guide

---

### 1. Core Principles

* **All-in-One Screen:** UI fits within a single viewport wherever possible—minimal vertical scrolling.
* **High-Contrast Outlines:** Every component is defined by a solid 2 px outline (black on light backgrounds, white on dark) for clear separation.
* **Fluid & Responsive:** Layout adapts dynamically to window size—components resize, reflow, and reorder to maintain clarity and spacing without breaking the “one screen” rule.
* **Minimalist & Friendly:** Black & white base with three deep pastel accents; generous white space; rounded corners; simple icons.

---

### 2. Color Palette

| Role                    | Color                            | Usage                           |
| ----------------------- | -------------------------------- | ------------------------------- |
| Primary Text / Outlines | **Black** <br> `#000000`         | Text, component borders, icons  |
| Background              | **White** <br> `#FFFFFF`         | Page background, containers     |
| Accent 1 (Teal)         | `#4FB3A6`                        | Primary buttons, focus outlines |
| Accent 2 (Coral)        | `#F29E8E`                        | Secondary buttons, highlights   |
| Accent 3 (Lavender)     | `#C5A3E0`                        | Informational badges, dividers  |
| Dark Mode Inversion     | Black bg / White text & outlines | Alternate section styling       |

---

### 3. Typography

| Style | Size  | Line-Height | Weight | Usage                     |
| ----- | ----- | ----------- | ------ | ------------------------- |
| H1    | 28 px | 36 px       | 600    | Section titles            |
| H2    | 20 px | 28 px       | 600    | Sub-section headings      |
| Body  | 16 px | 24 px       | 400    | Form labels, instructions |
| Small | 14 px | 20 px       | 400    | Helper text, footnotes    |

**Font Family:** Inter (or Helvetica Neue).
**Contrast:** All text must meet WCAG AA (4.5:1) against its background.

---

### 4. Layout & Spacing

* **Grid System:**

  * Use CSS Grid with `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));` for main panels.
  * 16 px gutters horizontally and vertically.

* **Padding / Margin:**

  * Containers: 24 px inside.
  * Between components: 16 px.

* **Border-Radius:** 8 px for all cards, inputs, and buttons.

* **Fluid Sizing:**

  * Use percentages or `minmax()` for widths.
  * For smaller screens (<640 px), switch to a single-column stack; for medium screens (641–1024 px), two columns; above 1024 px, three columns if needed.

---

### 5. Components

#### a) Cards & Panels

* **Outline:** 2 px solid black (or white on dark).
* **Background:** White.
* **Title Bar:** Icon + title in accent color; 16 px top padding.
* **Content Area:** 16 px padding; form fields arranged compactly.

#### b) Form Inputs

* **Base:** White fill, 2 px black outline, 8 px rounded corners.
* **Focus:** Outline changes to Accent 1 (Teal).
* **Placeholder Text:** Body style, 70% opacity.

#### c) Buttons

* **Primary:** Accent 1 background, white text, no outline; 8 px vertical / 16 px horizontal padding.
* **Secondary:** Transparent background, 2 px accent 2 outline, black text.
* **Hover/Focus:** Darken fill by 10% or change outline to accent highlight.

#### d) Icons & Progress

* **Stroke:** 2 px in black (or white on dark).
* **Accent States:** Fill or stroke in Accent 3 for info/neutral states.

#### e) Feedback & Status

* **Success/Info:** Pastel Teal background with black text and 2 px black outline.
* **Warning:** Pastel Coral with black outline.
* **Disabled:** 50% opacity on text and outline.

---

### 6. Responsive Behavior

| Breakpoint        | Layout                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| **< 640 px**      | Single-column vertical stack                                           |
| **640 – 1024 px** | Two columns (e.g., Photos + Details on top; Generator + Preview below) |
| **> 1024 px**     | Three-column grid for wide screens                                     |

* **Dynamic resizing:**

  * Font sizes scale slightly using `clamp()` (e.g. `font-size: clamp(14px, 1.5vw, 18px)` for body).
  * Buttons and inputs use `max-width: 100%` so they shrink gracefully.

* **No Scroll Overflow:**

  * Panels use internal scroll only if content exceeds their fixed height.
  * Overall page height fits the viewport; collapse non-essential sections or use accordions if content grows.

---

### 7. Implementation Tips

* **CSS Variables:** Define colors, spacing, and typography as `--color-primary`, `--spacing-unit`, `--font-body` for consistency.
* **Utility Classes:** Use a helper library (e.g. Tailwind) or custom classes for `p-4`, `m-2`, `rounded-lg`, `border-2`, etc.
* **Component Library:** Create reusable Figma components for cards, inputs, buttons, and titles—apply the style tokens above.
* **Testing:** Preview at multiple window widths to ensure the “one-screen” goal holds. Use browser devtools to simulate different devices.

---


-->
