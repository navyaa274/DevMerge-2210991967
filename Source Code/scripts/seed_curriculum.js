const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Register Models
const Department = require('../server/models/academic/Department');
const Program = require('../server/models/academic/Program');
const Course = require('../server/models/academic/Course');
const Embedding = require('../server/models/admin/Embedding'); // Ensure Embedding is registered
const { ingestContent } = require('../server/services/ai/ragIngestionService');

// Increase buffer timeout
mongoose.set('bufferTimeoutMS', 30000);

const curriculumData = [
    {
        name: "B.Tech Computer Science & Engineering (Core)",
        code: "BTCH-CSE",
        degreeType: "bachelors",
        duration: 4,
        semesters: [
            {
                number: 1,
                courses: ["Computational Mathematics – I", "Programming for Problem Solving Using Python", "Fundamentals of Web Development", "Engineering Physics / Engineering Chemistry", "Computer Science Fundamentals & Career Pathways", "Design Thinking & Prototyping / Maker Lab", "Environmental Studies"]
            },
            {
                number: 2,
                courses: ["Computational Mathematics – II", "Data Structures", "Advanced Web Development", "Engineering Chemistry / Engineering Physics", "Minor Project – I", "Maker Lab / Design Thinking", "Open Elective – I"]
            },
            {
                number: 3,
                courses: ["Design & Analysis of Algorithms", "Digital Logic Design", "Object-Oriented Programming with Java", "Database Management Systems", "Open Elective – II", "Verbal Ability", "Competitive Coding – I", "Summer Internship – I", "Community Service"]
            },
            {
                number: 4,
                courses: ["From NAND to Tetris: Building a Computer from Scratch", "Essentials of Machine Learning", "Modern Software Engineering & Agile Practices", "Data Analytics with PowerBI & KNIME", "Open Elective – III", "Communication & Personality Development", "Competitive Coding – II", "Minor Project – II", "Club / Society"]
            },
            {
                number: 5,
                courses: ["Computer Networks", "Operating Systems", "Cloud Computing & DevOps", "Arithmetic and Reasoning", "Value Added Course (VAC)", "Competitive Coding – III", "Summer Internship – II"]
            },
            {
                number: 6,
                courses: ["Cyber Security & Ethical Hacking", "Applied Generative AI", "Cross-Platform Mobile Development", "Comprehensive Placement Preparation", "Value Added Course (VAC)", "Competitive Coding – IV", "Minor Project – III"]
            },
            {
                number: 7,
                courses: ["Discipline Specific Elective – I", "Major Project – I", "MOOC (SWAYAM / NPTEL / AICTE ELIS)", "Summer Internship – III"]
            },
            {
                number: 8,
                courses: ["Discipline Specific Elective – II", "Industry Internship", "Major Project – II", "MOOC (SWAYAM / NPTEL / AICTE ELIS)"]
            }
        ]
    },
    {
        name: "B.Tech CSE (Robotics & Artificial Intelligence)",
        code: "BTCH-RAI",
        degreeType: "bachelors",
        duration: 4,
        semesters: [
            {
                number: 1,
                courses: ["Computational Mathematics – I", "Programming with Python", "Fundamentals of Web Development", "Engineering Physics / Chemistry", "CS Fundamentals & Career Pathways", "Design Thinking / Maker Lab", "Environmental Studies"]
            },
            {
                number: 2,
                courses: ["Computational Mathematics – II", "Data Structures", "Advanced Web Development", "Engineering Chemistry / Physics", "Minor Project – I", "Maker Lab", "Open Elective – I"]
            },
            {
                number: 3,
                courses: ["Design & Analysis of Algorithms", "Robotics Specialization Course I", "OOP with Java", "Database Management Systems", "Open Elective – II", "Verbal Ability", "Competitive Coding – I", "Summer Internship – I"]
            },
            {
                number: 4,
                courses: ["From NAND to Tetris", "Robotics Specialization Course II", "Cloud Computing & DevOps", "Data Analytics with PowerBI & KNIME", "Communication Skills", "Competitive Coding – II", "Minor Project – II"]
            },
            {
                number: 5,
                courses: ["Robotics Specialization Course III", "Robotics Specialization Course IV", "Operating Systems", "Computer Networks", "Arithmetic & Reasoning", "Competitive Coding – III"]
            },
            {
                number: 6,
                courses: ["Robotics Specialization Course V", "Robotics Specialization Course VI", "Modern Software Engineering", "Cross-Platform Mobile Development", "Placement Preparation", "Competitive Coding – IV", "Minor Project – III"]
            },
            {
                number: 7,
                courses: [
                    "Specialization Course VII",
                    "Major Project – I",
                    "System Design",
                    "MOOC",
                    "Summer Internship – III"
                ]
            },
            {
                number: 8,
                courses: [
                    "Industry Internship",
                    "Major Project – II",
                    "MOOC"
                ]
            }
        ]
    },
    {
        name: "B.Tech CSE (AI & ML)",
        code: "BTCH-AIML",
        degreeType: "bachelors",
        duration: 4,
        semesters: [
            {
                number: 1,
                courses: ["Computational Mathematics I", "Python Programming", "Web Development Basic", "Physics / Chemistry", "Design Thinking", "Environmental Studies"]
            },
            {
                number: 2,
                courses: ["Computational Mathematics II", "Data Structures", "Advanced Web Development", "Physics / Chemistry", "Maker Lab", "Minor Project – I", "Open Elective – I"]
            },
            {
                number: 3,
                courses: ["Design & Analysis of Algorithms", "Introduction to Machine Learning & Data Analysis", "OOP with Java", "DBMS", "Open Elective – II", "Verbal Ability", "Competitive Coding – I", "Internship I"]
            },
            {
                number: 4,
                courses: ["From NAND to Tetris", "Advanced Machine Learning & Data Engineering", "Cloud Computing & DevOps", "Data Analytics (PowerBI & KNIME)", "Competitive Coding – II", "Minor Project – II"]
            },
            {
                number: 5,
                courses: ["Neural Networks & Deep Learning", "Natural Language Processing", "Operating Systems", "Computer Networks", "Competitive Coding – III"]
            },
            {
                number: 6,
                courses: ["Computer Vision", "Generative AI", "Software Engineering", "Mobile Development", "Placement Preparation", "Minor Project – III"]
            },
            {
                number: 7,
                courses: ["MLOps & Responsible AI", "System Design", "Major Project – I", "Internship – III"]
            },
            {
                number: 8,
                courses: ["Industry Internship", "Major Project – II"]
            }
        ]
    },
    {
        name: "B.Tech CSE (Cybersecurity)",
        code: "BTCH-CYBER",
        degreeType: "bachelors",
        duration: 4,
        semesters: [
            {
                number: 1,
                courses: ["Computational Mathematics I", "Python Programming", "Web Development Basic", "Physics / Chemistry", "Design Thinking", "Environmental Studies"]
            },
            {
                number: 2,
                courses: ["Computational Mathematics II", "Data Structures", "Advanced Web Development", "Physics / Chemistry", "Maker Lab", "Minor Project – I", "Open Elective – I"]
            },
            {
                number: 3,
                courses: ["Design & Analysis of Algorithms", "Foundations of Cyber Security", "OOP with Java", "DBMS", "Open Elective – II", "Verbal Ability", "Competitive Coding – I", "Internship I"]
            },
            {
                number: 4,
                courses: ["Network Security", "Cloud Computing & DevOps", "Data Analytics", "Competitive Coding – II", "Minor Project – II"]
            },
            {
                number: 5,
                courses: ["Cryptography", "Application Security", "Operating Systems", "Computer Networks", "Competitive Coding – III"]
            },
            {
                number: 6,
                courses: ["Ethical Hacking & Penetration Testing", "Cloud Security", "Modern Software Engineering", "Mobile Development", "Placement Preparation", "Minor Project – III"]
            },
            {
                number: 7,
                courses: ["Digital Forensics & Incident Response", "System Design", "Major Project – I", "Internship – III"]
            },
            {
                number: 8,
                courses: ["Industry Internship", "Major Project – II"]
            }
        ]
    },
    {
        name: "B.Tech CSE (Full Stack Development)",
        code: "BTCH-FSD",
        degreeType: "bachelors",
        duration: 4,
        semesters: [
            {
                number: 1,
                courses: ["Computational Mathematics I", "Python Programming", "Web Development Basic", "Physics / Chemistry", "Design Thinking", "Environmental Studies"]
            },
            {
                number: 2,
                courses: ["Computational Mathematics II", "Data Structures", "Advanced Web Development", "Physics / Chemistry", "Maker Lab", "Minor Project – I", "Open Elective – I"]
            },
            {
                number: 3,
                courses: ["Design & Analysis of Algorithms", "Front-End Development (ReactJS & Angular)", "OOP with Java", "DBMS", "Open Elective – II", "Verbal Ability", "Competitive Coding – I", "Internship I"]
            },
            {
                number: 4,
                courses: ["Backend Development (NodeJS & ExpressJS)", "Cloud Computing & DevOps", "Databases & Data Modeling", "Competitive Coding – II", "Minor Project – II"]
            },
            {
                number: 5,
                courses: ["API Design & Integration", "Testing & QA", "Operating Systems", "Computer Networks", "Competitive Coding – III"]
            },
            {
                number: 6,
                courses: ["DevOps & CI/CD", "Cloud Deployment & Microservices", "Modern Software Engineering", "Placement Preparation", "Minor Project – III"]
            },
            {
                number: 7,
                courses: ["Advanced Full Stack Project", "System Design", "Major Project – I", "Internship – III"]
            },
            {
                number: 8,
                courses: ["Industry Internship", "Major Project – II"]
            }
        ]
    }
];

async function seed() {
    let client;
    try {
        console.log('Connecting to database...');
        console.log('URI:', process.env.MONGODB_URI.substring(0, 20) + '...');

        // Set global options
        mongoose.set('bufferCommands', false);

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4
        });

        console.log('✅ Connected successfully to:', mongoose.connection.name);

        // 1. Get or Create Department
        console.log('Looking for CSE Department...');
        let dept = await Department.findOne({ code: 'CSE' }).exec();

        if (!dept) {
            console.log('Creating CSE Department...');
            dept = await Department.create({
                name: 'Computer Science & Engineering',
                code: 'CSE',
                description: 'Department of Computer Science and Engineering',
                isActive: true
            });
        }
        console.log('Using Department:', dept.name);

        for (const progData of curriculumData) {
            console.log(`\n--- Processing program: ${progData.name} ---`);

            // 2. Create/Update Program
            let program = await Program.findOne({ code: progData.code }).exec();
            if (program) {
                program.name = progData.name;
                program.duration = progData.duration;
                program.curriculum = { totalCredits: 160 };
                await program.save();
                console.log(`Updated Program: ${program.code}`);
            } else {
                program = await Program.create({
                    name: progData.name,
                    code: progData.code,
                    department: dept._id,
                    degreeType: progData.degreeType,
                    duration: progData.duration,
                    curriculum: { totalCredits: 160 }
                });
                console.log(`Created Program: ${program.code}`);
            }

            // 3. Add Courses
            for (const sem of progData.semesters) {
                console.log(`  Semester ${sem.number}: ${sem.courses.length} courses`);
                for (const courseName of sem.courses) {
                    const courseCode = `${progData.code}-S${sem.number}-${courseName.substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '')}`;

                    let course = await Course.findOne({ code: courseCode }).exec();
                    if (!course) {
                        course = await Course.create({
                            name: courseName,
                            code: courseCode,
                            department: dept._id,
                            program: program._id,
                            semester: sem.number,
                            credits: 4,
                            courseType: 'core',
                            description: `Standard curriculum course for ${courseName}`
                        });
                        console.log(`    Created Course: ${courseName}`);

                        // 4. Ingest into RAG (Async but we wait)
                        const metadata = {
                            courseId: course._id,
                            departmentId: dept._id,
                            programId: program._id,
                            semester: sem.number,
                            subject: courseName
                        };

                        const ingestText = `COURSE INFO\nTitle: ${courseName}\nProgram: ${progData.name}\nSemester: ${sem.number}\nDepartment: ${dept.name}\nCode: ${courseCode}\nContext: This is a core academic course.`;

                        try {
                            await ingestContent(course._id.toString(), 'Course', ingestText, metadata);
                        } catch (er) {
                            console.log(`    ⚠️ RAG Error for ${courseName}: ${er.message}`);
                        }
                    }
                }
            }
        }

        console.log('\n=======================================');
        console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
        console.log('=======================================');
        process.exit(0);
    } catch (error) {
        console.error('❌ SEEDING CRITICAL FAILURE:', error);
        process.exit(1);
    }
}

seed();
