---
subject: Computer Science 9618
chapter: 13
title: Data representation (A Level)
paper: Paper 3 (also Paper 4)
---

# 13 Data representation

## What you must be able to do
- Define and use user-defined data types: non-composite (enumerated, pointer) and composite (record, set, class).
- Describe serial, sequential and random file organisation, and the methods of access.
- Explain hashing and collision handling.
- Convert to and from normalised binary floating-point, and explain precision, range and rounding errors.

## 13.1 User-defined data types
- **User-defined data type**: a data type created by the programmer, built from existing types, to model the problem better.
- **Non-composite**: defined without referring to other types.
  - **Enumerated**: a list of all possible values, in order.
    `TYPE Season = (Spring, Summer, Autumn, Winter)`
  - **Pointer**: holds the memory address of a variable of a given type.
    `TYPE TIntPointer = ^INTEGER`  `DECLARE P : TIntPointer`  `P ← @Value`  `OUTPUT P^` (dereference)
- **Composite**: defined using other data types.
  - **Record**: fields of different types (see chapter 10).
  - **Set**: an unordered collection of unique values of one type, which supports union, intersection and membership tests.
  - **Class**: data (attributes) plus methods (see chapter 20).
- **Why use them?** The code models real data more closely, is easier to read, and lets the translator catch invalid values.

## 13.2 File organisation and access
| Organisation | How records are stored | Access |
|---|---|---|
| **Serial** | In the order they were added (chronological) | Sequential access only: read from the start until found. New records are appended. Good for transaction logs |
| **Sequential** | In order of a **key field** | Sequential access: read in order. Can stop early once the key has been passed. Good for batch processing, e.g. payroll |
| **Random (direct access)** | At an address calculated from the key by a **hashing algorithm** | **Direct** access: go straight to the record. Good when single records are needed quickly, e.g. booking systems |

- **Hashing algorithm**: a calculation on the key that gives the address where the record is stored, e.g. `address = key MOD number_of_locations`.
- **Collision**: two different keys give the same address. It can be handled by:
  - **Open hashing (linear probing)**: store the record in the next free location, and search forward from the hashed address when reading.
  - **Closed hashing (overflow area)**: put the record in a separate overflow area, searched serially, or in a linked list (chaining) from that address.

## 13.3 Floating-point numbers
- A real number is stored as a **mantissa** and an **exponent**, both in two's complement: value = M × 2ᴱ.
- **Normalised**: the first two bits of the mantissa are **different**: `0.1…` for positive and `1.0…` for negative.
  - Normalisation gives the **maximum precision** for the bits available, and a **unique** representation of each number.

### Converting floating-point to denary (8-bit mantissa, 4-bit exponent)
Mantissa `0.1011000`, exponent `0011` (= +3).
Move the binary point 3 places right: 0101.1000 = 4 + 1 + 0.5 = **5.5**

Negative example: mantissa `1.0100000` (= −1 + 0.25 = −0.75), exponent `0010` (+2) → move the point 2 places: `101.00000` → −4 + 1 = **−3** (check: −0.75 × 2² = −3)

### Converting denary to normalised floating point
Example: 6.75.
1. In binary: 110.11
2. Normalise so the point follows the first 1 (for a positive number, written as 0.1…): 0.11011 × 2³
3. Mantissa = `0.1101100`, exponent = 3 = `0011`

For a negative number, find the positive binary first, then take the two's complement of the mantissa, and normalise to start `1.0`.

### Range versus precision
- **More bits in the mantissa** → greater **precision** (accuracy).
- **More bits in the exponent** → greater **range** of numbers.
- With a fixed total, increasing one reduces the other.

### Errors
- **Rounding / truncation error**: many denary fractions (e.g. 0.1) cannot be represented exactly in binary, so the stored value is approximate.
- **Overflow**: the number is too large for the exponent.
- **Underflow**: the number is too close to zero to be represented, so it becomes 0.
- **Consequence**: comparisons such as `IF x = 0.3` can fail; small errors grow over repeated calculations.

## Exam tips and common mistakes
- A normalised mantissa starts `01` (positive) or `10` (negative). Check this first.
- Show your working: binary form, then the exponent, then the shift.
- In hashing questions, show the calculation and follow the stated collision method exactly.
- The precision versus range trade-off is a reliable 2-mark question; link each to mantissa or exponent.

## Quick self-check
1. Mantissa 0.1100000, exponent 0100. What is the denary value? *(12)*
2. Explain why normalisation increases precision.
3. Explain why random access is better than sequential access for an airline seat-booking system.
4. Define a collision and describe one way to handle it.
