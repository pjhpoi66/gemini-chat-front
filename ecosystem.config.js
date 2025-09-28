module.exports = {
    apps: [
        {
            name: 'gemini-frontend', // 앱 이름
            script: 'npm',
            args: 'start',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};