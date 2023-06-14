const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/mentor_student_assignment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create Mentor and Student models
const Mentor = mongoose.model('Mentor', {
  name: String,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
});

const Student = mongoose.model('Student', {
  name: String,
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
});

// API to create a new mentor
app.post('/mentors', (req, res) => {
  const { name } = req.body;
  const newMentor = new Mentor({ name });

  newMentor.save((err, mentor) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create mentor' });
    } else {
      res.status(201).json(mentor);
    }
  });
});

// API to create a new student
app.post('/students', (req, res) => {
  const { name } = req.body;
  const newStudent = new Student({ name });

  newStudent.save((err, student) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create student' });
    } else {
      res.status(201).json(student);
    }
  });
});

// API to assign a student to a mentor
app.put('/mentors/:mentorId/students/:studentId', (req, res) => {
  const { mentorId, studentId } = req.params;

  Mentor.findById(mentorId, (err, mentor) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to assign student to mentor' });
    } else if (!mentor) {
      res.status(404).json({ error: 'Mentor not found' });
    } else {
      Student.findByIdAndUpdate(
        studentId,
        { mentor: mentorId },
        { new: true },
        (err, student) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to assign student to mentor' });
          } else if (!student) {
            res.status(404).json({ error: 'Student not found' });
          } else {
            mentor.students.push(studentId);
            mentor.save((err) => {
              if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to assign student to mentor' });
              } else {
                res.json({ message: 'Student assigned to mentor successfully' });
              }
            });
          }
        }
      );
    }
  });
});

// API to get all students for a particular mentor
app.get('/mentors/:mentorId/students', (req, res) => {
  const { mentorId } = req.params;

  Mentor.findById(mentorId)
    .populate('students')
    .exec((err, mentor) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch students' });
      } else if (!mentor) {
        res.status(404).json({ error: 'Mentor not found' });
      } else {
        res.json(mentor.students);
      }
    });
});

// API to get the previously assigned mentor for a particular student
app.get('/students/:studentId/mentor', (req, res) => {
  const { studentId } = req.params;

  Student.findById(studentId)
    .populate('mentor')
    .exec((err, student) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch mentor' });
      } else if (!student) {
        res.status(404).json({ error: 'Student not found' });
      } else {
        res.json(student.mentor);
      }
    });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
