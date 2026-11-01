---
subject: Mathematics 9709
chapter: 3.5
title: Integration (P3)
paper: Paper 3 (also Paper 2)
---

# 3.5 Integration

## Standard integrals
| f(x) | ∫ f(x) dx |
|---|---|
| eᵃˣ⁺ᵇ | (1/a)eᵃˣ⁺ᵇ |
| 1/(ax + b) | (1/a) ln\|ax + b\| |
| sin(ax + b) | −(1/a) cos(ax + b) |
| cos(ax + b) | (1/a) sin(ax + b) |
| sec²(ax + b) | (1/a) tan(ax + b) |
| 1/(a² + x²) | (1/a) tan⁻¹(x/a) |
| f′(x)/f(x) | ln\|f(x)\| |

## Techniques
- **Trig identities**: ∫cos²x dx = ∫½(1 + cos 2x) dx; ∫tan²x dx = ∫(sec²x − 1) dx.
- **Partial fractions**: split the fraction first, then integrate each part (often giving ln terms).
- **Integration by parts**: **∫u dv/dx dx = uv − ∫v du/dx dx**.
  - Choose u as the part that gets simpler when differentiated (e.g. x, or ln x).
  - Example: ∫x eˣ dx = x eˣ − ∫eˣ dx = **eˣ(x − 1) + c**.
  - ∫ln x dx: take u = ln x and dv/dx = 1, giving **x ln x − x + c**.
- **Substitution**: change the variable and **dx**, and change the **limits** for a definite integral.
  - Example: ∫₀¹ x(1 + x²)³ dx with u = 1 + x², du = 2x dx. This becomes ½∫₁² u³ du = ½[u⁴/4]₁² = **15/8**.

## Numerical integration: the trapezium rule
- **∫ₐᵇ y dx ≈ (h/2)[y₀ + 2(y₁ + … + yₙ₋₁) + yₙ]**, where h = (b − a)/n (n strips).
- It gives an **overestimate** if the curve is concave up (convex) and an **underestimate** if it is concave down. Justify with a sketch.

## Exam tips and common mistakes
- In substitution questions, change dx to du **and** change the limits.
- For ∫f′/f, check that the numerator is a multiple of the derivative of the denominator.
- Give exact answers (e.g. ln 3, π/4) unless decimals are requested.
- In the trapezium rule, h is the **strip width**, and the number of ordinates is one more than the number of strips.

## Quick self-check
1. Find ∫ x sin x dx. *(sin x − x cos x + c)*
2. Find the exact value of ∫₀^(π/4) sin²x dx. *(π/8 − ¼)*
3. Find ∫ (2x + 3)/(x² + 3x + 1) dx. *(ln|x² + 3x + 1| + c)*
