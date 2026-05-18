const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, '..');
const controllersDir = path.join(serverDir, 'controllers');

const controllerMap = {
    'departmentController': 'academic',
    'enrollmentController': 'academic',
    'programController': 'academic',
    'sectionController': 'academic',
    'semesterController': 'academic'
};

async function walkDir(dir, callback) {
    const files = await fs.promises.readdir(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = await fs.promises.stat(filepath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'controllers' && file !== 'scripts') {
                await walkDir(filepath, callback);
            }
        } else {
            await callback(filepath);
        }
    }
}

async function organizeControllers() {
    console.log('Starting controller organization...');

    for (const [controller, folder] of Object.entries(controllerMap)) {
        const sourcePath = path.join(controllersDir, `${controller}.js`);
        const targetFolder = path.join(controllersDir, folder);
        const targetPath = path.join(targetFolder, `${controller}.js`);

        if (fs.existsSync(sourcePath)) {
            if (!fs.existsSync(targetFolder)) {
                await fs.promises.mkdir(targetFolder, { recursive: true });
            }
            await fs.promises.rename(sourcePath, targetPath);
            console.log(`Moved controller ${controller} -> ${folder}/${controller}.js`);
        }
    }

    console.log('Updating references in codebase...');
    await walkDir(serverDir, async (filepath) => {
        if (!filepath.endsWith('.js')) return;

        let content = await fs.promises.readFile(filepath, 'utf8');
        let changed = false;

        for (const [controller, folder] of Object.entries(controllerMap)) {
            const regex = new RegExp(`(require\\(['"])(.*\\/controllers\\/)(${controller})(['"]\\))`, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, `$1$2${folder}/${controller}$4`);
                changed = true;
            }
        }

        if (changed) {
            await fs.promises.writeFile(filepath, content);
            console.log(`Updated references in ${path.relative(serverDir, filepath)}`);
        }
    });

    console.log('Controller organization complete!');
}

organizeControllers().catch(console.error);
