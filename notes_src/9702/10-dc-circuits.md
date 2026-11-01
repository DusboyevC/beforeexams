---
subject: Physics 9702
chapter: 10
title: D.C. circuits
paper: Papers 1 and 2
---

# 10 D.C. circuits

## Key definitions
- **Internal resistance (r)**: the resistance inside a source of e.m.f. It causes a loss of p.d. (the "lost volts") when current flows.
- **Terminal p.d.**: V = E − Ir.
- **Kirchhoff's first law**: the sum of the currents entering a junction = the sum of the currents leaving it. This is a consequence of **conservation of charge**.
- **Kirchhoff's second law**: in any closed loop, the sum of the e.m.f.s = the sum of the p.d.s. This is a consequence of **conservation of energy**.

## Resistor combinations
- **Series**: R = R₁ + R₂ + … (the same current flows through each).
- **Parallel**: 1/R = 1/R₁ + 1/R₂ + … (the same p.d. is across each). The combined resistance is **less** than the smallest single resistor.
- Derivation (series): the e.m.f. equals the sum of the p.d.s, so IR = IR₁ + IR₂, giving R = R₁ + R₂.
- Derivation (parallel): the total current is the sum of the branch currents, so V/R = V/R₁ + V/R₂.

## Internal resistance
- E = I(R + r). As the external resistance R falls, the current rises and the terminal p.d. falls.
- **Maximum power** is delivered to the external load when **R = r**.
- **Finding E and r experimentally**: vary R, record V and I, and plot V against I. The y-intercept = **E**, and the gradient = **−r**.

## Potential divider
- **V_out = V_in × R₂ / (R₁ + R₂)**, taken across R₂.
- With a thermistor or LDR as one resistor, V_out changes with temperature or light. This is used in sensing circuits. Example: in the dark, the LDR's resistance rises, so its share of the p.d. rises.

## Potentiometer
- A uniform resistance wire with a steady current through it, so the p.d. along the wire is proportional to the length.
- **Comparing e.m.f.s**: find the balance length where the galvanometer reads **zero**. Then E₁/E₂ = L₁/L₂.
- At balance **no current** is drawn from the cell being tested, so its full e.m.f. is measured. Benefit: the internal resistance doesn't matter.

## Worked example
A cell with E = 6.0 V and r = 0.50 Ω is connected to a 2.5 Ω resistor. Find the current and the terminal p.d.
I = 6.0 / (2.5 + 0.5) = **2.0 A**; V = 6.0 − 2.0 × 0.5 = **5.0 V**

## Exam tips and common mistakes
- Kirchhoff questions: state which **conservation law** each one comes from.
- Go round a loop in one direction and keep the signs consistent (an e.m.f. against the loop direction is negative).
- The terminal p.d. is less than the e.m.f. whenever a current flows.
- In potential divider explanations, follow the full chain: condition changes → resistance changes → share of the p.d. changes → output changes.

## Quick self-check
1. Find the combined resistance of 6 Ω and 3 Ω in parallel. *(2 Ω)*
2. A battery's terminal p.d. falls from 9.0 V to 8.0 V when it supplies 0.50 A. Find r. *(2.0 Ω)*
3. Explain why a potentiometer measures e.m.f. more accurately than a voltmeter.
