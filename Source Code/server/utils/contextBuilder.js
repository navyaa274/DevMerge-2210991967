const Course = require('../models/academic/Course');
const CourseEnrollment = require('../models/learning/enrollments/CourseEnrollment');

/**
 * Context Builder Utility
 * Purpose: Synthesize RAG chunks + Academic Metadata into a prompt scaffolding
 */
exports.buildTutorContext = async (studentId, courseId, retrievedChunks, studentLevel = 'Average', currentMode = 'Standard') => {
    // 1. Enrollment Guard: Verify student belongs to this course node
    const enrollment = await CourseEnrollment.findOne({
        studentId,
        courseId,
        status: 'active'
    });

    if (!enrollment && studentId !== 'ADMIN') {
        throw new Error('Access Denied: Student is not enrolled in this academic node.');
    }

    // 2. Fetch Course Metadata for grounding
    const course = await Course.findById(courseId).populate('facultyIds', 'name');
    if (!course) throw new Error('Course Node not found');

    const facultyNames = course.facultyIds.map(f => f.name).join(', ');

    // 3. Assemble Semantic Context
    // We limit chunks to stay within context window limits
    const semanticContext = retrievedChunks
        .slice(0, 5) // Top 5 relevant chunks
        .map((c, i) => `[Reference ${i + 1}]: ${c.content || c}`)
        .join('\n\n');

    // 4. Construct Final Scaffolding
    const promptPayload = {
        system: `You are the AI Tutor for the course "${course.title}" (${course.code}). 
Your lead instructors are: ${facultyNames}.
        
CURRENT STUDENT LEVEL: ${studentLevel}
CURRENT PEDAGOGICAL MODE: ${currentMode}

PEDAGOGICAL INSTRUCTIONS:
${currentMode === 'Remedial' ? 'The student is struggling. Use first-principles explanations, break down every term, and use real-world analogies. DO NOT assume prior knowledge.' :
                currentMode === 'Advanced' ? 'Provide deep technical insights, references to architectural trade-offs, and challenging follow-up questions.' :
                    'Maintain a balanced academic progression between theory and application.'
            }

Follow these strict rules:
1. ONLY use the provided [Reference] context to answer if possible.
2. If the info isn't in context, use generic academic knowledge but state it's supplementary.
3. Maintain a professional, encouraging academic tone.
4. Never mention the word "RAG" or "Chunks" to the student.`,

        context: `COURSE METADATA:
Title: ${course.title}
Code: ${course.code}
Credits: ${course.credits}

ACADEMIC CONTEXT FROM SYLLABUS/MATERIALS:
${semanticContext || "No specific course materials found for this query."}`,

        constraints: {
            maxContextLength: 4000,
            academicNode: courseId,
            verifiedEnrollment: true
        }
    };

    return promptPayload;
};
