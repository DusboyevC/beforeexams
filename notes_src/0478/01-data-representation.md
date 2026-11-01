---
subject: Computer Science 0478
chapter: 1
title: Data representation
paper: Paper 1
---

# 1 Data representation

## Number systems
- Computers use **binary** (base 2) because they are built from **switches (transistors)** that have two states, on and off (1 and 0). All data must be converted to binary to be processed.
- **Denary**: base 10. **Hexadecimal**: base 16 (0–9, A–F).
- Place values (8-bit): 128, 64, 32, 16, 8, 4, 2, 1.

**Conversions**
- Binary → denary: add the place values where there is a 1. `0110 1001` = 64 + 32 + 8 + 1 = **105**.
- Denary → binary: subtract the largest place value that fits, write 1, and repeat.
- Binary ↔ hex: split into groups of 4 bits (nibbles). `1010 1111` = **AF**.
- Hex → denary: multiply by 16s. `3C` = 3 × 16 + 12 = **60**.

**Why hexadecimal is used**: it is **shorter** and **easier for humans to read** than binary, so there are fewer mistakes, and it converts easily (1 hex digit = 4 bits).
- Uses: **MAC addresses**, **HTML colour codes**, **error codes**, IPv6 addresses, memory dumps and assembly language.

## Binary addition and overflow
- 0 + 0 = 0; 0 + 1 = 1; 1 + 1 = 0 carry 1; 1 + 1 + 1 = 1 carry 1.
- **Overflow error**: the result needs **more than 8 bits**, so it is too large for the register, e.g. 200 + 100 = 300 > 255.

## Logical shifts
- **Left shift** by n places: each bit moves left and 0s fill the gaps on the right. This **multiplies by 2ⁿ**. Bits shifted off the left end are **lost**, which makes the result wrong.
- **Right shift** by n places: **divides by 2ⁿ**. Bits lost on the right make it inaccurate (the remainder is lost).

## Two's complement (8-bit)
- The leftmost bit has the value **−128**. Range: −128 to +127.
- To store −35: write +35 as `0010 0011`, flip the bits (`1101 1100`), add 1 → **`1101 1101`**.

## Text, sound and images
- **Character set**: all the characters a computer can use, each with a unique binary code.
  - **ASCII**: 7 bits (128 characters), or 8-bit extended (256). English characters only.
  - **Unicode**: up to 32 bits per character, so it covers **every language and emojis**. It needs **more storage per character** than ASCII.
- **Sound**: the sound wave is **sampled** at regular intervals, and each sample's **amplitude** is stored in binary.
  - **Sample rate**: the number of samples per second (Hz).
  - **Sample resolution**: the number of bits per sample.
  - Increasing either makes the recording **more accurate** (closer to the original), but the **file is larger**.
- **Images**: a bitmap is made of **pixels**.
  - **Resolution**: the number of pixels (width × height).
  - **Colour depth**: the number of bits per pixel (n bits give 2ⁿ colours).
  - Increasing either gives **better quality** but a **larger file**.

## Data storage and file size
- bit → nibble (4 bits) → byte (8 bits) → **KiB (1024 bytes)** → MiB → GiB → TiB → PiB → EiB.
- **Image file size** = resolution × colour depth (bits). Divide by 8 for bytes and by 1024 for KiB.
- **Sound file size** = sample rate × sample resolution × length in seconds (bits).
- Worked example: 1024 × 512 image, 16-bit colour → 1024 × 512 × 16 = 8 388 608 bits = 1 048 576 bytes = **1 MiB**.

## Compression
- **Why compress?** It uses less storage space, makes files quicker to send and upload or download, uses less bandwidth, and keeps files under email attachment limits.
- **Lossy**: **permanently removes** data, so the original can't be restored. It gives a much smaller file.
  - Methods: reduce the resolution or colour depth; reduce the sample rate or resolution; **perceptual music shaping** (remove sounds humans can't hear well).
  - Used for JPEG images and MP3/MP4 files.
- **Lossless**: no data is lost; the original can be reconstructed **exactly**. Used for text and program files.
  - Method: **run-length encoding (RLE)**, which stores runs of repeated data as one value and a count, e.g. `WWWWBBB` becomes `4W3B`.

## Exam tips and common mistakes
- Show your working in conversions and file-size calculations.
- When asked "why binary?", answer "computers are made of switches/transistors with two states", not "it's easier".
- For hex uses, give a **specific** example, such as MAC addresses or HTML colour codes.

## Quick self-check
1. Convert 1011 0110 into hexadecimal. *(B6)*
2. What is the effect of a logical left shift of 2 places on 0001 0110? *(0101 1000: the value is multiplied by 4, from 22 to 88)*
3. Give one benefit and one drawback of Unicode compared with ASCII.
