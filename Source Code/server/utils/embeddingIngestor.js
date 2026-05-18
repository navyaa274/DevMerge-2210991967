const Syllabus = require('../models/academic/Syllabus');
const CourseMaterial = require('../models/academic/CourseMaterial');
const Course = require('../models/academic/Course');
const { ingestContent } = require('../services/ai/ragIngestionService');

/**
 * Bulk Ingest Syllabi
 * Finds all syllabi and vectorizes them
 */
exports.bulkIngestSyllabi = async () => {
    try {
        const syllabi = await Syllabus.find().populate('course');
        console.log(`[RAG Bulk] Ingesting ${syllabi.length} Syllabi...`);

        for (const syllabus of syllabi) {
            if (syllabus.content) {
                await ingestContent(
                    syllabus._id,
                    'Syllabus',
                    syllabus.content,
                    {
                        courseId: syllabus.course?._id || syllabus.course,
                        departmentId: syllabus.course?.department
                    }
                );
            }
        }
    } catch (error) {
        console.error('[RAG Bulk Error] Syllabus Ingestion failed:', error.message);
    }
};

/**
 * Bulk Ingest Course Materials
 */
exports.bulkIngestMaterials = async () => {
    try {
        const materials = await CourseMaterial.find();
        console.log(`[RAG Bulk] Ingesting ${materials.length} Materials...`);

        for (const mat of materials) {
            // We need the course to get departmentId
            const course = await Course.findById(mat.courseId);
            await ingestContent(
                mat._id,
                'CourseMaterial',
                `${mat.title}. Type: ${mat.type}`,
                {
                    courseId: mat.courseId,
                    departmentId: course?.department
                }
            );
        }
    } catch (error) {
        console.error('[RAG Bulk Error] Material Ingestion failed:', error.message);
    }
};
