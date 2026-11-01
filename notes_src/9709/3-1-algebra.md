---
subject: Mathematics 9709
chapter: 3.1
title: Algebra
paper: Paper 3 (also Paper 2)
---

# 3.1 Algebra

## Modulus
- |x| is the non-negative value of x. The graph of y = |f(x)| reflects the parts of y = f(x) that lie below the x-axis up above it.
- **Solving |f(x)| = |g(x)|**: square both sides, or solve f(x) = g(x) and f(x) = −g(x).
- **|x − a| < b ⇔ a − b < x < a + b**.
- **|f(x)| > |g(x)|**: square both sides, giving f² − g² > 0, then factorise.
- Example: |2x − 1| < |x + 2| → (2x − 1)² < (x + 2)² → 3x² − 8x − 3 < 0 → (3x + 1)(x − 3) < 0 → **−⅓ < x < 3**.

## Polynomials
- **Division**: divide a polynomial by (x − a) or by a quadratic, using long division or comparing coefficients.
- **Remainder theorem**: when p(x) is divided by (x − a), the remainder is **p(a)**. For (ax − b), the remainder is p(b/a).
- **Factor theorem**: if p(a) = 0, then (x − a) is a factor.
- Typical question: p(x) = 2x³ + ax² + bx − 6 has a factor (x − 2) and leaves remainder 4 when divided by (x + 1). Set up p(2) = 0 and p(−1) = 4 and solve simultaneously.

## Partial fractions
| Denominator | Form |
|---|---|
| (ax + b)(cx + d) | A/(ax + b) + B/(cx + d) |
| (ax + b)(cx + d)² | A/(ax + b) + B/(cx + d) + C/(cx + d)² |
| (ax + b)(x² + c²) | A/(ax + b) + (Bx + C)/(x² + c²) |
- If the fraction is **improper** (the degree of the numerator ≥ the degree of the denominator), divide first.
- Find the constants by substituting suitable x values (cover-up) and by comparing coefficients.

## Binomial expansion for any rational n
- **(1 + x)ⁿ = 1 + nx + n(n − 1)x²/2! + n(n − 1)(n − 2)x³/3! + …**
- **Valid only for |x| < 1**.
- For (a + bx)ⁿ, take out aⁿ first: (a + bx)ⁿ = aⁿ(1 + bx/a)ⁿ, valid for |bx/a| < 1.
- Example: (1 − 2x)^(−½) = 1 + x + (3/2)x² + (5/2)x³ + …, valid for |x| < ½.
- It is often combined with partial fractions: expand each fraction, then add.

## Exam tips and common mistakes
- Always state the **range of validity** for an expansion with non-integer or negative n.
- For modulus inequalities, check the answer against a quick sketch.
- Partial fractions: check your answer by recombining, or by substituting a value of x.

## Quick self-check
1. Find the remainder when x³ − 4x + 1 is divided by (x + 2). *(1)*
2. Express (5x + 1)/((x + 1)(x − 1)) in partial fractions. *(2/(x + 1) + 3/(x − 1))*
3. Expand (4 + x)^(½) up to the term in x². *(2 + x/4 − x²/64)*
