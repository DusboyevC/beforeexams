---
subject: Mathematics 9709
chapter: 5
title: Probability and Statistics 1 (Paper 5)
paper: Paper 5
---

# 5 Probability and Statistics 1

## 5.1 Representation of data
- **Diagrams**: stem-and-leaf (include a key; back-to-back for comparing two sets), box-and-whisker plots, histograms, and cumulative frequency graphs.
- **Histogram**: the bars have **no gaps**, and the **area ∝ frequency**, so **frequency density = frequency ÷ class width**. Use the true class boundaries (e.g. 10–19 becomes 9.5–19.5).
- **Cumulative frequency**: plot at the **upper class boundaries**. Read the median (n/2), the quartiles (n/4, 3n/4), and percentiles.
- **Measures of location**: mean x̄ = Σfx/Σf (use midpoints for grouped data), median, mode.
- **Measures of spread**: range, interquartile range (IQR = Q₃ − Q₁), standard deviation.
- **Variance**: σ² = Σx²/n − x̄² = Σf x²/Σf − x̄².
- **Coded data**: if y = x − a, then Σ(x − a) and Σ(x − a)² give x̄ = a + Σ(x − a)/n, and the standard deviation is unchanged by the shift.
- **Choosing a measure**: the median and IQR are not affected by extreme values (outliers); the mean and standard deviation use all the data.

## 5.2 Permutations and combinations
- Arranging n distinct items in a row: **n!**.
- With repeated items: n!/(p!q!…).
- **Permutations** (order matters): ⁿPᵣ = n!/(n − r)!.
- **Combinations** (order doesn't matter): ⁿCᵣ = n!/(r!(n − r)!).
- **Items together**: treat them as one block, then multiply by the number of arrangements inside the block.
- **Items not together**: (total arrangements) − (arrangements together), **or** arrange the others first and place the separated items in the gaps.
- **Selections with conditions**: split into cases and add.

## 5.3 Probability
- P(A′) = 1 − P(A).
- **P(A ∪ B) = P(A) + P(B) − P(A ∩ B)**.
- **Mutually exclusive**: P(A ∩ B) = 0.
- **Independent**: **P(A ∩ B) = P(A) × P(B)**.
- **Conditional probability**: **P(A | B) = P(A ∩ B)/P(B)**.
- Use tree diagrams (multiply along the branches, add between outcomes) and Venn diagrams.

## 5.4 Discrete random variables
- A probability distribution table: ΣP(X = x) = 1.
- **E(X) = Σx p**; **Var(X) = Σx² p − [E(X)]²**.
- **Binomial B(n, p)**: n independent trials, each with two outcomes and constant probability p of success.
  - **P(X = r) = ⁿCᵣ pʳ(1 − p)ⁿ⁻ʳ**; E(X) = np; Var(X) = np(1 − p).
- **Geometric Geo(p)**: the number of trials up to and including the **first** success.
  - **P(X = r) = (1 − p)ʳ⁻¹ p**; P(X > r) = (1 − p)ʳ; E(X) = 1/p.

## 5.5 The normal distribution
- **X ~ N(μ, σ²)**: a symmetrical, bell-shaped curve. Standardise with **Z = (X − μ)/σ** and use tables of Φ(z).
- P(Z < −a) = 1 − Φ(a).
- **Finding μ or σ**: write the z-values from the tables, set up equations such as (k − μ)/σ = z, and solve simultaneously.
- **Normal approximation to the binomial**: valid if **np > 5 and nq > 5**. Use μ = np and σ² = npq, with a **continuity correction** (e.g. P(X ≤ 20) becomes P(Y < 20.5)).

## Exam tips and common mistakes
- Histograms: frequency **density**, and use the class boundaries.
- In permutation questions, decide first: does order matter? Are items identical? Are there restrictions?
- To show independence, check **P(A ∩ B) = P(A)P(B)** numerically.
- Always apply the **continuity correction** when approximating a binomial by a normal distribution.
- Give probabilities to 3 significant figures.

## Quick self-check
1. How many arrangements of the letters of BANANA are there? *(60)*
2. X ~ B(10, 0.3). Find P(X = 2). *(0.233)*
3. X ~ N(50, 16). Find P(X > 56). *(0.0668)*
