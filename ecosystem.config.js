module.exports = {
    apps: [
        {
            name: 'gemini-frontend', // 앱 이름
            script: 'npm',
            args: 'start',
            // cwd: '/home/pjhpoi66/gemini-chat/gemini-chat-front', // 필요시 주석 해제
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