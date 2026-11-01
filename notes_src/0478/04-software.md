---
subject: Computer Science 0478
chapter: 4
title: Software
paper: Paper 1
---

# 4 Software

## Types of software
- **System software**: manages the hardware and gives a platform for applications, e.g. the operating system and utility software (anti-virus, defragmentation, backup, compression).
- **Application software**: lets the user carry out specific tasks, e.g. a word processor, web browser, game or spreadsheet.
- **Firmware**: software stored permanently in **ROM** that controls the hardware directly, e.g. the **bootloader** (BIOS), which loads the operating system when the computer starts.

## Operating system functions
- Managing **files**; handling **interrupts**; providing a **user interface**; managing **peripherals and drivers**; managing **memory**; managing **multitasking**; providing a platform for running applications; providing system **security**; managing **user accounts**.

## Interrupts
- **Interrupt**: a **signal** sent to the processor to tell it that something needs attention.
  - **Hardware interrupts**: a key pressed, a mouse moved, the printer out of paper.
  - **Software interrupts**: division by zero, two processes trying to use the same memory.
- **How it is handled**: the interrupt is placed in a queue by priority. At the end of the current FDE cycle, the CPU checks for interrupts. If one has a higher priority, the current task is **paused** and its state saved. The **interrupt service routine (ISR)** is run, then the original task is resumed.
- Without interrupts, the computer would not respond to the user or devices until each task had finished.

## Programming languages
| High-level language | Low-level language |
|---|---|
| Close to human language; easy to read, write and debug | Close to machine code; hard to understand |
| **Portable**: runs on different machines | Machine-specific |
| One statement may become many machine-code instructions | Gives **direct control of the hardware**, e.g. embedded systems and device drivers |
| Needs a compiler or interpreter | **Assembly language** needs an **assembler**; machine code needs no translation |
| | Efficient: fast, and uses less memory |

## Translators
| Compiler | Interpreter |
|---|---|
| Translates the **whole program** at once | Translates and runs **one line at a time** |
| Produces an **executable file**, which runs without the translator and is fast | No executable; the interpreter is needed each time it runs |
| Gives an **error report** for the whole program after translation | **Stops at the first error**, so it is easy to find and fix |
| Used when the program is **finished**, for distribution (the code stays hidden) | Used during **development** and debugging |
- **Assembler**: translates **assembly language** into machine code.

## Integrated development environment (IDE)
- Provides **code editors**, run-time environments, **translators**, **error diagnostics**, **auto-completion**, auto-correction and **prettyprint** (colour-coding keywords).

## Exam tips and common mistakes
- Firmware is stored in **ROM** and loads the OS (the bootloader).
- Interrupt handling: **ISR**, **priority**, the current task **paused and resumed**.
- When asked "why use both a compiler and an interpreter?", say interpreter for development (line by line) and compiler at the end (executable, fast, hides the code).

## Quick self-check
1. Give two examples each of hardware and software interrupts.
2. Explain why a programmer might choose assembly language for a microwave oven.
3. Describe two differences between a compiler and an interpreter.
