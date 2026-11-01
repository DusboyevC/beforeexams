---
subject: Computer Science 9618
chapter: 19
title: Computational thinking and problem-solving
paper: Papers 3 and 4 (also Paper 2)
---

# 19 Computational thinking and problem-solving

## What you must be able to do
- Write and trace linear search, binary search, insertion sort and bubble sort.
- Implement ADTs: stack, queue, linked list, binary tree, dictionary and graph.
- Compare algorithms using Big O notation for time and space.
- Write and trace recursive algorithms, and explain how the call stack is used.

## 19.1 Algorithms

### Binary search (the data must be **sorted**)
```
FUNCTION BinarySearch(List, Target, N) RETURNS INTEGER
   Low ← 1
   High ← N
   WHILE Low <= High DO
      Mid ← (Low + High) DIV 2
      IF List[Mid] = Target
         THEN RETURN Mid
      ENDIF
      IF List[Mid] < Target
         THEN Low ← Mid + 1
         ELSE High ← Mid - 1
      ENDIF
   ENDWHILE
   RETURN -1           // not found
ENDFUNCTION
```
Each comparison halves the search area, so it is **O(log n)**. A linear search is **O(n)** but works on unsorted data.

### Insertion sort
```
FOR i ← 2 TO N
   Key ← List[i]
   j ← i - 1
   WHILE j >= 1 AND List[j] > Key DO
      List[j + 1] ← List[j]
      j ← j - 1
   ENDWHILE
   List[j + 1] ← Key
NEXT i
```
It takes each item in turn and inserts it into its correct place in the sorted part on the left. Worst case **O(n²)**; it is fast, close to **O(n)**, on nearly-sorted data.

Bubble sort: see chapter 10. It is **O(n²)**.

### Performance of search and sort algorithms
- Insertion sort generally makes fewer comparisons than bubble sort, especially on nearly-sorted data.
- Binary search is much faster than linear search for large lists, but only works if the list is sorted.

### ADTs at A Level
- **Stack, queue, linked list**: see chapter 10. At A Level you also implement them with arrays and pointers (including a free list).
- **Binary tree**: each node has data plus a **left pointer** and a **right pointer**. In a **binary search tree**, values smaller than a node go to its left and larger values go to its right.
  - **Insert**: start at the root and go left or right by comparing values, until there is a null pointer; attach the new node there.
  - **Search**: compare and go left or right; on average **O(log n)**.
  - **In-order traversal** (left, root, right) outputs the values in sorted order.
- **Dictionary**: a collection of **key–value pairs**; each value is looked up by its unique key, often using hashing.
- **Graph**: nodes and edges, stored as an **adjacency matrix** (a 2D array) or an **adjacency list**.

### Big O notation
- Describes how the time (or memory) an algorithm needs **grows** as the input size n grows, usually for the **worst case**.

| Big O | Name | Example |
|---|---|---|
| O(1) | Constant | Accessing an array element by index |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Linear search |
| O(n log n) | Linearithmic | Merge sort, quicksort (average) |
| O(n²) | Polynomial (quadratic) | Bubble sort, insertion sort |
| O(2ⁿ) | Exponential | Brute-forcing every combination |

- **Space complexity**: how much extra memory the algorithm needs as n grows.

## 19.2 Recursion
- **Recursive subroutine**: one that **calls itself**.
- It must have:
  1. a **base case**, which stops the recursion and returns without calling itself;
  2. a **general (recursive) case**, which calls itself with a **smaller** version of the problem that moves towards the base case.
```
FUNCTION Factorial(N : INTEGER) RETURNS INTEGER
   IF N = 0
      THEN RETURN 1                    // base case
      ELSE RETURN N * Factorial(N - 1) // general case
   ENDIF
ENDFUNCTION
```
- **How it runs**: each call is placed on the **call stack** as a stack frame holding its parameters, local variables and return address (**winding**). When the base case is reached, the calls return one by one, popping off the stack (**unwinding**), and each result is used by the call below it.
- Trace Factorial(3): 3 × Factorial(2) → 2 × Factorial(1) → 1 × Factorial(0) → returns 1; then 1 × 1 = 1, 2 × 1 = 2, 3 × 2 = **6**.

| Recursion: benefits | Recursion: drawbacks |
|---|---|
| Shorter, more elegant code for problems that are naturally recursive (trees, factorial, divide and conquer) | Uses more memory: a stack frame for every call |
| | Risk of **stack overflow** if it recurses too deeply or the base case is missing |
| | Often slower than an iterative version |

- A compiler implements recursion using a **stack** for return addresses and local values.

## Exam tips and common mistakes
- Binary search: say the list must be **sorted**, and remember to change `Low` or `High` to `Mid ± 1`.
- In recursion questions, always identify the **base case** and show the unwinding in your trace.
- Big O measures **growth rate**; ignore constants (O(2n) = O(n)).
- In binary tree insertion, follow the pointers carefully and update the free pointer if an array is used.

## Quick self-check
1. Why is binary search O(log n)?
2. Write the order of nodes visited in an in-order traversal of a binary search tree built by inserting 50, 30, 70, 20, 40. *(20, 30, 40, 50, 70)*
3. Explain what happens on the call stack when a recursive function reaches its base case.
4. Give one reason to use an iterative rather than a recursive solution.
