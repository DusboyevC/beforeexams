---
subject: Computer Science 9618
chapter: 9
title: Algorithm design and problem-solving
paper: Paper 2
---

# 9 Algorithm design and problem-solving

## What you must be able to do
- Use abstraction and decomposition to break down a problem.
- Write algorithms as structured English, flowcharts and pseudocode, and convert between them.
- Draw up an identifier table.
- Use stepwise refinement to turn an outline into detailed steps.

## 9.1 Computational thinking skills
- **Abstraction**: removing unnecessary detail so you can focus on the essential features of the problem. Benefits: the problem is simpler to solve; development is quicker; the solution is smaller and easier to maintain.
  - Example: a route-planning app keeps roads, junctions and distances, but ignores the colour of buildings.
- **Decomposition**: breaking a complex problem into smaller sub-problems that can each be solved, coded and tested separately (often as procedures or functions). Benefits: easier to manage; parts can be shared between programmers; modules can be reused and tested independently.

## 9.2 Algorithms

### Key terms
- **Algorithm**: an ordered set of steps that solves a problem.
- **Structured English**: a restricted subset of English using command words (INPUT, CALCULATE, IF, REPEAT…) to describe the steps in order.
- **Flowchart**: a diagram using standard symbols joined by arrows to show the steps and decisions.
- **Pseudocode**: a language-independent way of writing an algorithm using keywords and structures close to a programming language. The Cambridge pseudocode guide sets the standard.
- **Identifier table**: lists each identifier with its data type and a description of what it is for.

### Flowchart symbols
| Symbol | Use |
|---|---|
| Rounded rectangle (terminator) | START / STOP |
| Parallelogram | INPUT / OUTPUT |
| Rectangle | Process, e.g. `Total ← Total + Mark` |
| Diamond | Decision with Yes / No branches |
| Rectangle with double sides | Predefined process (a subroutine call) |
| Arrows | Flow of control |

### The three basic constructs
1. **Sequence**: steps run one after another.
2. **Selection**: a choice of path using IF…THEN…ELSE…ENDIF or CASE…OF…OTHERWISE…ENDCASE.
3. **Iteration**: repetition.
   - **Count-controlled**: `FOR … TO … NEXT`, when the number of repeats is known in advance.
   - **Pre-condition**: `WHILE … DO … ENDWHILE`. The condition is tested first, so the loop may run **zero** times.
   - **Post-condition**: `REPEAT … UNTIL …`. The condition is tested at the end, so the loop runs **at least once**.

### Core pseudocode (Cambridge style)
```
DECLARE Total : INTEGER
DECLARE Names : ARRAY[1:30] OF STRING
CONSTANT MaxMark = 100
Total ← 0
INPUT Mark
OUTPUT "Average is ", Total / Count
IF Mark >= 50
   THEN
      OUTPUT "Pass"
   ELSE
      OUTPUT "Fail"
ENDIF
CASE OF Grade
   'A' : OUTPUT "Excellent"
   'B' : OUTPUT "Good"
   OTHERWISE OUTPUT "Keep going"
ENDCASE
FOR Index ← 1 TO 30
   Total ← Total + Marks[Index]
NEXT Index
```

### Standard algorithms you must be able to write
**Totalling and averaging**
```
Total ← 0
FOR Count ← 1 TO 10
   INPUT Num
   Total ← Total + Num
NEXT Count
OUTPUT Total / 10
```

**Counting with validation (input until valid)**
```
REPEAT
   OUTPUT "Enter a mark (0-100)"
   INPUT Mark
UNTIL Mark >= 0 AND Mark <= 100
```

**Maximum and minimum**
```
Max ← Marks[1]
Min ← Marks[1]
FOR i ← 2 TO 30
   IF Marks[i] > Max THEN Max ← Marks[i] ENDIF
   IF Marks[i] < Min THEN Min ← Marks[i] ENDIF
NEXT i
```

**Rogue value to end input**
```
Total ← 0
INPUT Num
WHILE Num <> -1 DO
   Total ← Total + Num
   INPUT Num
ENDWHILE
```

### Stepwise refinement
- **Stepwise refinement**: breaking each step of an outline algorithm into smaller, more detailed steps, again and again, until every step can be coded directly.
- Example:
  1. Get valid exam marks → 1.1 Input a mark → 1.2 Check it is between 0 and 100 → 1.3 Repeat until valid.
  2. Calculate the grade → 2.1 Compare the mark against the grade boundaries…

### Writing a good algorithm in the exam
1. **Declare** variables (and arrays) with types. Some questions demand this; it is good practice anyway.
2. **Initialise** totals and counters before the loop.
3. Use the **right loop**: FOR when the count is known, REPEAT for validation, WHILE when it may not need to run.
4. Use **meaningful identifiers** and indent the code.
5. **Output** exactly what the question asks for, with sensible messages.

## Exam tips and common mistakes
- Forgetting to initialise `Total ← 0` or `Count ← 0` is the most common lost mark.
- In WHILE loops with a rogue value, read the **first value before the loop** and the next value at the **end** of the loop body.
- Use `←` for assignment and `=` for comparison in pseudocode.
- When converting a flowchart to pseudocode, every decision diamond becomes an IF or a loop condition, so check which way the arrows go.

## Quick self-check
1. Explain why a REPEAT…UNTIL loop is more suitable than WHILE for input validation.
2. Write pseudocode to input 20 numbers and output how many were greater than 50.
3. Give two benefits of decomposition.
4. Define abstraction and give an example.
