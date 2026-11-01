---
subject: Mathematics 9709
chapter: 3.7
title: Vectors
paper: Paper 3
---

# 3.7 Vectors

## Basics
- A vector has magnitude and direction: a = xi + yj + zk = (x, y, z).
- **Magnitude**: |a| = √(x² + y² + z²). **Unit vector**: a/|a|.
- **Position vector** of A: OA. Then **AB = OB − OA = b − a**.
- **Midpoint** of AB: ½(a + b).

## Scalar (dot) product
- **a·b = |a||b| cos θ = a₁b₁ + a₂b₂ + a₃b₃**.
- **Perpendicular vectors**: a·b = 0.
- **Angle between two vectors**: cos θ = a·b/(|a||b|).

## Lines
- Vector equation: **r = a + λd**, where a is a point on the line and d is the direction vector.
- **Parallel lines**: the direction vectors are multiples of each other.
- **Intersecting lines**: set a₁ + λd₁ = a₂ + μd₂, solve two of the component equations for λ and μ, then **check** they satisfy the third equation.
- **Skew lines**: not parallel and they do not intersect.
- **Angle between two lines**: use the angle between their **direction vectors**.

## Planes
- Equation: **r·n = a·n**, i.e. **ax + by + cz = d**, where n = (a, b, c) is the **normal vector**.
- **Angle between two planes**: the angle between their normals.
- **Angle between a line and a plane**: find the angle φ between the line's direction d and the normal n; then the angle with the plane = 90° − φ. (Or use sin θ = |d·n|/(|d||n|).)
- **Line meets plane**: substitute the line's general point into the plane equation and solve for λ.
- **Plane through three points**: find two direction vectors in the plane; find a normal perpendicular to both by solving n·u = 0 and n·v = 0 (or using a vector product); then find d.
- **Perpendicular distance** from point P to a plane ax + by + cz = d: **|ax₁ + by₁ + cz₁ − d| / √(a² + b² + c²)**.
- **Foot of the perpendicular** from P to a line: let F = a + λd, and solve PF·d = 0.

## Exam tips and common mistakes
- Check the intersection in the **third** equation; if it fails, the lines are skew.
- Use direction vectors for angles, not position vectors.
- The angle between a line and a plane is the **complement** of the angle the line makes with the normal.

## Quick self-check
1. Find the angle between a = (1, 2, 2) and b = (2, −1, 2). *(cos θ = 4/9; θ = 63.6°)*
2. Find the equation of the plane through (1, 0, 2) with normal (3, −1, 4). *(3x − y + 4z = 11)*
3. Describe how to show that two lines are skew.
