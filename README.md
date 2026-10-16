# Student Management System

A simple student records application built with Node.js, Express, EJS, and MySQL.

## Features

- List and search students by student ID, first name, last name, or course
- Add, edit, and delete student records
- Validate student information, including year level (1–5)

## Requirements

- Node.js and npm
- MySQL

## Setup

1. Create the database and `students` table in MySQL:

   ```sql
   CREATE DATABASE student_management;
   USE student_management;

   CREATE TABLE students (
       id INT AUTO_INCREMENT PRIMARY KEY,
       student_id VARCHAR(50) NOT NULL,
       first_name VARCHAR(100) NOT NULL,
       last_name VARCHAR(100) NOT NULL,
       course VARCHAR(100) NOT NULL,
       year_level INT NOT NULL,
       email VARCHAR(255) NOT NULL
   );
   ```

2. Update the MySQL connection settings near the top of `app.js` to match your local MySQL server:

   ```js
   const db = mysql.createConnection({
       host: 'localhost',
       user: 'root',
       password: '',
       database: 'student_management'
   });
   ```

3. From the project folder, install dependencies:

   ```bash
   npm install
   ```

## Run

Start the application from the project folder:

```bash
node app.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
