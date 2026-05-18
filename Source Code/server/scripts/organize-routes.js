const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../routes');
const indexFile = path.join(__dirname, '../index.js');

// Map of route file names (without .js) to target folder
const routeMap = {
    // AI
    'aiTutor': 'ai',
    'facultyCopilot': 'ai',
    'rag': 'ai',
    'ultimate-problem-generator': 'ai',
    'ultimate-lab-generator': 'ai',

    // Analytics
    'analytics': 'analytics',
    'analytics-advanced': 'analytics',
    'predictive-analytics': 'analytics',
    'trend-analysis': 'analytics',
    'user-progress': 'analytics',
    'weakness-analysis': 'analytics',

    // Assessment & problems
    'code': 'assessment',
    'code-lab': 'assessment',
    'code-review': 'assessment',
    'contests': 'assessment',
    'lab-grading': 'assessment',
    'lab-submissions': 'assessment',
    'peer-review': 'assessment',
    'plagiarism': 'assessment',
    'problems': 'assessment',
    'quizzes': 'assessment',
    'submissions': 'assessment',
    'assignment-submissions': 'assessment',
    'attainment': 'assessment',

    // Communication
    'announcements': 'communication',
    'collaboration': 'communication',
    'discussions': 'communication',
    'forums': 'communication',
    'teams': 'communication',
    'push-notifications': 'communication',
    'notifications-advanced': 'communication',

    // Academic / Faculty / Student
    'courseEnrollment': 'academic',
    'courseMaterial': 'academic',
    'enrollment': 'academic',
    'faculty': 'academic',
    'institutional': 'academic',
    'program': 'academic',
    'program-outcomes': 'academic',
    'schedule': 'academic',
    'section': 'academic',
    'semester': 'academic',
    'semesters': 'academic',
    'student': 'academic',
    'syllabus': 'academic',
    'university': 'academic',

    // Learning & Resources
    'badges': 'learning',
    'certificates': 'learning',
    'learning-paths': 'learning',
    'materials': 'learning',
    'mentorship': 'learning',
    'points': 'learning',
    'recommendations': 'learning',
    'resources': 'learning',
    'streaks': 'learning',
    'videos': 'learning',
    'interventions': 'learning',

    // System & Reports
    'api-keys': 'system',
    'bulk-operations': 'system',
    'context': 'system',
    'data-visualization': 'reports',
    'export': 'reports',
    'integrations': 'system',
    'mobile': 'system',
    'moderation': 'system',
    'pdf-generation': 'reports',
    'performance': 'system',
    'preferences': 'system',
    'realtime-dashboard': 'system',
    'report-builder': 'reports',
    'reports': 'reports',
    'scheduled-reports': 'reports',
    'search': 'system',
    'system': 'system',
    'webhooks': 'system'
};

async function organizeRoutes() {
    console.log('Starting route organization...');

    const files = await fs.promises.readdir(routesDir);
    const jsFiles = files.filter(f => f.endsWith('.js') && !f.includes('index.js') && !f.includes('dynamicLoader.js') && !f.includes('routeRegistry.js'));

    let indexContent = await fs.promises.readFile(indexFile, 'utf8');

    for (const file of jsFiles) {
        const filenameWithoutExt = file.replace('.js', '');
        const targetFolder = routeMap[filenameWithoutExt] || 'general'; // Default fallback

        const targetDirPath = path.join(routesDir, targetFolder);
        const targetFilePath = path.join(targetDirPath, file);
        const sourceFilePath = path.join(routesDir, file);

        // Create target folder if it doesn't exist
        if (!fs.existsSync(targetDirPath)) {
            await fs.promises.mkdir(targetDirPath, { recursive: true });
        }

        // Read content and update require paths
        let fileContent = await fs.promises.readFile(sourceFilePath, 'utf8');

        // Update requires: require('../something') -> require('../../something') 
        // This regex catches require('../folder/file') but not require('./folder/file')
        fileContent = fileContent.replace(/require\(['"]\.\.\/([^'"]+)['"]\)/g, "require('../../$1')");

        // Some current routes might require local files: require('./something') -> require('../something')
        fileContent = fileContent.replace(/require\(['"]\.\/([^'"]+)['"]\)/g, "require('../$1')");

        // Move file
        await fs.promises.writeFile(targetFilePath, fileContent);
        await fs.promises.unlink(sourceFilePath);
        console.log(`Moved ${file} -> ${targetFolder}/${file}`);

        // Update index.js safely (regex to match exact require)
        const regex = new RegExp(`require\\(['"]\\./routes/${filenameWithoutExt}['"]\\)`, 'g');
        if (regex.test(indexContent)) {
            indexContent = indexContent.replace(regex, `require('./routes/${targetFolder}/${filenameWithoutExt}')`);
        } else {
            // Also check if index is requiring full path maybe
            const fallbackRegex = new RegExp(`require\\(['"]\\./routes/${file}['"]\\)`, 'g');
            indexContent = indexContent.replace(fallbackRegex, `require('./routes/${targetFolder}/${filenameWithoutExt}')`);
        }
    }

    await fs.promises.writeFile(indexFile, indexContent);
    console.log('Finished updating routes and index.js');
}

organizeRoutes().catch(console.error);
