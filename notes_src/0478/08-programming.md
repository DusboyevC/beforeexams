---
subject: Computer Science 0478
chapter: 8
title: Programming
paper: Paper 2
---

# 8 Programming

## Variables, constants and data types
- **Variable**: a named storage location whose value **can change** while the program runs.
- **Constant**: a named value that **does not change** (e.g. `CONSTANT Pi ← 3.142`). It makes the code easier to read and update.
- **Data types**: `INTEGER` (whole numbers), `REAL` (decimals), `CHAR` (one character), `STRING` (text), `BOOLEAN` (TRUE or FALSE).

## Programming concepts
- **Sequence**: statements run in order.
- **Selection**:
  - `IF … THEN … ELSE … ENDIF`.
  - `CASE OF … OTHERWISE … ENDCASE` (use it for many fixed options).
- **Iteration**:
  - **Count-controlled**: `FOR i ← 1 TO 10 … NEXT i` (a fixed number of times).
  - **Pre-condition**: `WHILE condition DO … ENDWHILE`. The condition is checked first, so the loop may run **zero** times.
  - **Post-condition**: `REPEAT … UNTIL condition`. The loop runs **at least once**.
- **Totalling and counting**, **string handling**:
  - `LENGTH(s)`;
  - `LCASE(s)` / `UCASE(s)`;
  - `SUBSTRING(s, start, length)` (the first character is position 1).
- **Arithmetic operators**: `+ - * / ^`, plus `DIV` (integer division) and `MOD` (remainder). Logical operators: `AND`, `OR`, `NOT`. Comparison: `= <> < <= > >=`.

## Procedures and functions
- **Procedure**: a named block of code that performs a task. It **does not return a value**. Called with `CALL Name(params)`.
- **Function**: like a procedure but **returns a value**. Used in an expression: `x ← Square(4)`.
```
FUNCTION Square(Num : INTEGER) RETURNS INTEGER
   RETURN Num * Num
ENDFUNCTION
```
- **Parameters**: values passed into a subroutine.
- **Local variable**: declared inside a subroutine and used only there.
- **Global variable**: declared in the main program and usable anywhere.
- **Why use subroutines**: the code can be **reused**, is easier to test and maintain, and keeps the program shorter and more structured.
- **Library routines**: `MOD`, `DIV`, `ROUND(x, places)`, `RANDOM()`.

## Arrays
- **1D array**: `DECLARE Names : ARRAY[1:30] OF STRING`. Access: `Names[5]`.
- **2D array**: `DECLARE Marks : ARRAY[1:30, 1:3] OF INTEGER`. Access: `Marks[row, column]`. Use **nested loops** to process it.

## File handling
- Why use files: the data is stored **permanently** and can be used again when the program runs next time.
```
OPENFILE "data.txt" FOR WRITE
WRITEFILE "data.txt", Line
CLOSEFILE "data.txt"

OPENFILE "data.txt" FOR READ
READFILE "data.txt", Line
CLOSEFILE "data.txt"
```

## Maintainable programs
- Meaningful **identifiers**; **comments**; procedures and functions; constants; indentation.

## Exam tips and common mistakes
- In the long programming question (15 marks), you must: **declare** variables and arrays, **initialise** them, use **loops** over the arrays, **validate** input, **output** with messages, and add **comments**.
- `WHILE` checks first and `REPEAT` checks at the end. Choose the one that fits the question.
- A function **must** have `RETURNS` with a type and a `RETURN` statement.
- This chapter overlaps with **Algorithm design** (chapter 7) and **Databases** (chapter 9).

## Quick self-check
1. What is the difference between a procedure and a function?
2. Write the pseudocode to output the total of each row of a 2D array `Scores[1:10, 1:4]`.
3. What does `17 MOD 5` return, and what does `17 DIV 5` return? *(2 and 3)*
