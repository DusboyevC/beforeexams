---
subject: Mathematics 9709
chapter: 3.8
title: Differential equations
paper: Paper 3
---

# 3.8 Differential equations

## Forming a differential equation
- Translate the wording: "the rate of change of x is proportional to x" → **dx/dt = kx**.
- "Decreases at a rate proportional to the square root of h" → dh/dt = −k√h.
- Include a **negative sign** for a decreasing quantity (when k is taken as positive).

## Separating the variables
For dy/dx = f(x)g(y):
1. Rearrange to **∫ 1/g(y) dy = ∫ f(x) dx**.
2. Integrate both sides and include **one** constant c.
3. Use the initial conditions to find c (and k, if needed).
4. Rearrange for y if asked.

Example: dy/dx = xy² with y = 1 when x = 0.
∫y⁻² dy = ∫x dx → −1/y = x²/2 + c. At x = 0, y = 1, so c = −1. So **y = 2/(2 − x²)**.

## Exponential growth and decay
- dN/dt = −kN gives **N = N₀e^(−kt)**.
- With ln: ∫dN/N = −∫k dt gives ln N = −kt + c.

## Interpreting the solution
- Questions often ask what happens as t → ∞: the long-term value, or when the quantity reaches a given level.

## Exam tips and common mistakes
- Separate the variables correctly before integrating; don't integrate a product directly.
- Keep **ln|y|** where needed, and combine the constants carefully: ln y = kt + c gives y = Ae^(kt).
- Answer in context: state the time with units, or the long-term behaviour.

## Quick self-check
1. Solve dy/dx = y cos x, given y = 2 when x = 0. *(y = 2e^(sin x))*
2. A population grows at a rate proportional to its size and doubles in 5 years. Find k. *(ln 2 / 5)*
