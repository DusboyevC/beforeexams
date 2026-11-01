---
subject: Computer Science 9618
chapter: 12
title: Software development
paper: Paper 2 (also Paper 4)
---

# 12 Software development

## What you must be able to do
- Describe the stages of the program development life cycle and compare waterfall, iterative and RAD models.
- Draw and use structure charts and state-transition diagrams.
- Explain the types of error, testing methods, test data and types of maintenance.

## 12.1 Program development life cycle (PDLC)
1. **Analysis**: understand the problem and gather requirements (interviews, questionnaires, observation, documents); produce a requirements specification.
2. **Design**: plan the solution: algorithms (pseudocode, flowcharts), structure charts, data structures, file and database design, interface design, and test plan.
3. **Coding**: write the program in a programming language and test modules as they are written.
4. **Testing**: check the program works and meets the requirements, using a test plan and test data.
5. **Maintenance**: change the program after it is in use: fix errors, adapt to new needs, improve performance.

### Development models
| Model | How it works | Benefits | Drawbacks |
|---|---|---|---|
| **Waterfall** | Each stage is completed and signed off before the next begins; going back is difficult | Simple and easy to manage; clear deadlines and documentation; suits projects with fixed, well-understood requirements | Inflexible to change; the client sees the working program only at the end; errors found late are costly |
| **Iterative** | The program is built in increments, each going through design, code and test; repeated and extended | A working version is available early; feedback guides the next iteration; risks are found earlier | Needs good planning; scope can creep; the overall design must be stable |
| **RAD (rapid application development)** | Quick prototypes built with heavy user involvement and refined repeatedly; reusable components; time-boxed | Very responsive to user feedback; fast delivery; the final product meets users' needs | Needs committed users and skilled developers; less suited to large, complex systems; less documentation |

## 12.2 Program design
- **Structure chart**: shows how a problem is decomposed into modules in a hierarchy, and the **parameters** passed between them.
  - Data parameter: an arrow with an open circle. Flag (Boolean) parameter: an arrow with a filled circle.
  - Selection is shown with a diamond, and iteration with a curved arrow.
- **State-transition diagram**: shows the **states** of a system, the **events** (inputs) that cause a change, and the resulting transitions.
  - States are circles, transitions are arrows labelled with the event (and output). The start state has an arrow coming from nowhere; the final state is a double circle.

## 12.3 Program testing and maintenance

### Types of error
- **Syntax error**: breaks the grammar rules of the language, e.g. a misspelled keyword or a missing bracket. The translator finds it, and the program will not run.
- **Logic error**: the program runs but gives the wrong result, because the algorithm is wrong, e.g. `<` instead of `<=`. Found by testing and dry runs.
- **Run-time error**: the program crashes while running, e.g. division by zero, an array index out of range, or a missing file.

### Testing methods
- **Dry run**: working through the algorithm by hand, recording variable values in a **trace table**.
- **Walkthrough**: the programmer explains the code step by step to colleagues, who look for errors.
- **White-box testing**: tests every path through the code, chosen using knowledge of the code's structure.
- **Black-box testing**: tests inputs against expected outputs **without** looking at the code.
- **Integration testing**: modules are combined and tested together to check they work with each other.
- **Stub testing**: a simple placeholder (stub) replaces a module that hasn't been written yet, so other modules can be tested.
- **Alpha testing**: done in-house by the developers or testers, before release.
- **Beta testing**: a near-final version is given to a group of real users outside the company, who report bugs and feedback.
- **Acceptance testing**: the client tests the finished system against the requirements to decide whether to accept it.

### Test data
| Type | Meaning | Example (valid range 1–100) |
|---|---|---|
| **Normal** | Valid data that should be accepted | 50 |
| **Abnormal / erroneous** | Invalid data that should be rejected | −5, "abc", 150 |
| **Extreme** | The largest and smallest acceptable values | 1, 100 |
| **Boundary** | Values either side of the limits: the largest or smallest acceptable value **and** the first value that should be rejected | 0, 1 and 100, 101 |

A **test plan** lists each test: purpose, test data, type of test data, expected result, actual result, and whether it passed.

### Types of maintenance
- **Corrective**: fixing errors found after the system is in use.
- **Adaptive**: changing the program to meet new requirements or a changed environment, e.g. a new OS, new laws or new hardware.
- **Perfective**: improving performance or usability without changing what it does, e.g. making it faster or easier to use.

## Exam tips and common mistakes
- Match the **model** to the scenario: fixed requirements suit waterfall; a client who is unsure suits RAD or iterative.
- When asked for test data, give the **value**, its **type** and the **expected result**.
- Boundary data must include the value just **outside** the range.
- Adaptive versus perfective: adaptive = **change in requirements or environment**; perfective = **improve** what already works.

## Quick self-check
1. Give two reasons a client who is unsure of their requirements would prefer RAD.
2. Identify the error type: an array index of 11 is used for an array declared as ARRAY[1:10].
3. Give boundary test data for an age that must be between 18 and 65.
4. Describe the difference between alpha and beta testing.
