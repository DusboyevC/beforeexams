---
subject: Computer Science 9618
chapter: 2
title: Communication
paper: Paper 1
---

# 2 Communication

## What you must be able to do
- Describe LANs and WANs, client–server and peer-to-peer networks, and the main topologies.
- Explain cloud computing, and wired and wireless media.
- Describe the hardware a network needs and what each device does.
- Explain Ethernet and CSMA/CD.
- Describe bit streaming, both on demand and real time.
- Explain IP addressing (IPv4, IPv6, public, private, static and dynamic, subnetting) and how a URL is resolved by DNS.

## 2.1 Networks, including the internet

### Key terms
- **LAN (local area network)**: connects computers over a small area such as one building or site. The hardware is usually owned by the organisation.
- **WAN (wide area network)**: connects computers or LANs over a large geographical area, often using third-party telecommunication links. The internet is the largest WAN.
- **Client–server model**: a central server provides services and resources (files, printing, email, web pages); clients request them.
- **Peer-to-peer (P2P)**: each computer has equal status and can act as both client and server, sharing its own resources directly.

| Client–server | Peer-to-peer |
|---|---|
| Central storage makes backup and security easier to manage | No central server, so it is cheaper to set up |
| Server can become a bottleneck or a single point of failure | Each peer must be secured and backed up separately |
| Easier to control access rights | Performance falls as peers share resources |

**Thin client**: depends heavily on the server for processing and storage, e.g. a browser-based app. **Thick client**: does much of its own processing and storage, so it can work offline.

### Topologies
| Topology | Description | Points to make |
|---|---|---|
| **Bus** | All devices share one backbone cable with terminators at each end | Cheap and easy to add devices; collisions are likely; if the backbone fails the whole network fails |
| **Star** | Every device connects to a central switch or hub | One failed link affects only one device; the switch sends data only to its destination, which is secure and reduces collisions; if the central device fails the network fails; more cable |
| **Mesh** | Devices connect to several others, with many routes | Very reliable because data can be rerouted; expensive with a lot of cabling; used on the internet and in WANs |
| **Hybrid** | A combination, e.g. stars joined by a bus | Fits real buildings; complex to manage |

### Cloud computing
- **Cloud computing**: storage, services or processing provided over the internet on remote servers.
- **Public cloud**: owned by a provider and shared by many customers. **Private cloud**: dedicated to one organisation.
- Benefits: no need to buy and maintain your own hardware; access from anywhere; scalable on demand; the provider handles backups and updates.
- Drawbacks: needs a reliable internet connection; security and privacy depend on the provider; ongoing subscription costs; less control; data may be stored in another country with different laws.

### Wired and wireless media
| Medium | Points |
|---|---|
| Copper (twisted pair or coaxial) | Cheap and easy to install; affected by electromagnetic interference; lower bandwidth over long distances |
| Fibre-optic | Very high bandwidth; long distances without signal loss; immune to interference; harder to tap; expensive |
| Wireless (radio waves / Wi-Fi, microwave, satellite) | Mobility with no cables; easy to add devices; lower speed and more interference; must be encrypted because signals can be intercepted |

### Network hardware
- **Switch**: connects devices on a LAN and sends each frame only to the device with the matching MAC address.
- **Router**: connects different networks, e.g. a LAN to the internet. It reads the destination IP address and forwards packets along the best route.
- **NIC (network interface card)**: lets a device connect to a network. It holds a unique **MAC address**.
- **WNIC**: a wireless NIC. **WAP (wireless access point)**: lets wireless devices join a wired network.
- **Repeater**: regenerates and amplifies a signal so it can travel further.
- **Bridge**: joins two LANs that use the same protocol into one network.
- **Modem**: converts digital signals to analogue for transmission (modulation) and back again (demodulation).

### Ethernet and CSMA/CD
- **Ethernet**: the most common protocol for wired LANs. Data is sent in frames that include the source and destination MAC addresses.
- **CSMA/CD (carrier sense multiple access with collision detection)**, used on shared media:
  1. A device listens to check the medium is idle (carrier sense).
  2. If idle it transmits; any device may transmit (multiple access).
  3. If two transmit at once there is a **collision**, which is detected.
  4. A jam signal is sent and each device waits a **random** time before trying again.

### Bit streaming
- **Bit streaming**: data such as video or audio is sent as a continuous stream of bits and played as it arrives, without downloading the whole file first.
- A **buffer** stores some data ahead of playback, so short drops in connection speed do not interrupt viewing.
- **On-demand streaming**: pre-recorded files are stored on a server and streamed when the user chooses. The user can pause, rewind and skip.
- **Real-time (live) streaming**: an event is encoded and streamed as it happens. There is no fast-forward, and it needs enough bandwidth for live data.
- Higher **bit rate** means better quality but needs more bandwidth.

### The internet and the World Wide Web
- **Internet**: the global network of interconnected networks, i.e. the infrastructure.
- **World Wide Web (WWW)**: the collection of web pages and resources accessed over the internet with HTTP/HTTPS. It is a service that runs *on* the internet.

### IP addressing
- **IP address**: a unique address given to a device on a network, used to route packets.
- **IPv4**: 32 bits, written as four denary numbers 0–255 separated by dots, e.g. 192.168.1.20. About 4.3 billion addresses.
- **IPv6**: 128 bits, written as eight groups of four hex digits separated by colons. Leading zeros can be dropped and one run of zero groups can be written as `::`. It was introduced because IPv4 addresses were running out.
- **Public IP address**: unique on the internet, assigned by the ISP.
- **Private IP address**: used only inside a LAN, e.g. 192.168.x.x, 10.x.x.x. It is not routable on the internet; a router using NAT translates it.
- **Static IP address**: stays the same. It is needed by servers so clients can always find them.
- **Dynamic IP address**: assigned for a session by DHCP and can change. It reuses a limited pool of addresses.
- **Subnetting**: dividing a network into smaller sub-networks. The IP address is split into a **network ID** and a **host ID**, with a **subnet mask** showing which bits are which. Benefits: reduces network traffic, improves security, and makes the network easier to manage.

### URLs and DNS
- **URL**: the text address of a web resource, e.g. `https://www.example.com/page.html` (protocol, domain name, path).
- **DNS (domain name service)** resolves the URL:
  1. The browser sends the domain name to a DNS server.
  2. The DNS server looks the name up in its database. If it does not hold it, it asks another DNS server higher in the hierarchy.
  3. The matching IP address is returned to the browser.
  4. The browser sends its request to that IP address, and the web server returns the page.

## Exam tips and common mistakes
- Don't mix up a **switch** (MAC addresses, inside a LAN) and a **router** (IP addresses, between networks).
- "Internet" and "WWW" are **not** the same. Questions often ask for the difference.
- In CSMA/CD answers, the marks are for: listen first, collision detected, jam signal, **random** wait, retransmit.
- For streaming, mention the **buffer** and the effect of bandwidth.
- Give *reasons* for IPv6: IPv4 is running out because so many devices are connected.

## Quick self-check
1. State two differences between a public and a private IP address.
2. Explain why a web server needs a static IP address.
3. Describe what happens when a collision is detected on an Ethernet bus.
4. Give one benefit and one drawback of a star topology compared with a bus.
