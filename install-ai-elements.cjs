const fs = require('fs');
const path = require('path');
const https = require('https');

const COMPONENTS_DIR = path.join(__dirname, 'src/components/ai-elements');
const UI_DIR = path.join(__dirname, 'src/components/ui');

if (!fs.existsSync(COMPONENTS_DIR)) {
    fs.mkdirSync(COMPONENTS_DIR, { recursive: true });
}

const fetchJson = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
};

const installComponent = async (name) => {
    try {
        console.log(`Installing ${name}...`);
        const url = `https://registry.ai-sdk.dev/${name}.json`;
        const data = await fetchJson(url);

        if (data.error) {
            console.error(`Error installing ${name}: ${data.error}`);
            return;
        }

        if (data.files) {
            for (const file of data.files) {
                const fileName = path.basename(file.path);
                const targetPath = path.join(COMPONENTS_DIR, fileName);

                // Fix imports: @/components/ui -> ../ui (since we are in ai-elements)
                // Actually, @/ alias should work if configured in tsconfig.
                // But let's keep it as is.

                fs.writeFileSync(targetPath, file.content);
                console.log(`Written ${targetPath}`);
            }
        }
    } catch (error) {
        console.error(`Failed to install ${name}:`, error);
    }
};

const main = async () => {
    await installComponent('message');
    await installComponent('conversation');
    await installComponent('prompt-input');

    // Try to find button-group
    // If not found, we might need to implement a stub
};

main();
