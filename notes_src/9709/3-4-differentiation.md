---
subject: Mathematics 9709
chapter: 3.4
title: Differentiation (P3)
paper: Paper 3 (also Paper 2)
---

# 3.4 Differentiation

## Standard derivatives
| f(x) | f′(x) |
|---|---|
| eᵃˣ | aeᵃˣ |
| ln(ax + b) | a/(ax + b) |
| sin ax | a cos ax |
| cos ax | −a sin ax |
| tan ax | a sec² ax |
| tan⁻¹ x | 1/(1 + x²) |
| aˣ | aˣ ln a |

## Rules
- **Product rule**: d/dx (uv) = u′v + uv′
- **Quotient rule**: d/dx (u/v) = (u′v − uv′)/v²
- **Chain rule**: dy/dx = dy/du × du/dx

## Parametric differentiation
- **dy/dx = (dy/dt)/(dx/dt)**.
- Example: x = t² and y = 2t, so dy/dx = 2/(2t) = 1/t.

## Implicit differentiation
- Differentiate each term with respect to x. Terms in y get a factor of dy/dx: d/dx(y²) = 2y dy/dx, and d/dx(xy) = y + x dy/dx (product rule).
- Then collect the dy/dx terms and factorise.
- Example: x² + 3xy + y² = 11 → 2x + 3y + 3x dy/dx + 2y dy/dx = 0 → **dy/dx = −(2x + 3y)/(3x + 2y)**.

## Applications
- Stationary points (dy/dx = 0), tangents and normals, as in Paper 1, using these new functions.
- For a parametric curve, a tangent is parallel to the x-axis when dy/dt = 0 and parallel to the y-axis when dx/dt = 0.

## Exam tips and common mistakes
- In the quotient rule, the order on top matters: u′v − uv′.
- When differentiating implicitly, don't forget the dy/dx on the y terms and the product rule on xy.
- Simplify, and factorise exponential terms where you can: eˣ(x + 1).

## Quick self-check
1. Differentiate y = x² e^(3x). *(e^(3x)(2x + 3x²))*
2. Differentiate y = ln(cos x). *(−tan x)*
3. Find dy/dx for x = 3 sin t, y = 2 cos t, in terms of t. *(−(2/3) tan t)*
