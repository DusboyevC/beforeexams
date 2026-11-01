---
subject: Mathematics 9709
chapter: 3.6
title: Numerical solution of equations
paper: Paper 3 (also Paper 2)
---

# 3.6 Numerical solution of equations

## Locating a root
- **Change of sign**: if f(x) is continuous and f(a) and f(b) have **opposite signs**, there is a root between a and b.
- Answer format: "f(1) = −2 < 0 and f(2) = 3 > 0. There is a change of sign and f is continuous, so a root lies between 1 and 2."
- Alternatively, sketch two graphs, e.g. y = eˣ and y = 3 − x, and count the intersections to show how many roots there are.

## Iteration xₙ₊₁ = F(xₙ)
- Rearrange f(x) = 0 into the form x = F(x). Start with x₀ and iterate until the values agree to the required accuracy.
- If the sequence converges to α, then α satisfies **α = F(α)**. Questions often ask you to show that α is a root of the original equation, i.e. rearrange back.
- **Giving the root to n decimal places**: show the iterations to (n + 2) d.p. until two successive values agree to n d.p.
- **Convergence**: the iteration converges if **|F′(α)| < 1** near the root. If |F′(α)| > 1 it diverges, so choose a different rearrangement.

## Showing a value is correct to a given accuracy
To show a root is 1.47 to 2 d.p.: check the sign change of f between **1.465 and 1.475**.

## Worked example
Show that x³ + x − 3 = 0 has a root between 1 and 2, and find it to 3 d.p. using xₙ₊₁ = ∛(3 − xₙ).
f(1) = −1 and f(2) = 7: there is a sign change, so there is a root.
x₀ = 1.2: x₁ = 1.21644, x₂ = 1.21273, x₃ = 1.21357, x₄ = 1.21338, x₅ = 1.21342. The root is **1.213** to 3 d.p.

## Exam tips and common mistakes
- Always mention **continuity** when using a sign change.
- Write down the iterates to the stated accuracy; don't jump straight to the answer.
- If the question asks "find the exact value that the iteration converges to", solve α = F(α) algebraically.

## Quick self-check
1. Show that eˣ = 4 − x has a root between 1 and 2.
2. Explain why xₙ₊₁ = 3 − xₙ³ fails to converge to the root of x³ + x − 3 = 0.
