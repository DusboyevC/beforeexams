---
subject: Computer Science 9618
chapter: 8
title: Databases
paper: Paper 1
---

# 8 Databases

## What you must be able to do
- Explain the limitations of a file-based approach and the benefits of a relational database.
- Use the correct relational terms and draw E-R diagrams.
- Normalise data to 3NF.
- Describe the features of a DBMS.
- Write SQL: DDL to create and change tables, and DML to query and maintain data.

## 8.1 Database concepts

### File-based versus relational
| File-based approach – limitations | Relational database – benefits |
|---|---|
| **Data redundancy**: the same data is stored in several files | Data is stored once, so there is little redundancy |
| **Data inconsistency**: a change in one file is not copied to the others | Updating it in one place keeps data **consistent** |
| **Data dependency**: programs depend on the file structure, so changing the structure means rewriting programs | **Program–data independence**: the structure can change without rewriting applications |
| Hard to search across files | Tables can be **linked** and queried with SQL |
| Poor security: hard to set access per field | The DBMS provides **access rights**, backup and integrity checks |

### Relational terms
- **Entity**: an object or thing about which data is stored, e.g. Student.
- **Table (relation)**: a set of related data organised in rows and columns.
- **Record (tuple)**: a row; one instance of an entity.
- **Field (attribute)**: a column; one property of the entity.
- **Primary key**: an attribute (or set) that **uniquely identifies** each record in a table.
- **Candidate key**: any attribute or set that could be the primary key.
- **Secondary key**: a candidate key not chosen as primary, often used as an index for searching.
- **Foreign key**: an attribute in one table that is the **primary key of another table**, creating the link (relationship).
- **Composite key**: a primary key made from two or more attributes.
- **Referential integrity**: every foreign-key value must match an existing primary-key value in the linked table, so there are no orphan records.
- **Indexing**: an extra data structure on a field that speeds up searching and sorting.

### Relationships and E-R diagrams
- **One-to-one (1:1)**, **one-to-many (1:M)**, **many-to-many (M:M)**.
- In an E-R diagram, entities are boxes joined by lines; a "crow's foot" marks the *many* end.
- **A M:M relationship cannot be built directly.** Resolve it with a **link table** that holds the primary keys of both tables as foreign keys. This creates two 1:M relationships.
  - Example: STUDENT M:M COURSE becomes STUDENT 1:M ENROLMENT M:1 COURSE.

### Normalisation
- **First normal form (1NF)**: no repeating groups of attributes; every field is **atomic** (one value); each record has a primary key.
- **Second normal form (2NF)**: in 1NF **and** no **partial dependencies**: every non-key attribute depends on the *whole* primary key. This only matters when the key is composite.
- **Third normal form (3NF)**: in 2NF **and** no **non-key (transitive) dependencies**: non-key attributes depend only on the key, not on another non-key attribute.
- Memory aid: every non-key attribute depends on "the key, the whole key, and nothing but the key".

**Worked example**
ORDER(OrderID, CustomerID, CustomerName, ProductID, ProductName, Quantity)
1. **1NF**: an order can have several products, so remove the repeating group: ORDER(OrderID, CustomerID, CustomerName) and ORDER_LINE(OrderID, ProductID, ProductName, Quantity).
2. **2NF**: in ORDER_LINE the key is (OrderID, ProductID), and ProductName depends only on ProductID, which is a partial dependency. Split: ORDER_LINE(OrderID, ProductID, Quantity) and PRODUCT(ProductID, ProductName).
3. **3NF**: in ORDER, CustomerName depends on CustomerID, a non-key attribute. Split: ORDER(OrderID, CustomerID) and CUSTOMER(CustomerID, CustomerName).

## 8.2 Database Management System (DBMS)
- **DBMS**: software that creates, manages and controls access to a database, sitting between the users or applications and the data.
- **Data dictionary**: stores **metadata**: table and field names, data types, field sizes, validation rules, keys and relationships.
- **Data modelling**: using the DBMS to define the logical structure (the **logical schema**) of tables, fields and relationships.
- **Logical schema**: the overall design of the whole database, independent of how the data is physically stored.
- **Security**: user accounts, passwords and **access rights** (who can view or edit which tables or fields); views; automatic **backups**; audit logs.
- **Integrity**: validation rules, referential integrity and record locking for multi-user access.
- **Developer interface**: lets developers create forms, reports and queries.
- **Query processor**: takes queries (e.g. SQL), works out the most efficient way to run them, and returns the results.

## 8.3 SQL

### DDL (data definition language): defines the structure
```sql
CREATE DATABASE School;

CREATE TABLE Student (
  StudentID   CHARACTER(6) NOT NULL,
  Name        VARCHAR(30),
  DateOfBirth DATE,
  ClassID     CHARACTER(3),
  PRIMARY KEY (StudentID)
);

ALTER TABLE Student ADD Email VARCHAR(40);
ALTER TABLE Student ADD FOREIGN KEY (ClassID) REFERENCES Class(ClassID);
```
Data types to know: `CHARACTER(n)`, `VARCHAR(n)`, `BOOLEAN`, `INTEGER`, `REAL`, `DATE`, `TIME`.

### DML (data manipulation language): queries and maintains the data
```sql
SELECT Name, DateOfBirth
FROM Student
WHERE ClassID = '12A' AND DateOfBirth > '2008-01-01'
ORDER BY Name ASC;

SELECT ClassID, COUNT(*) FROM Student GROUP BY ClassID;
SELECT AVG(Mark), SUM(Mark), MAX(Mark) FROM Result;

-- joining two tables
SELECT Student.Name, Class.TeacherName
FROM Student INNER JOIN Class ON Student.ClassID = Class.ClassID;

INSERT INTO Student (StudentID, Name, ClassID) VALUES ('S00123', 'Aziz', '12A');
UPDATE Student SET ClassID = '12B' WHERE StudentID = 'S00123';
DELETE FROM Student WHERE StudentID = 'S00123';
```

## Exam tips and common mistakes
- A **foreign key** links to the primary key of **another** table. State both tables.
- In normalisation answers, **name the dependency** you removed (partial or non-key) and show the new tables with keys underlined or stated.
- SQL is marked for exact keywords and order: SELECT … FROM … WHERE … ORDER BY. Put text values in quotes; don't put quotes around numbers.
- When joining tables, include the join condition (`ON` or `WHERE Table1.Key = Table2.Key`).
- `GROUP BY` is needed when you use `COUNT`, `SUM` or `AVG` alongside another field.

## Quick self-check
1. Explain why a M:M relationship needs a link table.
2. Define "partial dependency" and say which normal form removes it.
3. Write SQL to list the names of all students in class 13C in alphabetical order.
4. Give three items of metadata stored in a data dictionary.
