---
subject: Computer Science 0478
chapter: 2
title: Data transmission
paper: Paper 1
---

# 2 Data transmission

## Packets and packet switching
- Data is broken into **packets**.
  - **Header**: the destination IP address, the source IP address, the **packet number**, and the packet size.
  - **Payload**: the actual data.
  - **Trailer**: an error-check (e.g. a checksum) and an end-of-packet marker.
- **Packet switching**:
  1. Data is split into packets.
  2. Each packet is sent **independently**, and a **router** decides the best route for each one, so they may take **different routes**.
  3. Packets may arrive **out of order**.
  4. They are **reordered using the packet numbers** at the destination.
  5. Missing packets are requested again.

## Methods of transmission
| Method | Description | Points |
|---|---|---|
| **Serial** | One bit at a time down a single wire | Less interference and no **skew**, so it is reliable over **long distances**; cheaper cable; slower |
| **Parallel** | Several bits at once down several wires | Faster; suits **short distances**, e.g. inside a computer; bits can arrive out of sync (skew) over long distances |
| **Simplex** | One direction only | e.g. computer to printer, or a TV broadcast |
| **Half-duplex** | Both directions, but **not at the same time** | e.g. a walkie-talkie |
| **Full-duplex** | Both directions **at the same time** | e.g. a phone call; broadband |

## USB (universal serial bus)
- A standard serial connection for peripherals.
- Benefits: it is **universal**, so it works with many devices; it can only be inserted the correct way; it supplies **power**; devices are **automatically detected** and drivers installed; it is fast enough for most devices.
- Drawbacks: the cable length is limited (about 5 m); it is slower than some other connections.

## Error detection
- Errors happen because of **interference**, which can make bits **flip**, or cause data loss or corruption.
- **Parity check**: an extra parity bit is added so the number of 1s is **even** (even parity) or **odd** (odd parity). The receiver checks the parity.
  - It cannot detect errors where two bits flip (transposed bits).
- **Parity byte / block**: parity is checked for every byte (row) **and** every bit position (column). The row and column that fail meet at the **exact bit** in error, so it can be corrected.
- **Checksum**: a value is **calculated from the data** using an algorithm and sent with it. The receiver recalculates it; if the values differ, an error has occurred and the data is re-sent.
- **Echo check**: the receiver **sends the data back** to the sender, who compares it with the original. Weakness: you can't tell whether the error happened on the way there or back.
- **ARQ (automatic repeat request)**: the receiver sends an **acknowledgement** (positive or negative). If the sender gets a negative acknowledgement, or no acknowledgement before a **timeout**, it re-sends the data.
- **Check digit**: an extra digit calculated from the other digits, used to check data **entered** (e.g. barcodes, ISBNs). It detects incorrect digits and transposed digits.

## Encryption
- Encryption scrambles **plaintext** into **ciphertext** using a key, so intercepted data **cannot be understood** without the key. It does **not** stop the data being intercepted.
- **Symmetric encryption**: the **same key** is used to encrypt and decrypt. Problem: the key must be shared securely, and if it is intercepted, all the data can be read.
- **Asymmetric encryption**: a **public key** (shared) encrypts and the matching **private key** (kept secret) decrypts. Only the owner of the private key can read the data. It is more secure, because the private key is never sent.

## Exam tips and common mistakes
- "Describe packet switching" needs: data split into packets, **router**, different routes, reordered using packet numbers.
- Serial is better over **long distances** because there is **no skew**.
- In ARQ answers, include **acknowledgement** and **timeout**.

## Quick self-check
1. A byte 1101001_ uses even parity. What is the parity bit? *(0, because there are already four 1s)*
2. Explain why serial transmission is used for long distances.
3. State the difference between symmetric and asymmetric encryption.
