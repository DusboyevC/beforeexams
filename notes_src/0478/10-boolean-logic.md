---
subject: Computer Science 0478
chapter: 10
title: Boolean logic
paper: Paper 2
---

# 10 Boolean logic

## Logic gates
| Gate | Output is 1 when… | Expression |
|---|---|---|
| **NOT** | the input is 0 | X = NOT A |
| **AND** | **both** inputs are 1 | X = A AND B |
| **OR** | **at least one** input is 1 | X = A OR B |
| **NAND** | NOT AND: unless both are 1 | X = A NAND B |
| **NOR** | NOT OR: only when both are 0 | X = A NOR B |
| **XOR** | the inputs are **different** | X = A XOR B |

- Learn the standard **symbols**:
  - NOT: a triangle with a circle.
  - AND: a D shape.
  - OR: a curved shield shape.
  - NAND and NOR: AND and OR with a circle at the output.
  - XOR: OR with an extra curved line at the input.

## Truth tables
- With n inputs there are **2ⁿ rows**: 2 inputs give 4 rows, and 3 inputs give 8 rows.
- List the inputs in binary order: 000, 001, 010, 011, 100, 101, 110, 111.
- Add a column for each intermediate gate output (working), then the final output column X.

## Logic circuits and expressions
- **Expression → circuit**: draw a gate for each operator, working from the innermost brackets outwards.
- **Circuit → expression**: write the output of each gate, then combine them, e.g. X = (A AND B) OR (NOT C).
- **Problem statement → circuit**: turn the words into an expression first.
  - Example: "The alarm (X) sounds if the door is open (A = 1) **and** the system is armed (B = 1), **or** if there is smoke (C = 1)."
  - This gives X = (A AND B) OR C.
- Worked truth table for X = (A AND B) OR NOT C:

| A | B | C | A AND B | NOT C | X |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 1 | 1 |
| 0 | 0 | 1 | 0 | 0 | 0 |
| 0 | 1 | 0 | 0 | 1 | 1 |
| 0 | 1 | 1 | 0 | 0 | 0 |
| 1 | 0 | 0 | 0 | 1 | 1 |
| 1 | 0 | 1 | 0 | 0 | 0 |
| 1 | 1 | 0 | 1 | 1 | 1 |
| 1 | 1 | 1 | 1 | 0 | 1 |

## Exam tips and common mistakes
- Use the **exact gate symbols**, not boxes with labels, and draw each gate with only the number of inputs the syllabus allows (2, except NOT).
- Watch the wording: "is not" usually means NOT; "either … but not both" means XOR.
- Fill the truth table input columns systematically, so no row is missed or repeated.
- Logic questions can involve sensors and alarms, so they link with **Automated systems** (chapter 6).

## Quick self-check
1. Complete the truth table for X = A XOR B.
2. Write the logic expression for: "the pump (X) is on if the water level is low (A) and the tank is not empty (B)".
3. How many rows does a truth table with 3 inputs need? *(8)*
