---
subject: Mathematics 9709
chapter: 1.1
title: Quadratics
paper: Paper 1
---

# 1.1 Quadratics

## What you must be able to do
- Complete the square and use it to find the vertex (turning point) and range.
- Find the discriminant and use it to decide the number of roots, including tangency conditions.
- Solve quadratic equations and inequalities, and equations that are quadratic in a function of x.
- Solve a pair of simultaneous equations where one is linear and one is quadratic.

## Completing the square
ax² + bx + c = a(x + b/2a)² + c − b²/4a
- Example: 2x² − 12x + 7 = 2(x² − 6x) + 7 = 2[(x − 3)² − 9] + 7 = **2(x − 3)² − 11**.
- The vertex of y = a(x − p)² + q is **(p, q)**. It is a minimum if a > 0 and a maximum if a < 0.
- So the minimum value of 2x² − 12x + 7 is −11, when x = 3; the range is y ≥ −11.

## The discriminant b² − 4ac
| b² − 4ac | Roots | Graph |
|---|---|---|
| > 0 | Two distinct real roots | Crosses the x-axis twice |
| = 0 | One repeated root | Touches the x-axis |
| < 0 | No real roots | Does not meet the x-axis |

- **Line and curve**: substitute the line into the curve to get a quadratic.
  - b² − 4ac > 0: the line meets the curve at two points.
  - b² − 4ac = 0: the line is a **tangent**.
  - b² − 4ac < 0: they do not meet.

Example: find k such that y = kx − 3 is a tangent to y = x² + 1.
x² − kx + 4 = 0, and tangency needs k² − 16 = 0, so **k = ±4**.

## Quadratic inequalities
1. Solve the equation to find the critical values.
2. Sketch the parabola.
3. Read off the required region.
- Example: x² − x − 6 > 0 → (x − 3)(x + 2) > 0 → **x < −2 or x > 3**.
- "< 0" gives the region *between* the roots: a single inequality such as −2 < x < 3.

## Equations that are quadratic in disguise
- Substitute u for the repeated expression. Example: x⁴ − 5x² + 4 = 0 → u² − 5u + 4 = 0 → u = 1 or 4 → x = ±1, ±2.
- Example: 2x − 7√x + 3 = 0 → let u = √x → 2u² − 7u + 3 = 0 → u = ½ or 3 → x = ¼ or 9. (Reject any negative u, since √x ≥ 0.)

## Simultaneous equations (linear and quadratic)
Rearrange the linear equation for one variable, substitute into the quadratic, solve, and then find the **pairs** of values.

## Exam tips and common mistakes
- In "find the set of values of k" questions, set up the discriminant inequality **carefully**, then solve the quadratic inequality in k.
- Keep track of the sign of a when you complete the square with a negative coefficient.
- Give inequalities in the form the question asks for, with "or" for the two separate regions.

## Quick self-check
1. Express x² + 8x + 3 in the form (x + a)² + b. *((x + 4)² − 13)*
2. Find the values of k for which x² + kx + 9 = 0 has two distinct real roots. *(k < −6 or k > 6)*
3. Solve 3x² < 5x + 2. *(−⅓ < x < 2)*
