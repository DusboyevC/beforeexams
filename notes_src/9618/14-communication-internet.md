---
subject: Computer Science 9618
chapter: 14
title: Communication and internet technologies
paper: Paper 3
---

# 14 Communication and internet technologies

## What you must be able to do
- Explain why protocols are needed, and describe the TCP/IP protocol suite and its four layers.
- State the purpose of HTTP, FTP, POP3, IMAP, SMTP and BitTorrent.
- Compare circuit switching and packet switching, and explain the role of a router.

## 14.1 Protocols
- **Protocol**: a set of rules that govern how data is transmitted between devices, covering format, timing, error checking and addressing.
- **Why needed**: devices from different manufacturers, running different software, can communicate because they all follow the same agreed rules.

### TCP/IP protocol suite: four layers
| Layer | Role | Protocols |
|---|---|---|
| **Application** | Provides network services to applications; formats data for the application | HTTP, HTTPS, FTP, SMTP, POP3, IMAP |
| **Transport** | Splits data into **packets (segments)**; adds sequence numbers and port numbers; makes sure packets arrive and are reassembled in order; flow control; acknowledgements and re-sends | TCP (reliable), UDP |
| **Internet (network)** | Adds the **source and destination IP addresses**; routes packets across networks | IP |
| **Link (network access)** | Sends frames across the physical network; uses **MAC addresses** | Ethernet, Wi-Fi |

How it works (sending): data is passed **down** the layers, and each layer adds its own header (encapsulation). At the receiver it passes **up** the layers and each header is removed. A **protocol stack** means each layer only communicates with the layers directly above and below it.

### Application protocols
- **HTTP / HTTPS**: transfer web pages between a web server and a browser. HTTPS encrypts the data using SSL/TLS.
- **FTP**: transfers files between computers over a network (upload and download).
- **SMTP**: **sends** email from a client to a mail server and between servers (push protocol).
- **POP3**: **retrieves** email from the server to one device, usually **deleting** it from the server.
- **IMAP**: **retrieves** email but keeps it on the server, so it is **synchronised** across several devices.
- **BitTorrent**: a peer-to-peer file-sharing protocol.
  - A **tracker** keeps a record of which peers have which pieces.
  - The file is split into small **pieces**; a **swarm** is all the peers sharing a file.
  - A **seed** has the complete file; a **leech** downloads (and may upload little in return).
  - Peers download different pieces from many peers **at the same time** and upload pieces they already have to others. This spreads the load and makes large downloads fast.

## 14.2 Circuit switching and packet switching
| Circuit switching | Packet switching |
|---|---|
| A dedicated path is set up between sender and receiver for the whole communication | Data is split into packets, each sent **independently**, possibly by different routes |
| All data follows the same route and arrives in order | Packets may arrive out of order and are **reassembled** using sequence numbers |
| Full bandwidth is reserved, so quality is constant (good for real-time voice and video) | Bandwidth is shared, so the network is used efficiently |
| Bandwidth is wasted when no data is sent; set-up time is needed | If a link fails, packets are rerouted, so it is more resilient |
| | Delays vary (jitter); there is a header overhead in every packet |

**Packet contents**: header (source and destination IP addresses, sequence number, packet size, protocol), **payload** (the data), and trailer (error check, e.g. checksum, and an end-of-packet marker).

**Role of a router in packet switching**: reads the **destination IP address** of each packet; uses its **routing table** to choose the best next hop (the shortest or least congested route); forwards the packet; and can reroute around failed links.

## Exam tips and common mistakes
- Know the job of **each** TCP/IP layer and which protocol belongs to it. Questions often give a description and ask for the layer.
- POP3 versus IMAP: the key difference is whether the email **stays on the server**.
- In BitTorrent answers, use the correct terms: tracker, swarm, seed, leech, pieces.
- For circuit versus packet switching, link each benefit to a **use**, e.g. circuit switching for a phone call.

## Quick self-check
1. State the role of the transport layer.
2. Explain why IMAP is better than POP3 for someone using a phone and a laptop.
3. Describe how a file is downloaded using BitTorrent.
4. Give two benefits of packet switching over circuit switching.
