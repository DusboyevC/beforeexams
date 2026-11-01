---
subject: Mathematics 9709
chapter: 1.6
title: Series
paper: Paper 1
---

# 1.6 Series

## Binomial expansion (n a positive integer)
- (a + b)ⁿ = aⁿ + ⁿC₁aⁿ⁻¹b + ⁿC₂aⁿ⁻²b² + … + bⁿ
- **ⁿCᵣ = n! / (r!(n − r)!)**
- **General term**: ⁿCᵣ aⁿ⁻ʳ bʳ.

Example: find the coefficient of x³ in (2 − 3x)⁵.
⁵C₃ × 2² × (−3x)³ = 10 × 4 × (−27) x³, so the coefficient is **−1080**.

**Term independent of x**: in (x + 2/x²)⁶, the general term is ⁶Cᵣ x⁶⁻ʳ (2x⁻²)ʳ = ⁶Cᵣ 2ʳ x⁶⁻³ʳ. Set 6 − 3r = 0, so r = 2, and the term is 15 × 4 = **60**.

## Arithmetic progressions (AP)
- uₙ = a + (n − 1)d
- **Sₙ = n/2 [2a + (n − 1)d] = n/2 (a + l)**, where l is the last term.

## Geometric progressions (GP)
- uₙ = arⁿ⁻¹
- **Sₙ = a(1 − rⁿ)/(1 − r)** (for r ≠ 1)
- **Sum to infinity**: S∞ = a/(1 − r), valid only when **|r| < 1** (the series is **convergent**).

## Typical problems
- Two equations in a and d (or a and r): solve them simultaneously.
- "The first, third and sixth terms of an AP form a GP": write the terms using a and d, then use (u₃)² = u₁ × u₆.
- Find the least n for which Sₙ exceeds a value: set up the inequality and use logs (or trial values).

## Exam tips and common mistakes
- In expansions, put brackets round negative terms: (−3x)³ = −27x³.
- Before using S∞, state that **|r| < 1**.
- Show the formula you are using before substituting.

## Quick self-check
1. Find the sum of the first 20 terms of 5, 9, 13, … *(860)*
2. A GP has a = 12 and S∞ = 36. Find r. *(⅔)*
3. Find the first three terms of (1 + 2x)⁷ in ascending powers of x. *(1 + 14x + 84x²)*
