const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, '..');
const modelsDir = path.join(serverDir, 'models');

const modelMap = {
    // identity
    'User': 'identity',
    'RolePermission': 'identity',
    'APIKey': 'identity',
    'BlockedIP': 'identity',

    // academic
    'Course': 'academic',
    'Department': 'academic',
    'Program': 'academic',
    'Semester': 'academic',
    'AcademicYear': 'academic',
    'Syllabus': 'academic',
    'SyllabusUnit': 'academic',
    'CourseOutcome': 'academic',
    'ProgramOutcome': 'academic',
    'Section': 'academic',
    'University': 'academic',
    'Schedule': 'academic',

    // learning
    'LearningPath': 'learning',
    'Resource': 'learning',
    'Video': 'learning',
    'Streak': 'learning',
    'Badge': 'learning',
    'Achievement': 'learning',
    'UserBadge': 'learning',
    'UserPoints': 'learning',
    'Certificate': 'learning',
    'Enrollment': 'learning',
    'CourseEnrollment': 'learning',
    'Mentorship': 'learning',
    'Intervention': 'learning',
    'StudentLearningState': 'learning',

    // assessment
    'Problem': 'assessment',
    'ProblemMetadata': 'assessment',
    'Assignment': 'assessment',
    'AssignmentSubmission': 'assessment',
    'Submission': 'assessment',
    'LabSubmission': 'assessment',
    'LabManual': 'assessment',
    'LabGrading': 'assessment',
    'Quiz': 'assessment',
    'Exam': 'assessment',
    'ExamResponse': 'assessment',
    'Rubric': 'assessment',
    'CodeReview': 'assessment',
    'CodeSession': 'assessment',
    'PlagiarismReport': 'assessment',
    'Collaboration': 'assessment',

    // analytics
    'Analytics': 'analytics',
    'AdvancedAnalytics': 'analytics',
    'StudentProgress': 'analytics',
    'StudentWeakness': 'analytics',
    'UserProgress': 'analytics',
    'WeaknessAnalysis': 'analytics',
    'WeaknessHistory': 'analytics',
    'CopilotUsageLog': 'analytics',

    // communication
    'Team': 'communication',
    'Discussion': 'communication',
    'Notification': 'communication',
    'PushNotification': 'communication',
    'ChatSession': 'communication',

    // system
    'SystemConfig': 'system',
    'UserPreferences': 'system',
    'AuditLog': 'system',
    'Integration': 'system',
    'MobileDevice': 'system',
    'Webhook': 'system',
    'Embedding': 'system',
    'Leaderboard': 'system',
    'Report': 'system',
    'Feedback': 'system'
};

async function walkDir(dir, callback) {
    const files = await fs.promises.readdir(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = await fs.promises.stat(filepath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'models' && file !== 'scripts') {
                await walkDir(filepath, callback);
            }
        } else {
            await callback(filepath);
        }
    }
}

async function organizeModels() {
    console.log('Starting model organization...');

    // 1. Move model files and update internal requires
    for (const [model, folder] of Object.entries(modelMap)) {
        const sourcePath = path.join(modelsDir, `${model}.js`);
        const targetFolder = path.join(modelsDir, folder);
        const targetPath = path.join(targetFolder, `${model}.js`);

        if (fs.existsSync(sourcePath)) {
            if (!fs.existsSync(targetFolder)) {
                await fs.promises.mkdir(targetFolder, { recursive: true });
            }

            let content = await fs.promises.readFile(sourcePath, 'utf8');

            // Update requires inside the model (unlikely but possible)
            // If a model requires another model in the same folder: require('./OtherModel') -> require('../folder/OtherModel') or require('./OtherModel') if same folder
            // This is complex, but usually models don't require each other with relative paths much.

            await fs.promises.writeFile(targetPath, content);
            await fs.promises.unlink(sourcePath);
            console.log(`Moved model ${model} -> ${folder}/${model}.js`);
        }
    }

    // 2. Global search and replace for requires
    console.log('Updating references in codebase...');
    await walkDir(serverDir, async (filepath) => {
        if (!filepath.endsWith('.js') && !filepath.endsWith('.json')) return;

        let content = await fs.promises.readFile(filepath, 'utf8');
        let changed = false;

        // Pattern: require('.../models/ModelName')
        // We need to replace it with require('.../models/folder/ModelName')
        for (const [model, folder] of Object.entries(modelMap)) {
            const regex = new RegExp(`(require\\(['"])(.*\\/models\\/)(${model})(['"]\\))`, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, `$1$2${folder}/${model}$4`);
                changed = true;
            }
        }

        if (changed) {
            await fs.promises.writeFile(filepath, content);
            console.log(`Updated references in ${path.relative(serverDir, filepath)}`);
        }
    });

    console.log('Model organization complete!');
}

organizeModels().catch(console.error);
