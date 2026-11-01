---
subject: Computer Science 9618
chapter: 17
title: Security (A Level)
paper: Paper 3
---

# 17 Security (A Level)

## What you must be able to do
- Explain symmetric and asymmetric encryption, and how keys are used.
- Describe quantum cryptography.
- Explain the SSL/TLS protocols, the handshake, and where they are used.
- Explain digital signatures and digital certificates, and how each is created and checked.

## 17.1 Encryption, encryption protocols and digital certificates

### Key terms
- **Plaintext**: data before encryption. **Ciphertext**: data after encryption.
- **Encryption algorithm**: the mathematical process that uses a **key** to turn plaintext into ciphertext.
- **Key**: the value used by the algorithm to encrypt or decrypt. Longer keys are harder to brute-force.

### Symmetric encryption
- The **same secret key** is used to encrypt and decrypt.
- Benefit: fast, so it suits large amounts of data.
- Problem: **key distribution**. The key must be shared securely; anyone who intercepts it can decrypt everything.

### Asymmetric (public-key) encryption
- Each user has a **key pair**: a **public key**, shared openly, and a **private key**, kept secret. They are mathematically linked.
- Data encrypted with the recipient's **public key** can only be decrypted with the recipient's **private key**. So only the intended recipient can read it, which gives **confidentiality**.
- Data encrypted with the sender's **private key** can be decrypted by anyone with the public key. This proves who sent it (**authentication**) and is the basis of digital signatures.
- Benefit: there is no need to share a secret key. Drawback: slower than symmetric encryption.
- In practice, asymmetric encryption is used to exchange a **symmetric session key**, which then encrypts the rest of the data, giving the best of both.

### Quantum cryptography
- Uses the properties of **photons** (e.g. their polarisation) to send an encryption key: **quantum key distribution**.
- If an eavesdropper measures the photons, the act of measuring **changes their state**, so the interception is detected and the key is discarded.
- Benefits: in principle, keys cannot be intercepted without detection; it is secure even against future quantum computers.
- Drawbacks: needs special, expensive equipment and dedicated fibre-optic links; limited distance; slow key-transfer rates.

### SSL / TLS
- **SSL (secure sockets layer)** and its successor **TLS (transport layer security)** provide **encrypted, authenticated** communication between a client (e.g. a browser) and a server. They sit between the application and transport layers.
- **TLS has two layers**: the **handshake protocol**, which authenticates the server and agrees encryption methods and keys, and the **record protocol**, which encrypts and transfers the data.
- **Handshake** (simplified):
  1. The client sends a "hello", listing the encryption methods and TLS versions it supports.
  2. The server replies, choosing the method, and sends its **digital certificate**, which contains its public key.
  3. The client checks the certificate is valid and was issued by a trusted **certificate authority (CA)**.
  4. The client creates a **session key**, encrypts it with the server's public key and sends it. Only the server can decrypt it with its private key.
  5. Both sides now use the symmetric session key to encrypt the data.
- **Uses**: HTTPS websites (online banking and shopping), email, VoIP, VPNs.

### Digital signatures
- Prove **who sent** a message and that it **has not been altered** (integrity).
- **Creating**: the sender hashes the message to produce a **message digest**, then encrypts the digest with their **private key**. This encrypted digest is the digital signature, sent with the message.
- **Checking**: the receiver decrypts the signature with the sender's **public key** to get the digest. They hash the received message with the same hashing algorithm. If the two digests **match**, the message is authentic and unchanged.

### Digital certificates
- An electronic document issued by a trusted **certificate authority (CA)** that links a **public key** to its owner's identity.
- Contents: the owner's name, the owner's **public key**, the CA's name, a serial number, the expiry date, and the **CA's digital signature**.
- **How one is obtained**: the organisation sends its public key and proof of identity to a CA. The CA checks the identity, creates the certificate, and signs it with the CA's private key.
- **Why it matters**: it stops someone pretending to be a trusted server with their own fake public key.

## Exam tips and common mistakes
- Say **whose** key is used: encrypt with the **recipient's public key** for confidentiality; sign with the **sender's private key**.
- A digital signature uses a **hash or message digest**; mention it, because it is a mark point.
- In the TLS handshake, the certificate and **session key** steps earn most of the marks.
- Quantum cryptography: the key idea is that observing photons **changes** them, so eavesdropping is **detected**.

## Quick self-check
1. Explain why asymmetric encryption solves the key distribution problem.
2. Describe how a receiver checks a digital signature.
3. List four items in a digital certificate.
4. Explain why TLS uses both asymmetric and symmetric encryption.
