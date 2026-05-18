const mongoose = require('mongoose');
const CourseEnrollment = require('../../models/learning/enrollments/CourseEnrollment');
const Section = require('../../models/academic/Section');

/**
 * Enrollment Service — handles enrollment transactions
 */

const createEnrollment = async (studentId, sectionId, semesterId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check section capacity
    const section = await Section.findById(sectionId).session(session);
    if (!section) {
      throw new Error('Section not found');
    }

    const currentCount = await CourseEnrollment.countDocuments({
      section: sectionId,
      semester: semesterId
    }).session(session);

    if (section.maxCapacity && currentCount >= section.maxCapacity) {
      throw new Error('Section is at full capacity');
    }

    // Check for duplicate enrollment
    const existing = await CourseEnrollment.findOne({
      studentId: studentId,
      sectionId: sectionId,
      semesterId: semesterId
    }).session(session);

    if (existing) {
      throw new Error('Student is already enrolled in this section');
    }

    // Create enrollment
    const enrollment = await CourseEnrollment.create([{
      studentId: studentId,
      courseId: section.course,
      sectionId: sectionId,
      semesterId: semesterId,
      status: 'active'
    }], { session });

    // Update section count atomically
    await Section.findByIdAndUpdate(
      sectionId,
      { $inc: { currentEnrollment: 1 } },
      { session }
    );

    await session.commitTransaction();
    return enrollment[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  createEnrollment
};

