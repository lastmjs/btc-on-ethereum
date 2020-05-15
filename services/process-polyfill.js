window.process = {
    env: {
        NODE_ENV: window.location.hostname === 'btconethereum.com' ? 'production' : window.location.hostname.includes('.netlify.com') ? 'staging' : 'development',
        testing: false
    },
    argv: []
};