const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, '..');
const servicesDir = path.join(serverDir, 'services');

const serviceMap = {
    // AI
    'copilotService': 'ai',
    'ragIngestionService': 'ai',
    'feedbackGeneratorService': 'ai',
    'assignmentGeneratorService': 'ai',
    'lectureGeneratorService': 'ai',
    'practiceGeneratorService': 'ai',
    'rubricGeneratorService': 'ai',
    'studyPlanService': 'ai',
    'codeReviewService': 'ai',

    // Analytics
    'trendAnalysis': 'analytics',
    'trendAnalyzerService': 'analytics',
    'predictiveAnalytics': 'analytics',
    'departmentInsightService': 'analytics',
    'facultyInsightService': 'analytics',
    'programInsightService': 'analytics',
    'anomalyDetection': 'analytics',
    'cognitiveLoadService': 'analytics',
    'difficultyAdjustmentService': 'analytics',
    'universitySummaryService': 'analytics',
    'attainmentService': 'analytics',

    // Academic
    'facultyWorkloadService': 'academic',
    'accreditationService': 'academic',
    'curriculumOptimizationService': 'academic',
    'interventionEngineService': 'academic',
    'adaptivePathService': 'academic',
    'governanceEfficiencyService': 'academic',

    // Infrastructure
    'redisService': 'infrastructure',
    'cacheService': 'infrastructure',
    'queueService': 'infrastructure',
    'observabilityService': 'infrastructure',
    'codeExecutorService': 'infrastructure',

    // Reports
    'reportBuilder': 'reports',
    'scheduledReports': 'reports',
    'dataVisualization': 'reports',

    // System
    'realtimeDashboard': 'system',
    'systemStatsService': 'system'
};

async function walkDir(dir, callback) {
    const files = await fs.promises.readdir(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = await fs.promises.stat(filepath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'services' && file !== 'scripts') {
                await walkDir(filepath, callback);
            }
        } else {
            await callback(filepath);
        }
    }
}

async function organizeServices() {
    console.log('Starting service organization...');

    // 1. Move service files
    for (const [service, folder] of Object.entries(serviceMap)) {
        const sourcePath = path.join(servicesDir, `${service}.js`);
        const targetFolder = path.join(servicesDir, folder);
        const targetPath = path.join(targetFolder, `${service}.js`);

        if (fs.existsSync(sourcePath)) {
            if (!fs.existsSync(targetFolder)) {
                await fs.promises.mkdir(targetFolder, { recursive: true });
            }

            let content = await fs.promises.readFile(sourcePath, 'utf8');
            // Services often require other services or models. 
            // Models were already moved to subfolders in previous step.

            await fs.promises.writeFile(targetPath, content);
            await fs.promises.unlink(sourcePath);
            console.log(`Moved service ${service} -> ${folder}/${service}.js`);
        }
    }

    // 2. Global search and replace for requires
    console.log('Updating references in codebase...');
    await walkDir(serverDir, async (filepath) => {
        if (!filepath.endsWith('.js') && !filepath.endsWith('.json')) return;
        if (filepath.includes('node_modules')) return;

        let content = await fs.promises.readFile(filepath, 'utf8');
        let changed = false;

        for (const [service, folder] of Object.entries(serviceMap)) {
            const regex = new RegExp(`(require\\(['"])(.*\\/services\\/)(${service})(['"]\\))`, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, `$1$2${folder}/${service}$4`);
                changed = true;
            }
        }

        if (changed) {
            await fs.promises.writeFile(filepath, content);
            console.log(`Updated references in ${path.relative(serverDir, filepath)}`);
        }
    });

    console.log('Service organization complete!');
}

organizeServices().catch(console.error);
