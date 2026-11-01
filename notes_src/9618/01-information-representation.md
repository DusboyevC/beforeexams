---
subject: Computer Science 9618
chapter: 1
title: Information representation
paper: Paper 1
---

# 1 Information representation

## What you must be able to do
- Convert between binary, denary, hexadecimal and BCD, and use two's complement for negative numbers.
- Add and subtract binary integers and spot overflow.
- Use the binary prefixes (kibi, mebi …) and the decimal prefixes (kilo, mega …) correctly.
- Explain ASCII, extended ASCII and Unicode.
- Calculate bitmap image and sound file sizes, and explain what changing each setting does.
- Compare bitmap and vector graphics.
- Explain lossy and lossless compression, including run-length encoding (RLE).

## 1.1 Number systems

### Key terms (learn these word for word)
- **Bit**: a binary digit, 0 or 1.
- **Nibble**: 4 bits. **Byte**: 8 bits.
- **Denary**: base 10. **Binary**: base 2. **Hexadecimal**: base 16 (digits 0–9 and A–F).
- **Binary Coded Decimal (BCD)**: each denary digit is stored separately as its own 4-bit binary number.
- **Two's complement**: a way of storing signed integers in which the most significant bit has a negative place value.
- **Overflow**: the result of a calculation is too large to be stored in the number of bits available.

### Binary and decimal prefixes
| Binary prefix | Value | Decimal prefix | Value |
|---|---|---|---|
| kibi (Ki) | 2¹⁰ = 1024 | kilo (k) | 10³ = 1000 |
| mebi (Mi) | 2²⁰ | mega (M) | 10⁶ |
| gibi (Gi) | 2³⁰ | giga (G) | 10⁹ |
| tebi (Ti) | 2⁴⁰ | tera (T) | 10¹² |

Exam trap: 1 KiB = 1024 bytes, but 1 kB = 1000 bytes. Read which one the question uses.

### Conversions
**Binary → denary**: add the place values that have a 1.
`1011 0110` → 128 + 32 + 16 + 4 + 2 = **182**

**Denary → binary**: subtract the largest place value that fits, write 1, and repeat. Or divide by 2 repeatedly and read the remainders from the bottom up.

**Binary ↔ hex**: split the binary into nibbles from the right. Each nibble is one hex digit.
`1011 0110` → B (11) and 6 → **B6**

**Hex → denary**: multiply each digit by its place value (16², 16¹, 16⁰).
`3A9` → 3×256 + 10×16 + 9 = **937**

### Two's complement (8-bit)
Place values: **−128**, 64, 32, 16, 8, 4, 2, 1. Range: −128 to +127.

To store a negative number such as −45:
1. Write +45 in binary: `0010 1101`
2. Flip every bit: `1101 0010`
3. Add 1: **`1101 0011`**

To read a two's complement number, add the place values with −128 for the first bit:
`1011 0111` → −128 + 32 + 16 + 4 + 2 + 1 = **−73**

A positive number always starts with 0 and a negative number always starts with 1.

### Binary addition and subtraction
- Rules: 0+0=0, 0+1=1, 1+1=0 carry 1, 1+1+1=1 carry 1.
- **Subtraction**: add the two's complement of the number being subtracted. A − B = A + (−B).
- **Overflow** happens when a carry goes out of the most significant bit (unsigned), or when two positives give a negative answer, or two negatives give a positive answer (two's complement).

Worked example (8-bit two's complement): 0110 0100 (100) + 0100 0110 (70) = 1010 1010. The sign bit is now 1, so the answer reads as −86 instead of 170. **Overflow has occurred**, because 170 is bigger than the maximum of +127.

### BCD
- Each denary digit gets its own nibble: 59 → `0101 1001`.
- Patterns 1010 to 1111 are invalid in BCD.
- **Uses**: digital clocks and calculators, and financial data, because each digit can be displayed directly and there are no rounding errors with decimal fractions.

### Why programmers use hexadecimal
- It is shorter and easier to read than binary, and there are fewer errors when copying it.
- It converts to and from binary easily, because one hex digit equals 4 bits.
- **Uses**: MAC addresses, HTML/CSS colour codes, memory dumps and error codes, assembly language and machine-code listings, and URL encoding.

### Character sets
- **Character set**: the list of characters a computer can represent, with the unique binary code for each one.
- **ASCII**: 7 bits, 128 characters (English letters, digits, punctuation and control characters). Codes run in sequence: 'A' = 65, 'a' = 97, '0' = 48.
- **Extended ASCII**: 8 bits, 256 characters. It adds accented letters and symbols.
- **Unicode**: uses up to 4 bytes per character, so it can represent characters from every language and emojis. The first 128 codes are the same as ASCII.
- **Trade-off**: Unicode needs more bits per character, so text files are larger than in ASCII.

## 1.2 Multimedia

### Bitmap images
- **Pixel**: the smallest addressable element of a picture.
- **Image resolution**: the number of pixels in the image (width × height).
- **Screen resolution**: the number of pixels the screen can display (width × height).
- **Colour depth / bit depth**: the number of bits used to store the colour of each pixel. n bits give 2ⁿ colours.
- **File header**: data stored at the start of the file about the image, such as width, height, colour depth and file type.

**File size (bits) = width × height × colour depth.** Divide by 8 for bytes, then by 1024 for KiB.

Worked example: 1024 × 768 pixels with 24-bit colour.
1024 × 768 × 24 = 18 874 368 bits ÷ 8 = 2 359 296 bytes ÷ 1024 = 2304 KiB ÷ 1024 = **2.25 MiB**

| Change | Effect |
|---|---|
| Higher resolution | More detail and a sharper image; larger file. |
| Greater colour depth | More colours and more realistic shades; larger file. |

### Vector graphics
- **Drawing object**: a shape, such as a line, circle or rectangle, defined by mathematical formulae.
- **Property**: data about an object, e.g. coordinates, line colour, line thickness and fill colour.
- **Drawing list**: the set of commands that define every object in the image.

| Bitmap | Vector |
|---|---|
| Stored as a grid of pixels | Stored as objects and their properties |
| Goes pixelated when enlarged | Can be scaled with no loss of quality |
| Best for photographs and complex colour | Best for logos, diagrams and line art |
| File size depends on resolution and colour depth | File size depends on the number of objects |

### Sound
- Sound is analogue. It is **sampled** at regular intervals: the amplitude is measured and stored as a binary number by an ADC.
- **Sampling rate**: the number of samples taken per second (Hz).
- **Sampling resolution**: the number of bits used to store each sample.
- **File size (bits) = sampling rate × sampling resolution × length in seconds (× number of channels).**

Worked example: 44 100 Hz, 16-bit, stereo, 30 s.
44 100 × 16 × 2 × 30 = 42 336 000 bits = 5 292 000 bytes ≈ **5.05 MiB**

| Change | Effect |
|---|---|
| Higher sampling rate | Closer to the original sound and a more accurate recording; larger file. |
| Higher sampling resolution | Each amplitude is stored more accurately, with less quantisation error and a greater dynamic range; larger file. |

## 1.3 Compression

### Key terms
- **Lossless compression**: the file is made smaller with no data lost. The original can be reconstructed exactly.
- **Lossy compression**: the file is made smaller by permanently removing data that is judged unnecessary. The original cannot be reconstructed.

### Why compress?
- Smaller files take less storage space.
- They transfer and download faster, use less bandwidth and stream with less buffering.
- They are under the size limits for email attachments and uploads.

### Run-length encoding (RLE), a lossless method
- A run of identical data items is replaced by **one copy plus a count**.
- Text: `AAAABBBCCD` → `4A3B2C1D`.
- Bitmap: a row such as W W W W B B W becomes `4W 2B 1W`.
- RLE works best when there are long runs, such as images with large areas of one colour. It can make a file **bigger** if there are few repeats.

### Lossy methods
- **Images (e.g. JPEG)**: reduce the colour depth or resolution, and group similar colours together. The human eye does not notice small changes in colour.
- **Sound (e.g. MP3)**: perceptual coding removes sounds humans cannot hear (outside about 20 Hz–20 kHz) and quieter sounds masked by louder ones played at the same time. The sampling rate or resolution can also be reduced.

### Which to choose?
| Use lossless when… | Use lossy when… |
|---|---|
| Every bit must survive, e.g. text documents, program code and executable files, spreadsheets, medical images | A small loss of quality is acceptable and size matters most, e.g. photos for websites and video streaming |

## Exam tips and common mistakes
- **Show your working** in conversions and file-size questions. Marks are given for method.
- In file-size answers, state the **unit** and say which prefix you used (KiB or kB).
- "Explain why the file is larger" needs a link: "more bits per pixel, so more data is stored for every pixel."
- For overflow, say *why*: the result exceeds the largest value that can be held in the number of bits.
- When asked about Unicode versus ASCII, give **both** a benefit (more characters, all languages) and a drawback (more storage).
- In RLE questions, apply the method **exactly** as the question defines it. Some questions use a flag character or a set order, such as count then character.

## Quick self-check
1. Convert −20 into 8-bit two's complement. *(1110 1100)*
2. What is the largest denary number an unsigned 12-bit register can hold? *(4095)*
3. A 500 × 400 image uses 256 colours. Find its size in bytes. *(8 bits per pixel → 200 000 bytes)*
4. Give two reasons why RLE might not reduce the size of a photograph. *(Few runs of identical pixels; overhead of storing counts.)*
