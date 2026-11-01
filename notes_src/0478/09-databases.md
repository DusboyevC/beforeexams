---
subject: Computer Science 0478
chapter: 9
title: Databases
paper: Paper 2
---

# 9 Databases

## Single-table databases
- **Table**: holds data about one type of item.
- **Record**: one row; all the data about one item.
- **Field**: one column; a single piece of data about each item (with a **data type**).
- **Primary key**: a field that holds a **unique** value for each record, so each record can be identified, e.g. StudentID.
- **Validation** can be set on fields, e.g. a range check or a presence check.

## Data types
- **Text / alphanumeric**: letters and numbers, e.g. names and phone numbers (a phone number is text because it can start with 0 and isn't calculated).
- **Character**: a single character.
- **Boolean**: Yes/No or True/False.
- **Integer**: whole numbers.
- **Real**: decimal numbers.
- **Date/time**.

## SQL (structured query language)
```
SELECT Name, Age
FROM Students
WHERE Age >= 16 AND Gender = 'F'
ORDER BY Name ASC;
```
- `SELECT`: the fields to show (`*` for all).
- `FROM`: the table.
- `WHERE`: the condition(s). Use `AND` and `OR`.
- `ORDER BY`: `ASC` or `DESC`.
- `SUM(field)` and `COUNT(field)`: e.g. `SELECT COUNT(*) FROM Students WHERE Age > 15;`

## Exam tips and common mistakes
- A primary key must be **unique**; "Name" is a poor choice because names can be repeated.
- In SQL, put **text** values in quotes; numbers and Boolean values have no quotes.
- Count the records that match the query carefully, and give the fields in the order asked.
- End each SQL statement with a semicolon. Spell field names **exactly** as in the table.

## Quick self-check
1. Suggest a suitable primary key for a table of library books, and explain why.
2. Write an SQL query to show the Title and Price of all books cheaper than 10, sorted by Price, highest first.
3. Explain why a telephone number should be stored as text.
