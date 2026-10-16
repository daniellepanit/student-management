
const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_management'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }

    console.log('Connected to MySQL');
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// DISPLAY AND SEARCH STUDENTS
app.get('/', (req, res) => {
    const search = req.query.search || '';
    const keyword = `%${search}%`;

    const sql = `
        SELECT * FROM students
        WHERE student_id LIKE ?
           OR first_name LIKE ?
           OR last_name LIKE ?
           OR course LIKE ?
        ORDER BY id DESC
    `;

    db.query(
        sql,
        [keyword, keyword, keyword, keyword],
        (err, students) => {
            if (err) {
                console.error('Error retrieving students:', err);
                return res.status(500).send('Database error.');
            }

            res.render('index', {
                students: students,
                search: search
            });
        }
    );
});

// DISPLAY ADD STUDENT FORM
app.get('/students/add', (req, res) => {
    res.render('add');
});

// ADD STUDENT
app.post('/students/add', (req, res) => {
    const {
        student_id,
        first_name,
        last_name,
        course,
        year_level,
        email
    } = req.body;

    const year = Number(year_level);

    if (
        !student_id?.trim() ||
        !first_name?.trim() ||
        !last_name?.trim() ||
        !course?.trim() ||
        !email?.trim() ||
        !Number.isInteger(year) ||
        year < 1 ||
        year > 5
    ) {
        return res.status(400).send('Please enter valid student information.');
    }

    const sql = `
        INSERT INTO students
        (student_id, first_name, last_name, course, year_level, email)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        student_id.trim(),
        first_name.trim(),
        last_name.trim(),
        course.trim(),
        year,
        email.trim()
    ];

    db.query(sql, values, (err) => {
        if (err) {
            console.error('Error adding student:', err);
            return res.status(500).send(
                'Unable to add student. Check the information and database.'
            );
        }

        res.redirect('/');
    });
});

// DISPLAY EDIT FORM WITH EXISTING STUDENT INFORMATION
app.get('/students/edit/:id', (req, res) => {
    const studentId = req.params.id;

    if (!/^\d+$/.test(studentId)) {
        return res.status(400).send('Invalid student ID.');
    }

    const sql = 'SELECT * FROM students WHERE id = ?';

    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error('Error retrieving student:', err);
            return res.status(500).send('Database error.');
        }

        if (results.length === 0) {
            return res.status(404).send('Student not found.');
        }

        // Pass the existing record to edit.ejs
        res.render('edit', {
            student: results[0]
        });
    });
});

// SAVE EDITED STUDENT INFORMATION
app.post('/students/edit/:id', (req, res) => {
    const studentId = req.params.id;

    if (!/^\d+$/.test(studentId)) {
        return res.status(400).send('Invalid student ID.');
    }

    const {
        student_id,
        first_name,
        last_name,
        course,
        year_level,
        email
    } = req.body;

    const year = Number(year_level);

    if (
        !student_id?.trim() ||
        !first_name?.trim() ||
        !last_name?.trim() ||
        !course?.trim() ||
        !email?.trim() ||
        !Number.isInteger(year) ||
        year < 1 ||
        year > 5
    ) {
        return res.status(400).send('Please enter valid student information.');
    }

    const sql = `
        UPDATE students
        SET student_id = ?,
            first_name = ?,
            last_name = ?,
            course = ?,
            year_level = ?,
            email = ?
        WHERE id = ?
    `;

    const values = [
        student_id.trim(),
        first_name.trim(),
        last_name.trim(),
        course.trim(),
        year,
        email.trim(),
        studentId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating student:', err);
            return res.status(500).send(
                'Unable to update student. Please check the information.'
            );
        }

        if (result.affectedRows === 0) {
            // MySQL may report zero changed rows if nothing was edited.
            return db.query(
                'SELECT id FROM students WHERE id = ?',
                [studentId],
                (checkErr, rows) => {
                    if (checkErr) {
                        console.error(checkErr);
                        return res.status(500).send('Database error.');
                    }

                    if (rows.length === 0) {
                        return res.status(404).send('Student not found.');
                    }

                    res.redirect('/');
                }
            );
        }

        res.redirect('/');
    });
});

// DELETE STUDENT
app.post('/students/delete/:id', (req, res) => {
    const studentId = req.params.id;

    if (!/^\d+$/.test(studentId)) {
        return res.status(400).send('Invalid student ID.');
    }

    db.query(
        'DELETE FROM students WHERE id = ?',
        [studentId],
        (err, result) => {
            if (err) {
                console.error('Error deleting student:', err);
                return res.status(500).send('Database error.');
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('Student not found.');
            }

            res.redirect('/');
        }
    );
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
