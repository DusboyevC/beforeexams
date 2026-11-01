---
subject: Mathematics 9709
chapter: 1.8
title: Integration
paper: Paper 1
---

# 1.8 Integration

## Rules
- **∫xⁿ dx = xⁿ⁺¹/(n + 1) + c** (for n ≠ −1).
- **∫(ax + b)ⁿ dx = (ax + b)ⁿ⁺¹ / (a(n + 1)) + c**.
- Integration reverses differentiation. Always add **+ c** to an indefinite integral.
- **Finding a curve from its gradient**: integrate, then use a given point to find c.

## Definite integrals and area
- **∫ₐᵇ f(x) dx = F(b) − F(a)**.
- The area between a curve and the x-axis is ∫ y dx. An area **below** the axis gives a negative value, so find the parts above and below **separately** and add their sizes.
- **Area between a curve and a line**: ∫ (upper − lower) dx between their intersection points.
- **Area between a curve and the y-axis**: ∫ x dy.

## Improper integrals
- When one limit is infinite, or the function is undefined at a limit:
  ∫₁^∞ x⁻² dx = lim [−1/x]₁ᵇ = 0 − (−1) = **1**.

## Volumes of revolution
- **About the x-axis**: V = π ∫ y² dx.
- **About the y-axis**: V = π ∫ x² dy.
- For the volume between two curves, subtract the volumes (not the functions before squaring): π∫(y₁² − y₂²) dx.

## Worked example
Find the area enclosed between y = 4x − x² and the x-axis.
Roots at x = 0 and 4. Area = ∫₀⁴ (4x − x²) dx = [2x² − x³/3]₀⁴ = 32 − 64/3 = **32/3**.

## Exam tips and common mistakes
- Show the substituted limits: [F(b)] − [F(a)].
- For volumes, square y **first**, then integrate. Don't square after integrating.
- Use exact values (fractions and π) unless decimals are requested.

## Quick self-check
1. Find ∫ (2x − 1)⁴ dx. *((2x − 1)⁵/10 + c)*
2. A curve has dy/dx = 6x² − 4 and passes through (1, 5). Find its equation. *(y = 2x³ − 4x + 7)*
3. Find the volume generated when y = √x from x = 0 to 4 is rotated about the x-axis. *(8π)*
