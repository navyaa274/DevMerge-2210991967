const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, '..');

async function moveFileAndUpdate(source, target, type) {
    if (!fs.existsSync(source)) return;

    const targetDir = path.dirname(target);
    if (!fs.existsSync(targetDir)) {
        await fs.promises.mkdir(targetDir, { recursive: true });
    }

    await fs.promises.rename(source, target);
    console.log(`Moved ${type}: ${path.relative(serverDir, source)} -> ${path.relative(serverDir, target)}`);

    // Update references
    const fileName = path.basename(source, '.js');
    const oldPathPart = `${type}s/${fileName}`;
    const newPathPart = `${type}s/${path.relative(path.join(serverDir, type + 's'), target).replace(/\\/g, '/').replace('.js', '')}`;

    await walkDir(serverDir, async (filepath) => {
        if (!filepath.endsWith('.js')) return;
        if (filepath.includes('node_modules')) return;

        let content = await fs.promises.readFile(filepath, 'utf8');
        const regex = new RegExp(`(require\\(['"])(.*\\/${type}s\\/)(${fileName})(['"]\\))`, 'g');
        if (regex.test(content)) {
            const newContent = content.replace(regex, `$1$2${path.relative(path.join(serverDir, type + 's'), target).replace(/\\/g, '/').replace('.js', '')}$4`);
            await fs.promises.writeFile(filepath, newContent);
            console.log(`  Updated ref in ${path.relative(serverDir, filepath)}`);
        }
    });
}

async function walkDir(dir, callback) {
    const files = await fs.promises.readdir(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = await fs.promises.stat(filepath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'scripts') {
                await walkDir(filepath, callback);
            }
        } else {
            await callback(filepath);
        }
    }
}

async function cleanup() {
    console.log('Final cleanup and consolidation...');

    // Fix missed models
    await moveFileAndUpdate(
        path.join(serverDir, 'models/Contest.js'),
        path.join(serverDir, 'models/assessment/Contest.js'),
        'model'
    );
    await moveFileAndUpdate(
        path.join(serverDir, 'models/CourseMaterial.js'),
        path.join(serverDir, 'models/academic/CourseMaterial.js'),
        'model'
    );
    await moveFileAndUpdate(
        path.join(serverDir, 'models/ModerationFlag.js'),
        path.join(serverDir, 'models/admin/ModerationFlag.js'),
        'model'
    );

    // Fix missed services
    await moveFileAndUpdate(
        path.join(serverDir, 'services/recommendationEngine.js'),
        path.join(serverDir, 'services/ai/recommendationEngine.js'),
        'service'
    );

    // Consolidate tiny route folders
    const routeFolders = [
        { from: 'achievements', to: 'learning/achievements' },
        { from: 'code', to: 'assessment/code' },
        { from: 'contests', to: 'assessment/contests' },
        { from: 'data', to: 'reports/data' },
        { from: 'export', to: 'reports/export' },
        { from: 'feedback', to: 'learning/feedback' },
        { from: 'mentorship', to: 'learning/mentorship' },
        { from: 'mobile', to: 'system/mobile' },
        { from: 'moderation', to: 'system/moderation' },
        { from: 'problems', to: 'assessment/problems' },
        { from: 'resources', to: 'learning/resources' },
        { from: 'search', to: 'system/search' },
        { from: 'teams', to: 'communication/teams' },
        { from: 'university', to: 'academic/university' }
    ];

    for (const folder of routeFolders) {
        const fromDir = path.join(serverDir, 'routes', folder.from);
        if (fs.existsSync(fromDir)) {
            const files = await fs.promises.readdir(fromDir);
            for (const file of files) {
                const source = path.join(fromDir, file);
                const target = path.join(serverDir, 'routes', folder.to, file);

                await fs.promises.mkdir(path.dirname(target), { recursive: true });
                await fs.promises.rename(source, target);
                console.log(`Moved route: ${path.relative(serverDir, source)} -> ${path.relative(serverDir, target)}`);

                // Update index.js references manually or via walkDir
                // Note: For routes, index.js usually requires them.
            }
            // Remove the old folder if empty
            const remaining = await fs.promises.readdir(fromDir);
            if (remaining.length === 0) {
                await fs.promises.rmdir(fromDir);
            }
        }
    }

    console.log('Cleanup complete!');
}

cleanup().catch(console.error);
