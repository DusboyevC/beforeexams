---
subject: Computer Science 9618
chapter: 20
title: Further programming
paper: Papers 3 and 4
---

# 20 Further programming

## What you must be able to do
- Describe the programming paradigms: low-level, imperative (procedural), object-oriented and declarative.
- Write OOP code using classes, objects, attributes, methods, constructors, inheritance, polymorphism, encapsulation, containment, getters and setters.
- Write declarative (Prolog-style) facts, rules and goals, and work out what a query returns.
- Use serial, sequential and random file handling, and exception handling.

## 20.1 Programming paradigms
- **Programming paradigm**: a style or way of programming, with its own concepts and approach.
- **Low-level**: assembly or machine code, which directly controls the hardware and registers. Fast and memory-efficient; specific to one processor; hard to write and maintain. Used for embedded systems and device drivers.
- **Imperative (procedural)**: the program is a sequence of instructions that change the program state, organised into procedures and functions, e.g. Python, Pascal, C.
- **Object-oriented (OOP)**: the program is built from **objects** that combine data and the methods that act on it, e.g. Java, Python, VB.
- **Declarative**: you state **what** the problem is (facts and rules) and the system works out **how** to solve it, e.g. Prolog, SQL.

### Object-oriented programming: key terms
- **Class**: a template or blueprint that defines the attributes and methods for a type of object.
- **Object**: an **instance** of a class, with its own attribute values.
- **Attribute (property)**: data stored in an object.
- **Method**: a procedure or function defined in a class that acts on the object's data.
- **Constructor**: a special method that runs when an object is created (instantiated) and sets the initial attribute values.
- **Encapsulation**: data and methods are bundled together in a class, and attributes are made **PRIVATE**, so they can only be accessed through the object's methods. This protects the data from accidental change and hides how it works.
- **Getter / setter**: public methods that return (get) or change (set) a private attribute, so the setter can validate new values.
- **Inheritance**: a **subclass (child)** takes on all the attributes and methods of its **superclass (parent)** and can add its own. This gives code reuse and a clear "is a" hierarchy.
- **Polymorphism**: a subclass method has the same name as a superclass method but a different implementation (**overriding**), so the same call behaves correctly for each object type.
- **Containment (aggregation)**: an object contains other objects as attributes, a "has a" relationship, e.g. a Car contains an Engine.

```
CLASS Animal
   PRIVATE Name : STRING
   PUBLIC PROCEDURE NEW(GivenName : STRING)      // constructor
      Name ← GivenName
   ENDPROCEDURE
   PUBLIC FUNCTION GetName() RETURNS STRING
      RETURN Name
   ENDFUNCTION
   PUBLIC FUNCTION Speak() RETURNS STRING
      RETURN "..."
   ENDFUNCTION
ENDCLASS

CLASS Dog INHERITS Animal
   PUBLIC FUNCTION Speak() RETURNS STRING     // overrides: polymorphism
      RETURN "Woof"
   ENDFUNCTION
ENDCLASS

DECLARE Pet : Dog
Pet ← NEW Dog("Rex")
OUTPUT Pet.GetName(), Pet.Speak()
```

### Declarative programming (Prolog style)
- **Facts**: things that are unconditionally true. `parent(ali, sara).`  `likes(sara, maths).`
- **Rules**: true if their conditions are met. `grandparent(X, Z) :- parent(X, Y), parent(Y, Z).` (`:-` means "if"; the comma means AND.)
- **Goal (query)**: a question; the system searches the facts and rules for values that make it true. `?- parent(ali, Who).` returns Who = sara.
- **Variables** start with an upper-case letter; constants start with a lower-case letter.
- **Backtracking**: when one route fails, the system goes back to try other matches, so it finds every solution.

## 20.2 File processing and exception handling

### Random (direct access) files
- Records are of a fixed size, so the position of any record can be calculated.
```
OPENFILE "Stock.dat" FOR RANDOM
SEEK "Stock.dat", Address          // move to the record position
GETRECORD "Stock.dat", ThisItem     // read the record into a variable of the record type
PUTRECORD "Stock.dat", ThisItem     // write the record at the current position
CLOSEFILE "Stock.dat"
```
- Combined with a hashing algorithm, the address is calculated from the key, giving **direct access**.
- Serial and sequential files: read records in order until EOF. To add a record to a sequential file, copy the records to a new file, inserting the new record in its correct position.

### Exception handling
- **Exception**: an unexpected event during execution that disrupts normal flow, e.g. dividing by zero, a missing file, invalid input, or an array index out of range.
- **Exception handling**: code that **catches** the exception and deals with it, so the program does not crash. It can show a helpful message, ask for the input again, or close down safely.
```
TRY
   OPENFILE "Data.txt" FOR READ
   ...
EXCEPT
   OUTPUT "File could not be opened"
ENDTRY
```
- Why use it: the program doesn't crash; users get meaningful error messages; files and data stay safe (e.g. files are closed properly).

## Exam tips and common mistakes
- OOP definitions are reliable marks. **Encapsulation** = private attributes accessed through public methods; **inheritance** = the subclass gets the attributes and methods of the superclass; **polymorphism** = the same method name, with a different implementation.
- In Paper 4, write the constructor **first** and declare attributes as private.
- In Prolog queries, list **every** solution found by backtracking, in the order the facts appear.
- Exception handling: say what the exception **is** and what the handler **does**.

## Quick self-check
1. Explain the difference between a class and an object.
2. Explain how inheritance reduces the amount of code that must be written.
3. Given `parent(ali, sara). parent(sara, tim).` and the grandparent rule, what does `?- grandparent(ali, X).` return? *(X = tim)*
4. Give two exceptions that could happen when reading a file, and how to handle them.
