---
subject: Computer Science 9618
chapter: 4
title: Processor fundamentals
paper: Paper 1
---

# 4 Processor fundamentals

## What you must be able to do
- Describe the Von Neumann model and the stored program concept.
- State the role of every register and bus, and of the ALU, CU, system clock and IAS.
- Explain the factors that affect performance.
- Describe the fetch–execute cycle, including in register transfer notation, and how interrupts are handled.
- Trace and write assembly language programs using the given instruction set and addressing modes.
- Explain how a two-pass assembler works.
- Use logical, arithmetic and cyclic shifts, and bit masking.

## 4.1 Central processing unit (CPU) architecture

### Von Neumann model and the stored program concept
- **Stored program concept**: program instructions and data are stored together in the same main memory. Instructions are fetched one at a time and executed in sequence.
- The CPU has a single control unit and uses the same buses for instructions and data.

### Components
- **ALU (arithmetic logic unit)**: carries out arithmetic (+, −) and logic (AND, OR, comparisons) operations.
- **CU (control unit)**: decodes instructions and sends control signals to co-ordinate the other components, using the clock.
- **System clock**: produces timing signals that synchronise the components.
- **IAS (immediate access store)**: main memory (RAM) that holds the programs and data in use.

### Registers
| Register | Role |
|---|---|
| **PC** (program counter) | Holds the address of the **next** instruction to be fetched |
| **MAR** (memory address register) | Holds the address of the memory location to be read from or written to |
| **MDR** (memory data register) | Holds the data or instruction just read from memory, or about to be written to memory |
| **CIR** (current instruction register) | Holds the instruction currently being decoded and executed |
| **ACC** (accumulator) | General purpose register that holds values being processed and the results of the ALU |
| **IX** (index register) | Holds a value added to an address in indexed addressing |
| **Status register** | Holds flags (carry, overflow, negative, zero) set by the result of an operation |

### Buses
- **Address bus**: carries addresses from the CPU to memory or I/O. It is **one-directional**. Its width decides how many locations can be addressed: n lines give 2ⁿ addresses.
- **Data bus**: carries data and instructions between the CPU, memory and I/O. It is **two-directional**. Its width is how many bits move at once.
- **Control bus**: carries control and timing signals, e.g. read, write, clock and interrupt request. It is two-directional.

### Factors affecting performance
- **Clock speed**: more cycles per second means more instructions per second (but more heat).
- **Number of cores**: more instructions can be processed at the same time, if the software can use them.
- **Cache size**: more frequently used data and instructions are held close to the CPU, so fewer slower accesses to RAM are needed.
- **Bus width**: a wider data bus moves more bits per transfer, and a wider address bus can address more memory.

### Ports
- **USB**: a universal standard for many peripherals; supplies power; devices are detected automatically (plug and play).
- **HDMI**: carries high-definition video and audio digitally in one cable.
- **VGA**: carries analogue video only (older standard).

### Fetch–execute cycle
**Fetch**
1. The address in the PC is copied to the MAR.
2. The PC is incremented so it points to the next instruction.
3. The instruction at the address in the MAR is copied to the MDR (along the data bus).
4. The contents of the MDR are copied to the CIR.

**Decode**: the CU decodes the instruction in the CIR into opcode and operand.

**Execute**: the instruction is carried out, which may involve the ALU, ACC and more memory reads or writes.

**Register transfer notation**
```
MAR ← [PC]
PC ← [PC] + 1
MDR ← [[MAR]]
CIR ← [MDR]
```
Square brackets mean "the contents of". [[MAR]] means "the contents of the location whose address is in MAR".

### Interrupts
- **Interrupt**: a signal sent to the processor to request attention, e.g. hardware failure, I/O finished, a key pressed, a timer, or a software error such as division by zero.
- How it is handled:
  1. At the end of each fetch–execute cycle the processor checks for interrupts.
  2. If there is one of higher priority than the current task, the contents of the registers (including the PC) are saved on a stack.
  3. The **interrupt service routine (ISR)** for that interrupt is loaded and run.
  4. When the ISR finishes, the saved register values are restored and the original task carries on.

## 4.2 Assembly language

### Key terms
- **Machine code**: binary instructions the processor executes directly.
- **Assembly language**: a low-level language that uses mnemonics (e.g. LDD, ADD); each statement matches one machine-code instruction.
- **Opcode**: the part of the instruction that says what operation to do. **Operand**: the data or address the operation uses.

### Addressing modes
| Mode | Meaning | Example (what is loaded) |
|---|---|---|
| **Immediate** | The operand is the actual value | `LDM #5` loads the number 5 |
| **Direct** | The operand is the address holding the value | `LDD 200` loads the contents of address 200 |
| **Indirect** | The operand is an address holding *another address* where the value is | `LDI 200`: if address 200 holds 350, it loads the contents of 350 |
| **Indexed** | Address = operand + contents of IX | `LDX 200` with IX = 3 loads the contents of 203 |
| **Relative** | Address = current address + offset | Used for jumps within a program |

### Typical instructions (always use the instruction table given in the paper)
`LDM #n`, `LDD addr`, `LDI addr`, `LDX addr`, `LDR #n` (load the IX), `MOV` (copy ACC to IX), `STO addr`, `ADD`, `SUB`, `INC`, `DEC`, `JMP`, `CMP`, `CMI`, `JPE`, `JPN`, `IN`, `OUT`, `END`, and the bitwise `AND`, `OR`, `XOR`, `LSL`, `LSR`.

### Trace table method
1. One column per register or memory location, plus OUTPUT.
2. Go through one instruction at a time and write only the values that **change**.
3. Follow jumps carefully. CMP sets a flag; JPE and JPN jump based on that flag.
4. Stop at END.

### Two-pass assembler
- **First pass**: reads the whole program; removes comments and white space; adds **labels and symbolic addresses to the symbol table**; works out the address of each instruction; spots forward references (labels used before they are defined); acts on directives.
- **Second pass**: uses the symbol table to **replace every symbolic address and label with an actual address**; translates each mnemonic into a machine-code opcode; produces the object code.
- Two passes are needed because of **forward references**: a jump to a label that appears later can only be resolved once the label's address is known.

## 4.3 Bit manipulation
- **Logical shift**: bits move left or right and the vacated places are filled with **0**. Left by 1 multiplies an unsigned number by 2; right by 1 divides by 2 (the bit shifted off is lost).
- **Arithmetic shift**: like a logical shift, but on a right shift the **sign bit is kept** (copied in), so signed numbers keep their sign.
- **Cyclic (rotate) shift**: the bit shifted off one end goes back in at the other end, so no bits are lost.
- **Masking**:
  - **AND** with a mask: 0 in the mask **clears** that bit; 1 keeps it. Used to test whether a bit is set.
  - **OR** with a mask: 1 in the mask **sets** that bit.
  - **XOR** with a mask: 1 in the mask **toggles** that bit.
- **Uses**: device control registers and status flags, where each bit means something, e.g. checking whether bit 3 of a status register is 1.

## Exam tips and common mistakes
- In the fetch stage, say the PC is **incremented** and state *what is copied where*. Vague answers like "the instruction is fetched" score nothing.
- Know the difference between MAR (an **address**) and MDR (**data or an instruction**).
- In assembly traces, read the addressing mode on **every** load. LDM #200 and LDD 200 do completely different things.
- In two-pass answers, link the symbol table to the first pass and replacing addresses to the second pass.

## Quick self-check
1. Explain why the PC is incremented during the fetch stage.
2. Address 300 contains 450 and address 450 contains 12. What does `LDI 300` load into the ACC? *(12)*
3. Write a mask and operation that sets bit 0 of a byte without changing the other bits. *(OR with 00000001)*
4. Explain why a forward reference makes a second pass necessary.
