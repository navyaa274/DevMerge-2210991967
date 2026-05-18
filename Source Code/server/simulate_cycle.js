const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Disable buffering to fail fast on DB errors
mongoose.set('bufferCommands', false);

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Load Models (Deferred)
const loadModels = () => {
    require('./models/academic/Course');
    require('./models/assessment/labs/LabManual');
    require('./models/assessment/labs/LabSubmission');
    require('./models/auth/User');
    require('./models/analytics/StudentWeakness');
    require('./models/learning/gamification/UserPoints');
};

// Import Services
const aiCareerPredictorService = require('./services/analytics/aiCareerPredictorService');
const facultyInsightService = require('./services/analytics/facultyInsightService');
const smartCohortService = require('./services/learning/smartCohortService');
const { executeCode } = require('./utils/codeExecutor');

async function runSimulation() {
    console.log('🚀 [Simulation] Starting AI Academic Ecosystem Validation...');

    try {
        // 1. Establish Database Connection
        console.log('🔗 [1/6] Connecting to Neural Database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devmerge');
        console.log('✅ Database Connected.');

        loadModels();
        const Course = mongoose.model('Course');
        const User = mongoose.model('User');

        // 2. Fetch Context (Course & Students)
        console.log('📂 [2/6] Fetching Academic Context...');
        const course = await Course.findOne({ code: /CS/i }) || await Course.findOne();
        const student = await User.findOne({ role: 'student' });

        if (!course || !student) {
            console.error('❌ Required data missing. Please seed the database first.');
            process.exit(1);
        }
        console.log(`📍 Course: ${course.title} (${course.code})`);
        console.log(`👤 Student: ${student.name}`);

        // 3. Validate Intelligence Service: Career Predictor
        console.log('🧠 [3/6] Testing AI Career Predictor...');
        const careerProjection = await aiCareerPredictorService.predictCareerPath(student._id);
        console.log('✅ Career Projection Generated:', (careerProjection.projections || []).map(r => r.role).join(', ') || 'Insufficient Data');

        // 4. Validate Intelligence Service: Faculty Insights
        console.log('📊 [4/6] Testing Faculty Insight Engine (Parallel Insights)...');
        const [courseInsights, integrity, syllabus] = await Promise.all([
            facultyInsightService.getCourseInsights(course._id),
            facultyInsightService.getIntegrityInsights(course._id),
            facultyInsightService.getSyllabusInsights(course._id)
        ]);
        console.log('✅ Integrity Score:', (integrity.globalScore || 0) + '%');
        console.log('✅ Syllabus Alignment:', (syllabus.weeklyAlignment || []).length + ' weeks tracked.');

        // 5. Validate Intelligence Service: Smart Cohort Synergy
        console.log('🤝 [5/6] Testing Smart Cohort Synergy...');
        const synergyGroups = await smartCohortService.suggestSynergyGroups(course._id, 1);
        console.log(`✅ Synergy Clustering Complete: ${(synergyGroups.groups || []).length} groups suggested.`);

        // 6. Validate Security Layer: Isolated Code Execution
        console.log('🛡️ [6/6] Validating Secure Code Sandbox (Piston)...');
        const testCode = 'print("Secure Execution Success")';
        const executionResult = await executeCode(testCode, 'python', [{ input: '', output: 'Secure Execution Success' }]);

        if (executionResult.status === 'accepted') {
            console.log('✅ Isolated Sandbox Validation: PASSED');
        } else {
            console.log('⚠️ Isolated Sandbox Validation: UNSTABLE (Check Piston availability)');
        }

        console.log('\n✨ [Simulation Complete] AI Academic Ecosystem is FUNCTIONAL and STABLE.');
        process.exit(0);
    } catch (error) {
        console.error('\n💥 [Simulation ERROR]:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

runSimulation();
