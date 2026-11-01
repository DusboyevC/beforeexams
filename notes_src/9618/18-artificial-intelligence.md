---
subject: Computer Science 9618
chapter: 18
title: Artificial intelligence (AI)
paper: Paper 3
---

# 18 Artificial intelligence (AI)

## What you must be able to do
- Use graphs in AI, and trace Dijkstra's algorithm and the A* algorithm.
- Explain machine learning: supervised, unsupervised and reinforcement learning.
- Describe deep learning, artificial neural networks, back propagation and regression.

## 18.1 Artificial intelligence

### Graphs
- **Graph**: a set of **nodes (vertices)** connected by **edges (arcs)**. Edges can be **weighted** (e.g. distance or time) and **directed** or undirected.
- Used in AI for route planning, navigation, game moves, social networks and decision making.

### Dijkstra's algorithm (shortest path from a start node to all other nodes)
1. Give the start node a distance of 0 and every other node infinity (∞). Mark all as unvisited.
2. Choose the unvisited node with the **smallest** current distance and make it the current node.
3. For each unvisited neighbour, work out: current node's distance + edge weight. If this is **smaller** than the neighbour's recorded distance, update it and record the current node as its previous node.
4. Mark the current node as visited (its distance is now final).
5. Repeat steps 2–4 until the destination is visited (or all nodes are).
6. Trace the path back from the destination using the recorded previous nodes.

### A* algorithm
- Like Dijkstra's, but it uses a **heuristic** h(n): an estimate of the remaining cost from node n to the goal, e.g. the straight-line distance.
- Each node gets **f(n) = g(n) + h(n)**, where g(n) is the actual cost from the start.
- It always expands the open node with the **lowest f(n)**.
- **Why it is better**: the heuristic steers the search towards the goal, so fewer nodes are explored and it is usually faster than Dijkstra's. It still finds the shortest path if the heuristic **never overestimates** (is admissible).

**Trace method in the exam**: keep a table of node, g, h, f, previous node and visited, and update it one step at a time in the order of expansion.

### Machine learning
- **Machine learning**: the computer improves its performance at a task by learning from data, rather than being explicitly programmed with rules.
- **Supervised learning**: trained on **labelled** data (input and correct output); it learns to predict the label for new inputs. Examples: spam detection, recognising handwritten digits, predicting house prices.
- **Unsupervised learning**: trained on **unlabelled** data; it finds patterns, structures or **clusters** for itself. Examples: customer segmentation, recommendation systems, anomaly detection.
- **Reinforcement learning**: an **agent** acts in an environment and receives **rewards or penalties**; it learns by trial and error the actions that maximise its total reward. Examples: game-playing AI, robot movement, self-driving cars.

### Deep learning and artificial neural networks
- **Artificial neural network (ANN)**: layers of connected nodes (artificial neurons): an **input layer**, one or more **hidden layers**, and an **output layer**.
  - Each connection has a **weight**. Each neuron sums its weighted inputs (plus a bias) and passes the result through an **activation function**.
- **Deep learning**: machine learning that uses neural networks with **many hidden layers**, so the network can learn complex features directly from raw data, e.g. images, speech or language. It needs very large datasets and a lot of processing power (GPUs).
- **Back propagation**: the training method for neural networks.
  1. The input is passed forward through the network to give an output.
  2. The **error** between the actual and the expected output is calculated.
  3. The error is passed **backwards** through the network, and each **weight is adjusted** to reduce it (gradient descent).
  4. This is repeated over many training examples until the error is small enough.
- **Regression**: a machine-learning technique that predicts a **continuous numerical value** from inputs by finding the relationship (e.g. the line or curve of best fit) between the variables. Example: predicting temperature or sales.

## Exam tips and common mistakes
- In Dijkstra's traces, update a distance only if the new one is **smaller**, and mark nodes visited in the right order.
- For A*, show **g, h and f** for every node considered, and say why A* explores fewer nodes.
- Supervised versus unsupervised: the key word is **labelled** data.
- Back propagation answers must mention that the **weights are adjusted** to reduce the **error**.

## Quick self-check
1. Explain how the heuristic makes A* more efficient than Dijkstra's algorithm.
2. Give one example each of supervised, unsupervised and reinforcement learning.
3. Describe the structure of an artificial neural network.
4. Outline how back propagation trains a network.
