---
subject: Computer Science 9618
chapter: 10
title: Data types and structures
paper: Paper 2 (also Papers 3 and 4)
---

# 10 Data types and structures

## What you must be able to do
- Choose suitable data types and define record types.
- Declare and use 1D and 2D arrays, including linear search and bubble sort.
- Read from and write to text files.
- Describe and use abstract data types: stacks, queues and linked lists.

## 10.1 Data types and records

| Type | Holds | Example |
|---|---|---|
| `INTEGER` | Whole numbers | 42, −7 |
| `REAL` | Numbers with a fractional part | 3.14 |
| `CHAR` | A single character | 'A' |
| `STRING` | A sequence of characters | "Hello" |
| `BOOLEAN` | TRUE or FALSE | TRUE |
| `DATE` | A date | 24/10/2026 |

**Record (user-defined composite type)**: groups related data items of **different** types under one identifier.
```
TYPE StudentRecord
   DECLARE StudentID : STRING
   DECLARE Name      : STRING
   DECLARE Mark      : INTEGER
   DECLARE Passed    : BOOLEAN
ENDTYPE

DECLARE Pupil : StudentRecord
Pupil.Name ← "Lola"
DECLARE Class : ARRAY[1:30] OF StudentRecord
Class[3].Mark ← 78
```
Why use a record? It keeps the data about one item together, so it is easier to manage and to pass to subroutines, and it can be stored in arrays and files.

## 10.2 Arrays
- **Array**: a data structure holding a fixed number of items of the **same** data type under one identifier, each accessed by an **index**.
- **Lower bound / upper bound**: the first and last index.
- 1D: `DECLARE Scores : ARRAY[1:10] OF INTEGER`
- 2D: `DECLARE Grid : ARRAY[1:5, 1:4] OF CHAR` (rows, columns). Access `Grid[Row, Col]` and use **nested loops** to process it.

**Linear search**
```
Found ← FALSE
Index ← 1
WHILE Found = FALSE AND Index <= 100 DO
   IF Names[Index] = SearchName
      THEN
         Found ← TRUE
      ELSE
         Index ← Index + 1
   ENDIF
ENDWHILE
IF Found THEN OUTPUT "Found at ", Index ELSE OUTPUT "Not found" ENDIF
```

**Bubble sort (efficient version with a flag)**
```
Top ← 100
REPEAT
   Swapped ← FALSE
   FOR i ← 1 TO Top - 1
      IF Data[i] > Data[i + 1]
         THEN
            Temp ← Data[i]
            Data[i] ← Data[i + 1]
            Data[i + 1] ← Temp
            Swapped ← TRUE
      ENDIF
   NEXT i
   Top ← Top - 1
UNTIL Swapped = FALSE OR Top = 1
```
The flag means the sort stops as soon as a pass makes no swaps (the data is sorted). `Top` shrinks because the largest item has "bubbled" to the end.

## 10.3 Files
- Files store data **permanently**, after the program ends. Arrays and variables live only in RAM while the program runs.
```
OPENFILE "Scores.txt" FOR WRITE      // creates or overwrites
WRITEFILE "Scores.txt", Line
CLOSEFILE "Scores.txt"

OPENFILE "Scores.txt" FOR READ
WHILE NOT EOF("Scores.txt") DO
   READFILE "Scores.txt", Line
   OUTPUT Line
ENDWHILE
CLOSEFILE "Scores.txt"

OPENFILE "Scores.txt" FOR APPEND     // adds to the end
```
Exam trap: always **close** the file, and check for **EOF** before each read.

## 10.4 Abstract data types (ADTs)
- **ADT**: a collection of data together with the set of operations on it, defined by *what* it does, not *how* it is implemented.

### Stack (LIFO – last in, first out)
- Operations: **push** (add to the top), **pop** (remove from the top), peek, isEmpty, isFull.
- Uses a **top pointer**. Uses: subroutine calls and return addresses, interrupt handling, undo, evaluating expressions (Reverse Polish), backtracking.
```
PROCEDURE Push(Item)
   IF TopPointer = MaxSize
      THEN OUTPUT "Stack full"
      ELSE
         TopPointer ← TopPointer + 1
         Stack[TopPointer] ← Item
   ENDIF
ENDPROCEDURE
```

### Queue (FIFO – first in, first out)
- Operations: **enqueue** (add at the rear), **dequeue** (remove from the front).
- Uses **front** and **rear** pointers. A **circular queue** wraps the rear pointer back to the start, so freed space is reused.
- Uses: print queues, keyboard buffers, process scheduling.
```
PROCEDURE Enqueue(Item)
   IF NumItems = MaxSize THEN OUTPUT "Queue full"
   ELSE
      Rear ← Rear + 1
      IF Rear > MaxSize THEN Rear ← 1 ENDIF
      Queue[Rear] ← Item
      NumItems ← NumItems + 1
   ENDIF
ENDPROCEDURE
```

### Linked list
- **Linked list**: a dynamic ADT in which each **node** holds data and a **pointer** to the next node. A **start pointer** gives the first node; a **null pointer** (e.g. −1 or 0) marks the end.
- A **free list** keeps track of unused nodes.
- **Insert**: take a node from the free list, store the data, find the correct position, and change pointers so the previous node points to the new node and the new node points to the next one.
- **Delete**: change the previous node's pointer to skip the node, then return it to the free list.
- Benefit: nodes can be added or removed without moving other data. Drawback: you must follow pointers from the start (no direct access), and pointers use extra memory.

## Exam tips and common mistakes
- Use a **record** when data items of different types belong together, and an **array** when items have the same type.
- In 2D array questions, check whether the question uses [row, column] and stick to it.
- In stack and queue procedures, check for **full** before adding and **empty** before removing.
- In linked list traces, update pointers in the **right order**, or you lose the rest of the list.

## Quick self-check
1. Write a record type for a book with ISBN, title, price and on-loan status.
2. Explain why a flag makes a bubble sort more efficient.
3. State the difference between a stack and a queue, with one use of each.
4. Describe the steps to delete a node from a linked list.
