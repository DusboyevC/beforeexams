---
subject: Computer Science 0478
chapter: 5
title: The internet and its uses
paper: Paper 1
---

# 5 The internet and its uses

## Internet and the World Wide Web
- **Internet**: a global network of interconnected networks and computers (the **infrastructure**).
- **World Wide Web (WWW)**: the collection of **websites and web pages** accessed using the internet.
- **URL (uniform resource locator)**: the text address of a web page. Parts: the **protocol** (https), the **domain name** (www.example.com), and the **file name / path** (/page.html).
- **HTTP / HTTPS**: protocols for transferring web pages. **HTTPS** is secure: the data is **encrypted** using **SSL/TLS**.
- **Web browser**: software that renders HTML to display web pages. Functions: an address bar; storing **bookmarks/favourites** and **history**; storing **cookies**; **tabs**; navigation (back and forward); managing the HTTP/HTTPS protocols.
- **How a web page is located and retrieved**:
  1. The user types a URL into the browser.
  2. The browser sends the URL to a **DNS (domain name server)**.
  3. The DNS finds the matching **IP address** (asking other DNS servers if needed) and returns it to the browser.
  4. The browser sends a request to the **web server** at that IP address.
  5. The web server sends the web page files (HTML) back, and the browser **renders** them.

## Cookies
- **Cookie**: a small text file stored by a website on the user's computer.
- **Session cookie**: stored temporarily in memory and **deleted when the browser closes**, e.g. a shopping basket.
- **Persistent cookie**: stored on the hard drive **until it expires** or is deleted, e.g. login details and preferences.
- Uses: remembering login details, preferences, the shopping cart, and tracking browsing for targeted adverts.

## Digital currency and blockchain
- **Digital currency**: exists **only electronically**, with no physical form, e.g. cryptocurrencies.
- **Blockchain**: a decentralised **digital ledger** of every transaction. Each block contains the data, a **hash** and the **previous block's hash**, so changing one block breaks the chain, which makes tampering obvious. A copy is held on many computers.

## Cyber security
**Threats**
- **Brute-force attack**: trying **every possible combination** of password to gain access.
- **Data interception**: data is intercepted during transmission, e.g. by **packet sniffing**.
- **DDoS (distributed denial of service)**: many compromised computers (a **botnet**) **flood a server with requests**, so it can't respond to genuine users.
- **Hacking**: unauthorised access to a computer system.
- **Malware**: virus (replicates and attaches to files), worm (spreads across networks by itself), Trojan horse (disguised as legitimate software), spyware (records keystrokes), adware (unwanted adverts), ransomware (encrypts data and demands payment).
- **Phishing**: emails that pretend to be from a trusted organisation, with a link to a fake website that steals details.
- **Pharming**: malicious code installed on the computer or DNS server **redirects** the user to a fake website even when they type the correct URL.
- **Social engineering**: manipulating people into giving away information or access.

**Solutions**
- **Access levels**: users can only access what their role allows.
- **Anti-malware**: scans and removes malware; keep it updated.
- **Authentication**: usernames and strong passwords, **biometrics**, and **two-step verification** (e.g. a code sent to a phone).
- **Automating software updates**: fixes security holes.
- **Checking the spelling and tone of emails and URLs**: helps spot phishing.
- **Firewall**: monitors incoming and outgoing traffic and **blocks** anything that doesn't meet set rules.
- **Privacy settings**: control what personal data is shared.
- **Proxy server**: sits between the user and the internet; **hides the user's IP address**; filters content; can block DDoS traffic; caches web pages.
- **SSL / TLS**: **encrypt** data sent between the browser and the web server. A secure site shows **https** and a padlock, and has a **digital certificate**.

## Exam tips and common mistakes
- Phishing needs the user to **click a link**; pharming redirects **automatically**.
- A DDoS answer: many computers, a botnet, flooding with requests, legitimate users denied access.
- When describing how a URL is used: browser → **DNS** → IP address → **web server** → page returned → rendered.

## Quick self-check
1. State the difference between session and persistent cookies.
2. Describe how a firewall protects a computer.
3. Explain how a brute-force attack works and one way to prevent it.
