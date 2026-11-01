---
subject: Computer Science 9618
chapter: 11
title: Programming
paper: Paper 2 (also Papers 3 and 4)
---

# 11 Programming

## What you must be able to do
- Use variables, constants, operators and built-in functions correctly.
- Use selection and the three types of loop.
- Write procedures and functions with parameters passed by value and by reference.
- Explain why structured programming and subroutines make programs easier to write and maintain.

## 11.1 Programming basics
- **Variable**: a named memory location whose value **can change** while the program runs.
- **Constant**: a named value that **cannot change** while the program runs. Benefits: change the value in one place; the code is more readable; it cannot be changed by accident.
- **Identifier**: the name given to a variable, constant, array or subroutine. It should be **meaningful**, e.g. `TotalScore`, not `t`.
- **Assignment**: `Score ← 10`.

### Operators
| Arithmetic | Meaning | Comparison | Logical |
|---|---|---|---|
| `+ - * /` | standard | `=  <>  <  >  <=  >=` | `AND  OR  NOT` |
| `DIV` | integer division: 17 DIV 5 = 3 | | |
| `MOD` | remainder: 17 MOD 5 = 2 | | |

### Built-in functions (from the pseudocode guide; use the list given in the paper)
| Function | Returns | Example |
|---|---|---|
| `LENGTH(s)` | number of characters | LENGTH("Cat") = 3 |
| `MID(s, start, n)` | n characters from position start | MID("Computer", 4, 3) = "put" |
| `LEFT(s, n)` / `RIGHT(s, n)` | first or last n characters | RIGHT("Hello", 2) = "lo" |
| `UCASE(s)` / `LCASE(s)` | upper or lower case | UCASE("ab") = "AB" |
| `INT(x)` | whole-number part | INT(7.9) = 7 |
| `NUM_TO_STR(x)` / `STR_TO_NUM(s)` | type conversion | |
| `RAND(x)` | random real 0 ≤ r < x | `INT(RAND(6)) + 1` gives a dice roll |
| `&` | concatenation | "AB" & "C" = "ABC" |

## 11.2 Constructs
- **Selection**: IF (with ELSE and nested IFs) for conditions and ranges; **CASE** when one variable is compared with several fixed values, which is clearer than many nested IFs.
- **Iteration**:
  - `FOR` (count-controlled) when the number of repeats is known.
  - `WHILE` (pre-condition) when the loop might not need to run at all.
  - `REPEAT…UNTIL` (post-condition) when the loop must run at least once, e.g. validation.
- **Nested** structures: a loop or IF inside another.

## 11.3 Structured programming
- **Subroutine**: a named, self-contained block of code that performs a specific task and can be **called** from elsewhere.
- **Procedure**: a subroutine that performs a task and does **not** return a value. It is called as a statement: `CALL DisplayMenu()`.
- **Function**: a subroutine that **returns a single value** and is used in an expression: `Area ← CalcArea(L, W)`.

```
PROCEDURE Swap(BYREF A : INTEGER, BYREF B : INTEGER)
   DECLARE Temp : INTEGER
   Temp ← A
   A ← B
   B ← Temp
ENDPROCEDURE

FUNCTION Max(X : INTEGER, Y : INTEGER) RETURNS INTEGER
   IF X > Y
      THEN RETURN X
      ELSE RETURN Y
   ENDIF
ENDFUNCTION
```

### Parameters
- **Parameter**: a value passed into a subroutine when it is called. (The values in the call are the arguments.)
- **By value (BYVAL)**: a **copy** of the value is passed, so changes inside the subroutine do **not** affect the original variable. This is the default.
- **By reference (BYREF)**: the **address** of the variable is passed, so changes inside the subroutine **do** change the original. Used when a subroutine needs to send back more than one value, e.g. `Swap`.

### Local and global variables
- **Local variable**: declared inside a subroutine; it exists only while the subroutine runs and can only be used there.
- **Global variable**: declared in the main program; it can be used anywhere.
- Prefer local variables: there are no accidental changes from elsewhere, the same name can be reused, memory is freed after the call, and subroutines are self-contained and reusable.

### Why use subroutines?
- Code is written once and **reused**, so programs are shorter.
- Each subroutine can be **tested** on its own.
- Teams can share the work, and programs are easier to read, debug and **maintain**.
- **Library routines** (pre-written, tested subroutines) save time.

## Writing the long programming question (Paper 2)
1. Read the whole scenario and underline every requirement, then tick them off as you code.
2. Use the identifiers given in the question **exactly**.
3. Declare local variables with types.
4. Structure: initialise → loop or input → validate → process → output.
5. For functions, make sure **every path returns** a value of the right type.
6. Comment briefly if it helps the examiner follow your logic.

## Exam tips and common mistakes
- Procedure versus function: say that a function **returns a value** and a procedure doesn't.
- BYREF versus BYVAL: explain the effect on the **original variable** in the calling program.
- `MID` uses a start position **and a length**, not an end position.
- Don't output inside a function unless asked; return the value instead.

## Quick self-check
1. What is the result of `MID("Cambridge", 2, 4)`? *("ambr")*
2. Explain why `Swap` must use BYREF parameters.
3. Give two reasons to use local rather than global variables.
4. Write a function `IsEven(N)` that returns TRUE if N is even. *(RETURN N MOD 2 = 0)*
