---
subject: Physics 9702
chapter: 19
title: Capacitance
paper: Paper 4
---

# 19 Capacitance

## Key definitions
- **Capacitance**: the charge stored per unit potential difference: **C = Q/V** (farad, F).
- **Farad**: 1 coulomb per volt.
- **Time constant (τ)**: τ = RC. It is the time for the charge (or p.d. or current) to fall to 1/e (≈ 37%) of its initial value during discharge.

## Combinations of capacitors
- **Parallel**: C = C₁ + C₂ + … (the same p.d. is across each, and the charges add).
- **Series**: 1/C = 1/C₁ + 1/C₂ + … (each stores the same charge, and the p.d.s add).
- These are the **opposite** of the rules for resistors.

## Energy stored
- **W = ½QV = ½CV² = Q²/(2C)**.
- This is the area under a graph of V against Q (a straight line), since work is done moving each small charge onto the plates against the p.d. already there.

## Discharge through a resistor
- **x = x₀ e^(−t/RC)**, where x is the charge, current or p.d.
- Each time interval of RC reduces the value to 37% of what it was at the start of that interval.
- ln x = ln x₀ − t/RC, so a graph of ln V against t is a straight line with gradient **−1/RC**.
- **Half-life of discharge**: t½ = RC ln 2 ≈ 0.69 RC.

## Experiment
Charge the capacitor, then discharge it through a known resistor, recording V (or I) at regular times. Plot ln V against t; the gradient gives −1/RC, from which C can be found. Use a large RC so the time readings are reliable, or use a data logger.

## Worked example
A 470 μF capacitor charged to 12 V discharges through a 10 kΩ resistor. Find the p.d. after 5.0 s and the initial energy stored.
RC = 470 × 10⁻⁶ × 10 × 10³ = 4.7 s; V = 12 e^(−5.0/4.7) = **4.1 V**; W = ½ × 470 × 10⁻⁶ × 12² = **0.034 J**

## Exam tips and common mistakes
- The series and parallel formulae are the **reverse** of the resistor rules.
- Energy stored is ½QV, **not** QV. Half of the energy supplied by the battery is dissipated in the resistance while charging.
- Use τ = RC with R in ohms and C in farads (μF × 10⁻⁶).

## Quick self-check
1. Find the total capacitance of 2.0 μF and 3.0 μF in series. *(1.2 μF)*
2. Explain why the area under a V–Q graph equals the energy stored.
3. After how many time constants has the charge fallen to about 5% of its initial value? *(about 3)*
