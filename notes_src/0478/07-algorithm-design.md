---
subject: Computer Science 0478
chapter: 7
title: Algorithm design and problem solving
paper: Paper 2
---

# 7 Algorithm design and problem solving

## Program development life cycle
1. **Analysis**: abstraction, decomposition, identifying the problem and the requirements.
2. **Design**: structure diagrams, flowcharts, pseudocode.
3. **Coding**: writing the program and iterative testing.
4. **Testing**: using test data.

## Computational thinking
- **Abstraction**: removing unnecessary details and keeping only what matters.
- **Decomposition**: breaking a problem into **smaller sub-problems** that are easier to solve.
- Every system is made of sub-systems. Each one has **inputs, processes, outputs and storage**.

## Designing solutions
- **Structure diagram**: shows the problem broken down (top-down) into sub-systems.
- **Flowchart symbols**: terminator (start/stop, rounded), process (rectangle), input/output (parallelogram), decision (diamond, with Yes/No), subroutine (rectangle with double sides), flow lines.
- **Pseudocode**: uses the Cambridge style (`INPUT`, `OUTPUT`, `IF … THEN … ELSE … ENDIF`, `FOR … TO … NEXT`, etc.).

## Standard methods
- **Totalling**: `Total ← Total + Value`.
- **Counting**: `Count ← Count + 1`.
- **Maximum, minimum and average**: set Max to the first value (or a very low value); `IF Value > Max THEN Max ← Value`. Average = Total / Count.
- **Linear search**: check each element in turn until it is found or the end is reached.
```
Found ← FALSE
Index ← 1
WHILE Found = FALSE AND Index <= 50 DO
   IF Names[Index] = SearchName THEN
      Found ← TRUE
   ELSE
      Index ← Index + 1
   ENDIF
ENDWHILE
```
- **Bubble sort**: compare adjacent pairs and swap them if they are in the wrong order; repeat passes until there are **no swaps** in a pass.
```
REPEAT
   Swap ← FALSE
   FOR i ← 1 TO n - 1
      IF List[i] > List[i + 1] THEN
         Temp ← List[i]
         List[i] ← List[i + 1]
         List[i + 1] ← Temp
         Swap ← TRUE
      ENDIF
   NEXT i
UNTIL Swap = FALSE
```

## Validation and verification
- **Validation**: an automatic check that the data is **reasonable / acceptable**. It doesn't check that it is correct.
  - **Range check**: between limits (e.g. 0–100).
  - **Length check**: the number of characters.
  - **Type check**: the data type (e.g. an integer).
  - **Presence check**: not left blank.
  - **Format check**: a pattern (e.g. AB1234).
  - **Check digit**: a calculated digit.
- **Verification**: checks that the data has been **copied or entered accurately**.
  - **Double entry**: entered twice and compared.
  - **Visual check**: the user checks it on screen.

## Test data
- **Normal**: accepted, e.g. 50 for the range 1–100.
- **Abnormal**: rejected, e.g. −5 or "abc".
- **Extreme**: the largest and smallest acceptable values, e.g. 1 and 100.
- **Boundary**: values either side of each limit, one accepted and one rejected, e.g. 0 and 1, and 100 and 101.

## Trace tables and errors
- **Trace table**: records the value of each variable as each line of an algorithm runs. Use it to dry-run code and find errors.
- To find errors, look for the wrong comparison (`<` vs `<=`), a wrong initial value, the wrong variable, or a missing increment.
- Know how to **correct** the line and to explain the **purpose** of an algorithm.

## Exam tips and common mistakes
- Boundary data must include **both** the accepted and the rejected value on each side.
- In bubble sort, use a **flag** to stop early when no swaps occur.
- When writing algorithms, **initialise** every total and count before the loop.
- This chapter is often examined together with **Programming** (chapter 8).

## Quick self-check
1. Give one example each of normal, abnormal and extreme data for a mark from 0 to 100.
2. What is the difference between validation and verification?
3. Write the pseudocode to count how many of 30 input numbers are greater than 10.
