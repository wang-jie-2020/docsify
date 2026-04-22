const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const docsRoot = __dirname;  // docs 目录
const projectRoot = path.join(docsRoot, '..');  // 项目根目录
const mdRoot = path.join(docsRoot, 'md');

console.log('========================================');
console.log('  开始执行 sidebar.js');
console.log('========================================\n');

let pending = 0;

// 使用子进程执行 sidebar.js，过滤 EBUSY 错误
function execSidebar(sidebarPath, sidebarDir) {
    return new Promise((resolve) => {
        pending++;
        const relPath = path.relative(projectRoot, sidebarPath);
        console.log(`执行: ${relPath}`);

        const child = spawn('node', [sidebarPath], {
            cwd: sidebarDir,
            shell: true,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', () => {
            // 输出 stdout
            if (stdout) {
                process.stdout.write(stdout);
            }
            // 过滤 EBUSY 错误
            if (stderr && !stderr.includes('EBUSY')) {
                process.stderr.write(stderr);
            }
            pending--;
            if (pending === 0) {
                resolve();
            }
        });

        child.on('error', (e) => {
            console.error(`  错误: ${e.message}`);
            pending--;
            if (pending === 0) {
                resolve();
            }
        });
    });
}

// 遍历 docs/md 下的每个子文件夹，执行 sidebar.js
async function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            await walkDir(fullPath);
        } else if (entry.isFile() && entry.name === 'sidebar.js') {
            await execSidebar(fullPath, dir);
            console.log('');
        }
    }
}

async function main() {
    console.log('[1] 遍历执行 md 子文件夹下的 sidebar.js...\n');
    await walkDir(mdRoot);

    console.log('[2] 执行: docs\\sidebar.js');
    await execSidebar(path.join(docsRoot, 'sidebar.js'), docsRoot);

    // 等待所有子进程完成
    while (pending > 0) {
        await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n========================================');
    console.log('  执行完成！');
    console.log('========================================');
}

main();
