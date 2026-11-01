---
subject: Computer Science 9618
chapter: 15
title: Hardware and virtual machines
paper: Paper 3 (logic also Paper 4)
---

# 15 Hardware and virtual machines

## What you must be able to do
- Compare RISC and CISC processors, and explain pipelining and how interrupts are handled in a pipelined processor.
- Describe the four basic computer architectures (Flynn's classification) and massively parallel computers.
- Explain virtual machines, with their benefits and limitations.
- Draw and analyse half adders, full adders and SR/JK flip-flops.
- Simplify logic using Boolean algebra (including De Morgan's laws) and Karnaugh maps.

## 15.1 Processors, parallel processing and virtual machines

### RISC versus CISC
| RISC (reduced instruction set computer) | CISC (complex instruction set computer) |
|---|---|
| Small set of simple instructions | Large set of complex instructions |
| Each instruction takes **one clock cycle** | Instructions may take several cycles |
| Fixed-length instructions, few addressing modes | Variable-length instructions, many addressing modes |
| Many general-purpose registers | Fewer registers |
| Easy to **pipeline** | Harder to pipeline |
| More work for the compiler, and programs need more instructions (more RAM) | One instruction can do a lot, so programs are shorter and the compiler is simpler |
| Hard-wired control unit | Usually a microprogrammed control unit |

### Pipelining
- **Pipelining**: the stages of several instructions (e.g. fetch, decode, execute, memory access, write back) overlap, so a new instruction starts each clock cycle before the previous one has finished.
- With a 5-stage pipeline, once it is full, one instruction completes **every** cycle, which increases throughput.
- **Problems**: a branch or jump means the instructions already in the pipeline must be flushed; data dependencies cause stalls.
- **Interrupts in a pipeline**: either let the instructions already in the pipeline finish, or flush them, then save the state (registers and PC) and run the ISR. The processor must record exactly which instruction to restart from.

### Flynn's classification
| Architecture | Meaning | Example |
|---|---|---|
| **SISD** | Single instruction, single data | A traditional single-core computer |
| **SIMD** | Single instruction, multiple data: the same operation on many data items at once | Graphics processors (GPUs), array processors |
| **MISD** | Multiple instruction, single data | Rare; fault-tolerant systems such as aircraft flight control |
| **MIMD** | Multiple instruction, multiple data: each processor runs its own instructions on its own data | Multicore processors, clusters |

- **Massively parallel computer**: a very large number of processors (thousands or more) working on different parts of one problem at the same time, connected by a high-speed network, e.g. supercomputers for weather forecasting.
  - The software must be written to split the task into parts that can run in parallel; communication between processors is an overhead.

### Virtual machines
- **Virtual machine (VM)**: software that emulates a complete computer system, so one physical machine (the **host**) can run one or more **guest** operating systems.
- Benefits:
  - Run several OSs on one machine, e.g. to test software on each.
  - Run old software that needs an older OS.
  - The guest is isolated, so a crash or malware in it does not affect the host.
  - Easy to back up, copy or restore (snapshots).
- Limitations:
  - **Slower** than running on real hardware, because of the emulation overhead.
  - Some hardware may not be supported, and the host needs enough RAM and CPU power.
  - Building a VM is complex.
- Example: the **Java Virtual Machine** runs bytecode on any platform.

## 15.2 Boolean algebra and logic circuits

### Adders
- **Half adder**: adds two bits A and B. **Sum = A XOR B**, **Carry = A AND B**.
- **Full adder**: adds two bits **plus a carry-in**. It is made from two half adders and an OR gate.
  - Sum = A XOR B XOR Cin
  - Carry-out = (A AND B) OR (Cin AND (A XOR B))
- Full adders are chained to add multi-bit numbers.

### Flip-flops (one-bit memory)
**SR flip-flop** (made from two NOR or two NAND gates)
| S | R | Q (next) |
|---|---|---|
| 0 | 0 | No change (stores the previous value) |
| 1 | 0 | Set: Q = 1 |
| 0 | 1 | Reset: Q = 0 |
| 1 | 1 | **Invalid**: both outputs become the same |

**JK flip-flop**: clocked, and fixes the invalid state.
| J | K | Q (next) |
|---|---|---|
| 0 | 0 | No change |
| 1 | 0 | Set (1) |
| 0 | 1 | Reset (0) |
| 1 | 1 | **Toggle**: Q becomes NOT Q |

- The clock makes changes happen only at the clock pulse, so it is synchronised. Use: registers, memory, counters.

### Boolean algebra laws
| Law | AND form | OR form |
|---|---|---|
| Identity | A.1 = A | A + 0 = A |
| Null | A.0 = 0 | A + 1 = 1 |
| Idempotent | A.A = A | A + A = A |
| Inverse | A.Ā = 0 | A + Ā = 1 |
| Absorption | A.(A + B) = A | A + A.B = A |
| Double complement | NOT(NOT A) = A | |
| **De Morgan** | NOT(A.B) = Ā + B̄ | NOT(A + B) = Ā.B̄ |

(A.B means A AND B; A + B means A OR B.)

**Sum of products**: from a truth table, take each row where the output is 1, write the AND term for it (with NOT for inputs that are 0), then OR all the terms together.

### Karnaugh maps (K-maps)
1. Draw the grid using **Gray code** order (00, 01, 11, 10) so neighbouring cells differ by one bit.
2. Put the 1s from the truth table into the cells.
3. Group the 1s in rectangles of 1, 2, 4, 8 or 16 cells. Make groups **as large as possible** and use as **few** groups as possible. Groups may overlap and **wrap around** the edges.
4. For each group, keep only the variables that **do not change** within it.
5. OR the group terms together to get the simplified expression.

## Exam tips and common mistakes
- RISC answers should mention **single-cycle instructions** and pipelining.
- For VMs, always give a limitation: performance is **lower**.
- In flip-flop questions, state what happens for S = R = 1 (SR is invalid) and J = K = 1 (JK toggles).
- K-map mistakes: grids not in Gray code order, groups that aren't powers of two, and missed wrap-around groups.

## Quick self-check
1. Explain how pipelining increases processor performance.
2. Write the Boolean expressions for the sum and carry of a half adder.
3. Simplify A.B + A.B̄. *(A)*
4. Give one benefit and one limitation of a virtual machine.
