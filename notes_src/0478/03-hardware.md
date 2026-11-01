---
subject: Computer Science 0478
chapter: 3
title: Hardware
paper: Paper 1
---

# 3 Hardware

## The CPU and the Von Neumann architecture
- **CPU**: processes instructions and data by carrying out the **fetch–decode–execute (FDE) cycle**.
- **Von Neumann architecture**: data and instructions are stored **together** in the same memory (the **stored program concept**).
- **Components**:
  - **ALU**: performs arithmetic and logic operations. It contains the **accumulator (ACC)**, which holds results.
  - **CU (control unit)**: decodes instructions and sends control signals to manage the FDE cycle.
  - **Registers**: **PC** (address of the next instruction), **MAR** (address to fetch from or write to), **MDR** (the data or instruction fetched), **CIR** (the current instruction), **ACC**.
  - **Buses**: the **address bus** carries addresses (one direction); the **data bus** carries data (both directions); the **control bus** carries signals (both directions).
- **FDE cycle (fetch stage)**: the address in the **PC** is copied to the **MAR**; the PC is **incremented**; the instruction is fetched from **memory** (RAM) along the data bus into the **MDR**; it is copied to the **CIR**. The CU then decodes it, and it is executed.
- **Performance**:
  - **Clock speed** (GHz): more cycles per second means more instructions per second.
  - **Number of cores**: more instructions can be processed at the same time.
  - **Cache size**: frequently used data is held close to the CPU, so access is faster than from RAM.
- **Instruction set**: the list of all the machine-code commands a CPU can process.
- **Embedded system**: a computer system with a **dedicated function** inside a larger device, e.g. a washing machine, microwave, car engine or traffic light. Small, cheap, low power; difficult to update.

## Input and output devices
- **Input**: barcode scanner, digital camera, keyboard, microphone, optical mouse, QR code scanner, touch screen (resistive, capacitive, infrared), 2D and 3D scanners, **sensors**.
- **Output**: actuator, DLP and LCD projectors, inkjet, laser and 3D printers, LED and LCD screens, speakers.
- **Sensors**: input devices that measure a physical property. Types include acoustic, accelerometer, flow, gas, humidity, infrared, level, light, magnetic field, moisture, pH, pressure, proximity and temperature.

## Data storage
- **Primary storage**: directly accessed by the CPU.
  - **RAM**: **volatile**; read and write; holds the data and programs **currently in use**.
  - **ROM**: **non-volatile**; read only; holds the **start-up instructions (bootstrap)**.
- **Secondary storage**: non-volatile, long-term storage.
  - **Magnetic (HDD)**: platters coated in magnetic material, with a read/write head. Areas are magnetised to represent 1 or 0. Cheap and high capacity, but has **moving parts**, so it can be damaged and is slower.
  - **Optical (CD, DVD, Blu-ray)**: a **laser** reads and writes **pits and lands** on a spiral track. Portable and cheap, but low capacity and easily scratched.
  - **Solid-state (SSD, flash memory)**: **transistors (NAND/NOR gates)** with control gates and floating gates trap electrons to store data. **No moving parts**, so it is fast, robust, quiet and low power; more expensive.
- **Virtual memory**: when RAM is full, part of **secondary storage** is used as temporary RAM. Pages of data are swapped between RAM and secondary storage. It lets more programs run, but it is **slower**.
- **Cloud storage**: data stored on **remote servers** accessed over the internet.
  - Benefits: access from anywhere; automatic backups; scalable; no local hardware.
  - Drawbacks: needs an internet connection; security and privacy risks; ongoing cost; you depend on the provider.

## Network hardware
- **NIC (network interface card)**: lets a device connect to a network. It is given a **MAC address** at manufacture.
- **MAC address**: a **unique** 48-bit address for each device, written in **hexadecimal**. The first half is the manufacturer ID and the second half is the device serial number. It is **static**.
- **IP address**: assigned to a device on a network so data can be routed to it.
  - **IPv4**: 32 bits, 4 denary numbers 0–255 (e.g. 192.168.0.1).
  - **IPv6**: 128 bits, 8 groups of hex digits; created because IPv4 addresses are running out.
  - **Static** (fixed) or **dynamic** (assigned each time the device connects).
- **Router**: sends data packets between networks; reads the destination IP address and forwards each packet to the correct device or network; can assign IP addresses.

## Exam tips and common mistakes
- In fetch-stage answers, mention **PC → MAR**, the PC incremented, **memory → MDR → CIR**, and the buses.
- RAM is volatile and holds what is **currently in use**. ROM holds the **start-up** instructions.
- In SSD answers, mention **transistors, control gates, floating gates** and that it has **no moving parts**.

## Quick self-check
1. Describe the role of the MAR in the fetch stage.
2. Give two reasons why an SSD is used in a smartphone rather than an HDD.
3. State two differences between a MAC address and an IP address.
