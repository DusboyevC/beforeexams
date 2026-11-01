---
subject: Computer Science 9618
chapter: 5
title: System software
paper: Paper 1
---

# 5 System software

## What you must be able to do
- Explain why a computer needs an operating system and describe its key management tasks.
- Describe common utility programs and why they are needed.
- Explain program libraries, including DLLs, and their benefits and drawbacks.
- Explain why translators are needed, and compare assemblers, compilers and interpreters.
- Describe the features of an IDE that help with coding, presentation and debugging.

## 5.1 Operating systems

### Why an OS is needed
The operating system manages the hardware and provides a **platform** for application software to run on. It hides the complexity of the hardware and gives the user an interface.

### Key management tasks (name the task, then say what it does)
- **Memory management**: allocates memory to programs and processes, and frees it when done. Stops processes from accessing each other's memory (memory protection). Manages virtual memory and paging.
- **File management**: organises files in folders and directories; controls access rights; handles naming, saving, copying, moving and deleting; allocates storage space.
- **Security management**: user accounts, passwords and authentication; access rights; works with the firewall and anti-malware; recovers data after failure.
- **Hardware (peripheral) management**: communicates with devices through **device drivers**; manages input and output and buffers; handles interrupts.
- **Process management**: schedules processes so the CPU is shared fairly (multitasking); allocates resources; handles interrupts; deals with deadlock.
- **Providing a user interface**: a GUI or a command-line interface.

| GUI (graphical user interface) | CLI (command-line interface) |
|---|---|
| Windows, icons, menus and pointer, so it is intuitive for beginners | Commands are typed, so the user must learn the syntax |
| Uses more memory and processing power | Uses fewer resources |
| Slower for repetitive or advanced tasks | Fast for experts; tasks can be scripted and automated |

### Utility software
- **Disk formatter**: prepares a disk for use by setting up tracks, sectors and the file system. It can also check for bad sectors. Formatting erases existing data.
- **Virus checker / anti-malware**: scans files against known virus signatures and suspicious behaviour, then quarantines or deletes infected files. Must be updated regularly.
- **Defragmenter**: on a magnetic hard disk, moves file fragments so each file is stored in **contiguous** blocks and free space is grouped together. The read head moves less, so files load faster. (Not needed on SSDs.)
- **Disk repair / contents analysis**: checks the disk for errors and bad sectors and repairs them, or marks them so they are not used.
- **File compression**: reduces file size to save space and speed up transfer.
- **Back-up utility**: copies files to another medium, often on a schedule, as full or incremental backups, so data can be restored after loss.

### Program libraries
- **Program library**: a collection of pre-written, pre-compiled and tested routines (functions or procedures) that programmers can use in their own programs.
- Benefits: saves development time; the routines are already tested so they are reliable; complex code (e.g. maths or graphics) does not need writing from scratch.
- **DLL (dynamic link library)**: library code that is loaded and linked at **run time** rather than copied into the executable when it is compiled.
  - Benefits: the executable is smaller; several programs can share one copy in memory, which saves RAM; updating the DLL updates every program that uses it without recompiling.
  - Drawbacks: the program fails if the DLL is missing or the wrong version ("DLL hell"); an update that changes the DLL can break other programs; there is an extra dependency to manage.

## 5.2 Language translators

### Why translators are needed
The processor only executes **machine code** (binary). Programs written in assembly language or a high-level language must be translated into machine code before they can run.

- **Assembler**: translates assembly language into machine code (one-to-one).
- **Compiler**: translates the whole high-level program into machine code (object code or an executable) in one go, before it runs. It produces a list of all errors at the end.
- **Interpreter**: translates and executes the high-level program **one statement (line) at a time**. It stops at the first error.

| Compiler | Interpreter |
|---|---|
| Translates the whole program before running | Translates and runs line by line |
| Produces an executable file: no translator needed to run it, and the source code stays hidden | No executable: the interpreter and source code are needed every time |
| The compiled program runs fast | Runs more slowly because each line is translated every time |
| Errors are reported together after compilation | Stops at the first error, so it is easy to see where it is |
| Best for distributing the final program | Best during development and debugging |

**Partially compiled and interpreted (e.g. Java)**: source code is compiled into intermediate **bytecode**, which a **virtual machine** interprets on any platform. Benefit: the same bytecode runs on any computer that has the virtual machine (portable).

### Integrated Development Environment (IDE)
**Coding**
- **Context-sensitive prompts / auto-complete**: suggests keywords, variable names and parameters as you type.

**Initial error detection**
- **Dynamic syntax checks**: syntax errors are highlighted as you type, before translation.

**Presentation**
- **Prettyprint**: colour-codes keywords, strings and comments, and indents automatically, so code is easier to read.
- **Expand and collapse code blocks**: hides blocks such as functions so you can focus on one section.

**Debugging**
- **Single stepping**: runs the program one statement at a time, so you can see exactly what each line does.
- **Breakpoints**: pause execution at a chosen line so the program state can be inspected.
- **Report / watch window**: shows the current values of variables as the program runs.

## Exam tips and common mistakes
- For an OS task, give the **name** and **one specific action**, e.g. "memory management – allocates memory to each process and prevents processes overwriting each other".
- Defragmentation answers need: fragments joined into **contiguous** blocks → fewer head movements → faster access.
- Compiler versus interpreter questions often ask "why use **both**": an interpreter during development to find errors line by line, and a compiler at the end to produce a fast executable without giving away the source code.
- Match IDE features to their **heading** if the question asks for "a feature for debugging" etc.

## Quick self-check
1. Describe two benefits and one drawback of using a DLL.
2. Explain why a defragmenter improves performance on a hard disk but not on an SSD.
3. Give two reasons a programmer would distribute a compiled program rather than the source code.
4. Name two IDE debugging features and describe how each helps.
