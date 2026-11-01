---
subject: Mathematics 9709
chapter: 6
title: Probability and Statistics 2 (Paper 6)
paper: Paper 6
---

# 6 Probability and Statistics 2

## 6.1 The Poisson distribution
- **X ~ Po(λ)**: the number of events in a fixed interval, where the events occur **randomly, independently, singly, and at a constant average rate**.
- **P(X = r) = e^(−λ) λʳ / r!**; **E(X) = Var(X) = λ**.
- Scale λ to the interval: 3 per hour becomes 6 per 2 hours.
- **Sum** of independent Poisson variables: X + Y ~ Po(λ₁ + λ₂).
- **Poisson approximation to the binomial**: B(n, p) ≈ Po(np) when n is large (n > 50) and p is small (np < 5).
- **Normal approximation to the Poisson**: Po(λ) ≈ N(λ, λ) when λ > 15, with a continuity correction.

## 6.2 Linear combinations of random variables
- **E(aX + b) = aE(X) + b**; **Var(aX + b) = a²Var(X)**.
- **E(aX ± bY) = aE(X) ± bE(Y)**.
- **Var(aX ± bY) = a²Var(X) + b²Var(Y)** for independent X and Y. The variances **add** even when you subtract.
- **Sum of two observations versus double one observation**: Var(X₁ + X₂) = 2Var(X), but Var(2X) = 4Var(X).
- A linear combination of independent normal variables is normal.

## 6.3 Continuous random variables
- **Probability density function (pdf) f(x)**: f(x) ≥ 0, and ∫ f(x) dx over all x = 1.
- P(a < X < b) = ∫ₐᵇ f(x) dx.
- **E(X) = ∫ x f(x) dx**; **Var(X) = ∫ x² f(x) dx − [E(X)]²**.
- **Median m**: ∫ from the lower limit to m of f(x) dx = 0.5.
- **Mode**: the value of x where f(x) is greatest.

## 6.4 Sampling and estimation
- **Random sample**: every possible sample of that size has an equal chance of being chosen. Sampling avoids the cost and time of a full census.
- **Distribution of the sample mean**: X̄ ~ N(μ, σ²/n) if X is normal, or **approximately** so for large n (n ≥ 30) by the **Central Limit Theorem**, whatever the distribution of X.
- **Unbiased estimates**: of μ, use x̄. Of σ², use **s² = (n/(n − 1)) × (Σx²/n − x̄²) = (Σx² − (Σx)²/n)/(n − 1)**.
- **Confidence interval for μ**: **x̄ ± z × σ/√n** (z = 1.96 for 95%; 1.645 for 90%; 2.576 for 99%). Use s if σ is unknown and n is large.
- **Interpretation**: if many samples were taken and a 95% interval found from each, about 95% of the intervals would contain μ.
- **Confidence interval for a proportion**: p̂ ± z√(p̂(1 − p̂)/n).

## 6.5 Hypothesis tests
- **H₀**: the null hypothesis, which states the parameter value (e.g. p = 0.3, μ = 50, λ = 4). **H₁**: the alternative (≠ for two-tailed; < or > for one-tailed).
- **Significance level**: the probability of rejecting H₀ when it is true.
- **Method**: calculate the probability of the observed result *or more extreme*, assuming H₀ is true, and compare it with the significance level. Or compare the test statistic with the critical value.
- **Tests you must know**: the binomial test for p; the Poisson test for λ; the normal test for a mean, z = (x̄ − μ)/(σ/√n).
- **Type I error**: rejecting H₀ when it is true. **P(Type I) = the significance level** (or the actual probability of the critical region for discrete distributions).
- **Type II error**: accepting H₀ when it is false. Its probability is found using the actual value of the parameter and the critical region.
- **Conclusion**: state it **in context**, without certainty: "There is sufficient evidence at the 5% level that the mean has increased."

## Exam tips and common mistakes
- State the **conditions** for a Poisson model in context: random, independent, constant rate.
- For variances of combinations, square the coefficients, and **add** them.
- In hypothesis tests, define the parameter, state H₀ and H₁, show the probability or test statistic, compare, and conclude in context.
- For a two-tailed test, compare with **half** the significance level in each tail.

## Quick self-check
1. X ~ Po(2.5). Find P(X ≤ 1). *(0.287)*
2. X ~ N(20, 9) and Y ~ N(15, 4) are independent. Find the distribution of X − Y. *(N(5, 13))*
3. A sample of 50 has x̄ = 12.4 and s = 3.0. Find a 95% confidence interval for μ. *(11.57 to 13.23)*
