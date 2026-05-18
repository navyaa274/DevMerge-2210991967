const StudentLearningState = require("../../models/learning/pathway/StudentLearningState");
const Syllabus = require("../../models/academic/Syllabus");

/**
 * Adaptive Path Engine
 * Adjusts the student's learning trajectory based on academic performance signals
 */

exports.adjustLearningPath = async (studentId, courseId, trend) => {
  try {
    // 1. Cooldown Check (7 days)
    const state = await StudentLearningState.findOne({
      student: studentId,
      course: courseId,
    });
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (state && state.lastAdjustmentAt > sevenDaysAgo) {
      return; // Too soon for another structural adjustment
    }

    // 2. Fetch Global Syllabus for context
    const fullSyllabus = await Syllabus.find({ course: courseId }).sort({
      order: 1,
    });
    if (fullSyllabus.length === 0) return;

    let currentState = state;
    if (!currentState) {
      currentState = await StudentLearningState.create({
        student: studentId,
        course: courseId,
        unlockedModules: [fullSyllabus[0]._id],
        adaptationMode: "normal",
      });
    }

    // 3. Transformation Logic
    let updatedMode = currentState.adaptationMode;
    let newRemedialModule = null;

    if (trend === "Critical") {
      updatedMode = "remedial";
      // Inject remedial for the last failed topic
      newRemedialModule = {
        topic: "Remedial Concept Review",
        reason: "Critical performance drop detected",
      };
    } else if (trend === "Declining") {
      updatedMode = "normal"; // Don't drop to remedial immediately, but stay in normal
      // Logic: Reduce progression speed (handled by not unlocking next)
    } else if (trend === "Improving") {
      updatedMode = "accelerated";
    }

    // 4. Persistence of Adaptation
    const updateData = {
      adaptationMode: updatedMode,
      lastAdjustmentAt: new Date(),
    };

    if (newRemedialModule) {
      updateData.$push = { remedialModules: newRemedialModule };
    }

    // Logic for unlocking: Accelerated mode unlocks next 2 nodes, Normal next 1
    if (updatedMode === "accelerated") {
      const nextNodes = fullSyllabus
        .filter((s) => !currentState.unlockedModules.includes(s._id))
        .slice(0, 2);
      if (nextNodes.length > 0) {
        if (!updateData.$push) updateData.$push = {};
        if (!updateData.$push.unlockedModules)
          updateData.$push.unlockedModules = {
            $each: nextNodes.map((n) => n._id),
          };
      }
    }

    await StudentLearningState.updateOne(
      { student: studentId, course: courseId },
      updateData,
    );

    console.log(
      `[Adaptive Path] Student ${studentId} mode updated to ${updatedMode}`,
    );
  } catch (error) {
    console.error("[Adaptive Path Adjustment Error]", error);
  }
};
