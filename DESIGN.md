# Design Brief

## Direction
Light Minimal + Educational Clarity — crisp, spacious, typography-driven interface maximizing readability for timed quiz sessions with zero distractions.

## Tone
Refined minimalism with academic trust. Restraint prioritizes information clarity over decoration. Interfaces serve learning, not ego.

## Differentiation
Large readable question text + prominent timer display anchors student focus. Progress indicators surface performance without clutter.

## Color Palette

| Token      | OKLCH        | Role                         |
|------------|--------------|------------------------------|
| background | 0.99 0.004 250 | Warm off-white, breathing space |
| foreground | 0.15 0.008 250 | Deep text, maximum readability |
| card       | 1.0 0.0 0    | Pure white quiz/result cards |
| primary    | 0.45 0.18 250 | Warm blue, trustworthy CTAs  |
| accent     | 0.62 0.2 28  | Warm amber, success/highlights |
| muted      | 0.95 0.008 250 | Subtle backgrounds, labels   |
| destructive| 0.55 0.22 25 | Red, warnings/incorrect      |

## Typography

- Display: Lora (serif) — headings, question text, academic tone
- Body: DM Sans (humanist sans) — labels, options, body copy
- Scale: question `text-3xl font-semibold`, label `text-xs uppercase`, body `text-base`

## Elevation & Depth

Minimal shadows on cards only (0 1px 3px, 8% opacity) to create subtle lift. Header/footer use light border-bottom/border-top. No decorative depth.

## Structural Zones

| Zone    | Background       | Border                    | Notes                                   |
|---------|------------------|---------------------------|-----------------------------------------|
| Header  | bg-background    | border-b border-border    | Logo, student name, minimal spacing     |
| Content | bg-background    | —                         | Quiz setup card (bg-card), question (bg-card), history (bg-card on alternating muted rows) |
| Footer  | bg-muted/20      | border-t border-border    | Copyright, minimal footer info          |

## Spacing & Rhythm

Generous padding (1.5rem–2rem) between sections. Question cards centered with max-w-2xl. Micro-spacing (0.5rem) inside button groups. Section gaps 3rem. No visual density trade-offs.

## Component Patterns

- Buttons: warm blue primary, rounded-md, shadow-card on hover, 16px padding
- Cards: bg-card, rounded-lg, shadow-card, border-border subtle top border
- Options: pill-shaped (rounded-full), border on unselected, filled primary on selected
- Timer: large monospace display (text-4xl), positioned top-right, accent color on <30s

## Motion

No entrance animations during quiz. Immediate state changes (selection highlight, answer reveal). No decorative motion.

## Constraints

- No gradients or decorative elements
- No color outside the 7-token palette
- Max 2 font families (Lora + DM Sans)
- All shadows consistent (0 1px 3px only)
- Buttons never animated (instant feedback)

## Signature Detail

Timer display in top-right corner as anchoring focus point. Large Lora question text with DM Sans options creates immediate visual hierarchy for reading during timed pressure.
