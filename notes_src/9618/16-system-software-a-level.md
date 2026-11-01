---
subject: Computer Science 9618
chapter: 16
title: System software (A Level)
paper: Paper 3
---

# 16 System software (A Level)

## What you must be able to do
- Explain how an OS maximises the use of resources, and describe process scheduling and process states.
- Explain paging, segmentation, virtual memory, page replacement and disk thrashing.
- Describe the stages of compilation.
- Read and write grammar in BNF and syntax diagrams.
- Use Reverse Polish Notation (RPN) and evaluate it using a stack.

## 16.1 Purposes of an operating system

### Maximising resources
- **Multitasking / multiprogramming**: several processes are kept in memory and the CPU switches between them, so it is never idle while one process waits for I/O.
- **Kernel**: the core of the OS that manages the CPU, memory and devices, and handles interrupts.
- The OS hides the complexity of the hardware from the user by providing an interface and services (e.g. file and device handling) through the kernel and device drivers.

### Process states
- **Process**: a program that is being executed.
- **Running**: the process is using the CPU.
- **Ready**: the process could run and is waiting in the ready queue for the CPU.
- **Blocked (waiting)**: the process cannot run until an event happens, e.g. I/O completes.
- Transitions: Ready → Running (dispatched by the scheduler); Running → Ready (time slice used up, or interrupted by a higher priority process); Running → Blocked (waits for I/O); Blocked → Ready (the I/O completes). A process **cannot** go straight from Blocked to Running.
- **Process control block (PCB)**: stores each process's state, PC, registers, priority and memory information, so it can be resumed.

### Scheduling
- **Low-level scheduler**: decides which ready process gets the CPU next. **High-level scheduler**: decides which processes are loaded into memory.
- Aims: keep the CPU busy, be fair, give quick responses, maximise throughput.

| Algorithm | How it works | Notes |
|---|---|---|
| **First come first served (FCFS)** | In order of arrival | Simple; short jobs can wait a long time behind long ones |
| **Shortest job first (SJF)** | The process with the shortest burst time runs next (non-preemptive) | Minimum average waiting time; long jobs may **starve**; burst times must be estimated |
| **Shortest remaining time (SRT)** | Preemptive SJF: a new shorter job interrupts the current one | Good for short jobs; more context switching |
| **Round robin** | Each process gets a fixed **time slice (quantum)** in turn; unfinished processes go to the back of the queue | Fair and responsive; performance depends on the quantum size |

### Memory management
- **Paging**: memory is split into equal-sized physical blocks called **frames**, and programs into same-sized **pages**. A **page table** maps each page to a frame. Pages need not be contiguous, so there is no external fragmentation.
- **Segmentation**: the program is split into variable-sized logical **segments** (e.g. code, data, stack); a segment table holds the base address and length of each.
- **Virtual memory**: part of secondary storage is used as if it were main memory. Pages not currently needed are kept on disk and **swapped** into RAM when needed.
  - Benefit: programs larger than RAM can run, and more programs can run at once.
  - Drawback: disk access is far slower than RAM.
- **Page replacement**: when RAM is full and a new page is needed, a page is removed, e.g. by first-in-first-out, least recently used, or least frequently used.
- **Disk thrashing**: so much time is spent swapping pages between RAM and disk that very little useful processing happens. It occurs when too many processes compete for too little RAM. Fix it by adding more RAM or running fewer programs.

## 16.2 Translation software

### Stages of compilation
1. **Lexical analysis**: removes white space and comments; breaks the source code into **tokens**; adds identifiers to the **symbol table**; reports invalid tokens.
2. **Syntax analysis (parsing)**: checks the token sequence against the grammar rules of the language (e.g. BNF) and builds a parse tree; reports syntax errors.
3. **Code generation**: produces object code (machine code) from the parse tree.
4. **Optimisation**: makes the code faster, smaller or use less memory, e.g. by removing redundant instructions or unreachable code, or moving fixed calculations out of loops.

### BNF (Backus–Naur Form)
- Defines the **syntax** of a language. `<...>` is a non-terminal, `::=` means "is defined as", `|` means "or".
```
<digit>   ::= 0|1|2|3|4|5|6|7|8|9
<letter>  ::= A|B|C|...|Z
<integer> ::= <digit> | <digit><integer>          (recursive: one or more digits)
<identifier> ::= <letter> | <identifier><letter> | <identifier><digit>
```
- **Recursion** in a rule lets an item repeat any number of times.

### Syntax diagrams
- These show the same rules graphically: rectangles for non-terminals, rounded boxes or circles for terminals, and arrows for the allowed paths. A loop-back arrow shows repetition.

### Reverse Polish Notation (RPN)
- **RPN (postfix)**: operators come **after** their operands, e.g. `A + B` becomes `A B +`.
- Benefits: **no brackets** are needed; there are no precedence rules; it is evaluated easily with a **stack**, so compilers and interpreters use it.
- Converting infix to RPN: (A + B) × C → `A B + C ×`; A + B × C → `A B C × +`.
- **Evaluating with a stack**: read left to right. For an operand, **push** it. For an operator, **pop** two values, apply the operator (second popped value OP first popped value), and push the result. The final value on the stack is the answer.
  - Example `5 3 2 × +`: push 5, push 3, push 2; × pops 2 and 3 and pushes 6; + pops 6 and 5 and pushes **11**.

## Exam tips and common mistakes
- Process state diagram: there is **no** arrow from Blocked to Running.
- For scheduling, give the **benefit and drawback** of each algorithm, e.g. "SJF can starve long processes".
- Name the **stage** of compilation precisely; lexical analysis creates tokens and the symbol table.
- In RPN evaluation, keep the operand order correct for − and ÷.

## Quick self-check
1. Explain the difference between paging and segmentation.
2. Describe how disk thrashing happens.
3. Convert (A − B) × (C + D) to RPN. *(A B − C D + ×)*
4. Explain how round robin scheduling ensures every process gets CPU time.
