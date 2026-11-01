---
subject: Computer Science 9618
chapter: 3
title: Hardware
paper: Paper 1
---

# 3 Hardware

## What you must be able to do
- Describe input, output and storage devices, and explain how the main ones work.
- Explain the roles of RAM, ROM and buffers, and compare SRAM with DRAM, and PROM, EPROM and EEPROM.
- Describe embedded systems.
- Explain how sensors and actuators are used in monitoring and control systems.
- Use logic gates: draw circuits, complete truth tables and write logic expressions.

## 3.1 Computers and their components

### Key terms
- **Input device**: lets data enter the computer, e.g. keyboard, mouse, microphone, scanner, sensor, touchscreen.
- **Output device**: presents processed data, e.g. monitor, printer, speaker, actuator, 3D printer.
- **Primary storage**: memory the CPU can access directly (RAM, ROM, cache).
- **Secondary storage**: non-volatile storage that keeps data and programs long term (HDD, SSD, optical).
- **Volatile**: data is lost when the power is switched off.

### How devices work (the descriptions examiners reward)
**Laser printer**
1. The drum is given a (negative) electrical charge.
2. A laser beam removes the charge from areas of the drum to form the image.
3. Toner (charged powder) sticks to the charged areas of the drum.
4. Paper is given a charge and passes the drum, and the toner is transferred to it.
5. A **fuser** heats and presses the paper to melt the toner onto it.
6. The charge is removed from the drum and any leftover toner is cleaned off.

**3D printer**: builds a solid object **layer by layer** from a digital design (CAD). Methods include extruding melted plastic through a nozzle, or using a laser or UV light to harden resin.

**Microphone**: sound waves vibrate a diaphragm, which moves a coil in a magnetic field and produces an analogue electrical signal. An ADC converts it to digital.

**Speaker**: a digital signal goes through a DAC to an analogue current. The current flows through a coil in a magnetic field, the coil moves a cone, and the cone produces sound waves.

**Magnetic hard disk**: platters with a magnetic coating spin at high speed. A read/write head on an actuator arm moves over the tracks and sectors. Data is stored by magnetising areas in one of two directions to represent 1 and 0.

**Solid state (flash) memory**: has no moving parts. It uses NAND/NOR transistors with a **floating gate** and control gate. Electrons trapped in the floating gate represent the stored bits. Data is written in blocks.

**Optical disc (CD/DVD/Blu-ray)**: a laser reads the spiral track. **Pits and lands** reflect light differently, and the changes are read as binary. To write, a laser changes the dye or surface. Blu-ray uses a shorter-wavelength blue laser, so the track can be narrower and more data fits.

**Touchscreens**
- *Resistive*: two flexible layers separated by a gap. Pressing makes them touch and completes a circuit, and the coordinates are calculated. Works with gloves or a stylus. Cheaper, less clear, and wears out.
- *Capacitive*: a glass layer holds an electrostatic field. A finger, which conducts, changes the capacitance, and sensors at the corners calculate where. Supports multi-touch and gives a clearer image. Does not work with ordinary gloves.

**Virtual reality headset**: two screens (one per eye) show slightly different images to give 3D depth. Sensors such as gyroscopes and accelerometers track head movement, so the view changes as you move. Lenses focus the image, and headphones give 3D sound.

### Memory
| RAM | ROM |
|---|---|
| Volatile | Non-volatile |
| Read and write | Read only (in normal use) |
| Holds the data and programs currently in use | Holds the start-up instructions (bootstrap / BIOS) |

**SRAM vs DRAM**
| SRAM (static) | DRAM (dynamic) |
|---|---|
| Uses flip-flops; no refresh needed | Uses capacitors that must be **refreshed** constantly |
| Faster access | Slower |
| More expensive per bit and lower density | Cheaper and higher capacity |
| Used for **cache** | Used for **main memory** |

**ROM types**
- **PROM**: programmed once after manufacture and cannot be changed.
- **EPROM**: can be erased with **ultraviolet** light (the chip is removed) and reprogrammed.
- **EEPROM**: can be erased and rewritten **electrically** while in the circuit (flash memory is a type of EEPROM).

**Buffer**: a temporary area of memory that holds data being transferred between devices working at different speeds, e.g. a printer buffer or a video streaming buffer.

### Embedded systems
- **Embedded system**: a computer system built into a larger device to perform one dedicated function, e.g. in a washing machine, microwave, car engine management or traffic light.
- Characteristics: a microprocessor with a dedicated task; programs held in ROM or firmware; often no conventional input or output; usually real-time.
- Benefits: small and cheap to mass-produce; low power; reliable; fast for their task.
- Drawbacks: difficult or impossible to upgrade; fixing faults may mean replacing the unit; limited to one function.

## 3.2 Monitoring and control systems
- **Sensor**: an input device that measures a physical property (temperature, light, pressure, moisture, pH, infrared, motion, humidity, gas).
- **Actuator**: an output device that causes physical movement or a change, e.g. a motor, valve, pump, heater or light.
- An **ADC** converts the analogue sensor reading to digital, and a **DAC** converts digital to analogue to drive an analogue actuator.
- **Monitoring system**: measures and reports, e.g. records readings and gives a warning. It does **not** change the conditions.
- **Control system**: measures **and** changes the conditions. Example of the feedback loop (greenhouse temperature):
  1. The sensor continuously measures the temperature and sends the data to the microprocessor (via an ADC).
  2. The microprocessor compares the reading with the stored preset value or range.
  3. If the temperature is too low, it sends a signal to the actuator to switch the heater on; if too high, to open a window or turn on a fan.
  4. The process repeats continuously. This is **feedback**: the output affects the next input.

## 3.3 Logic gates and logic circuits

| Gate | Expression | Output is 1 when… |
|---|---|---|
| NOT | X = NOT A | A is 0 |
| AND | X = A AND B | both inputs are 1 |
| OR | X = A OR B | at least one input is 1 |
| NAND | X = NOT (A AND B) | not both inputs are 1 |
| NOR | X = NOT (A OR B) | both inputs are 0 |
| XOR | X = A XOR B | the inputs are different |

### Method for circuit and truth-table questions
1. With *n* inputs there are 2ⁿ rows. List them in binary order: 000, 001, 010 …
2. Add a working column for each intermediate gate output and fill those in first.
3. Work towards the final output X.

### From a problem statement
Turn each condition into a sub-expression, then join them with AND or OR. For example, "the alarm sounds if the door is open AND (it is night OR the system is armed)" gives X = D AND (N OR S).

**Exam rules**: use the gate symbols as given; do not simplify unless asked; label inputs and output; and when a question says "each gate has a maximum of two inputs", follow it.

## Exam tips and common mistakes
- In device questions, describe **how it works step by step** in order; one vague sentence earns little.
- SRAM is for **cache** and DRAM is for **main memory**. Don't swap them.
- Monitoring versus control: control involves an **actuator** and **feedback**.
- In truth tables, a working column catches mistakes and can still earn marks.

## Quick self-check
1. Explain why DRAM must be refreshed.
2. Give two differences between EPROM and EEPROM.
3. Describe how a capacitive touchscreen detects a touch.
4. Write the logic expression for: output is 1 if A and B are both 1, or C is 0. *(X = (A AND B) OR NOT C)*
