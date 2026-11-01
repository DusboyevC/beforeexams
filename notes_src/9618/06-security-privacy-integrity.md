---
subject: Computer Science 9618
chapter: 6
title: Security, privacy and data integrity
paper: Paper 1
---

# 6 Security, privacy and data integrity

## What you must be able to do
- Explain the difference between security, privacy and integrity of data.
- Describe threats to computer systems and data, and the measures that protect against them.
- Explain validation and verification, and describe the methods of each.
- Describe the error-detection methods used in data transmission.

## 6.1 Data security

### Key terms
- **Data security**: protecting data from loss, damage or unauthorised access.
- **Data privacy**: keeping personal data confidential so it is only seen and used by people authorised to, as required by data protection law.
- **Data integrity**: making sure data is accurate, complete and consistent, and stays that way when stored, processed or transmitted.

### Threats
- **Malware**: software designed to cause harm.
  - **Virus**: attaches to a file, replicates when the file runs, and corrupts or deletes data.
  - **Worm**: replicates on its own and spreads across networks, using up bandwidth.
  - **Trojan horse**: pretends to be useful software but carries a harmful payload, e.g. it opens a back door.
  - **Spyware / keylogger**: secretly records activity, such as keystrokes, and sends it to a third party to steal passwords.
  - **Ransomware**: encrypts the victim's data and demands payment for the key.
- **Hacking**: gaining unauthorised access to a system to steal, delete or change data.
- **Phishing**: emails or messages pretending to be from a trusted organisation, with links to fake sites that capture personal details.
- **Pharming**: malicious code redirects a user from a genuine website to a fake one, even when they type the correct URL (e.g. by altering DNS or the hosts file).
- **Denial of service (DoS / DDoS)**: floods a server with requests so genuine users cannot access it.
- **Accidental threats**: human error such as deleting files, hardware failure, power cuts, fire and flood.

### Protection measures (say what each one does)
- **User accounts and passwords**: only authorised users can log in. Use strong passwords that are changed regularly.
- **Access rights / levels**: each user can read, write or delete only what their role needs.
- **Biometrics**: authentication by a unique physical feature (fingerprint, face, iris). It cannot be forgotten and is hard to copy.
- **Two-step / multi-factor authentication**: a second check, such as a code sent to a phone.
- **Firewall**: hardware or software that monitors incoming and outgoing traffic and blocks traffic that breaks set rules, e.g. by blocking certain IP addresses and ports.
- **Anti-virus / anti-malware**: scans for and removes malware. Keep it updated.
- **Encryption**: scrambles data with a key, so intercepted data is meaningless without the decryption key. It does **not** stop interception; it makes intercepted data unreadable.
- **Digital signatures and certificates**: confirm who sent data and that it has not been altered.
- **Physical security**: locked rooms, CCTV and keycards.
- **Backups**: copies kept off-site or in the cloud, so data can be restored after loss.
- **Disk mirroring (RAID)**: data is written to two disks at once, so a failed disk can be replaced without losing data.
- **Uninterruptible power supply (UPS)**: keeps the system running during a power cut so data can be saved.

## 6.2 Data integrity

### Validation
**Validation**: an automatic check by the computer that data entered is **reasonable and sensible**, i.e. that it follows set rules. It cannot check that data is *correct*.

| Check | What it does | Example |
|---|---|---|
| **Range check** | Value lies between set limits | Age between 0 and 120 |
| **Limit check** | Value is above or below a single limit | Mark must be ≤ 100 |
| **Length check** | Correct number of characters | Password at least 8 characters |
| **Type check** | Correct data type | Quantity must be an integer |
| **Format check** | Matches a set pattern | Date as DD/MM/YYYY; code as 2 letters then 3 digits |
| **Presence check** | Field is not left empty | Surname must be entered |
| **Existence check** | Value exists in a list or file | Product code must exist in the products table |
| **Check digit** | An extra digit calculated from the others is recalculated and compared | ISBN, barcodes |

### Verification
**Verification**: checking that data has been **copied or entered accurately** from its source, i.e. that it matches the original.
- **Double entry**: data is entered twice and the two versions are compared; e.g. "re-enter your password".
- **Visual check / proofreading**: the user checks the entered data on screen against the original document.

### Error detection in transmission
- **Parity check**: an extra parity bit is added so the number of 1s is even (even parity) or odd (odd parity). The receiver counts the 1s; if the parity is wrong, there is an error.
  - Limitation: if **two** bits flip, the parity stays correct and the error is not detected.
  - **Parity block / byte**: parity is calculated for each byte (row) and for each bit position (column). The row and column that are both wrong show **exactly which bit** is wrong, so it can be corrected.
- **Checksum**: the sender calculates a value from the block of data (e.g. the sum of the bytes) and sends it with the data. The receiver recalculates it; if the values differ, the data is re-sent.
- **Echo check**: the receiver sends the data back to the sender, who compares it with the original. Weakness: the error could have happened on the way back.
- **Check digit**: used to catch errors when data is *input*, e.g. in a barcode.
- **ARQ (automatic repeat request)**: the receiver sends a positive or negative **acknowledgement**. If the sender gets a negative acknowledgement, or none at all within a **timeout**, it re-sends the data.

## Exam tips and common mistakes
- Validation versus verification is asked almost every year. Validation = **reasonable**; verification = **matches the original**. Neither one guarantees the data is correct.
- Always give an **example** for a validation check when asked to "describe".
- Encryption does not *prevent* hacking or interception; it makes the stolen data **unusable**.
- Phishing needs the user to click a link; pharming redirects them **without** their action.
- Parity block questions: identify the byte **and** the bit position, then explain using the row and column.

## Quick self-check
1. Explain why a range check cannot detect every data entry error.
2. Describe how a parity block can identify and correct a single-bit error.
3. Explain the difference between phishing and pharming.
4. Give two ways a firewall protects a network.
