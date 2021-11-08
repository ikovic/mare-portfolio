module.exports = {
    ci: {
        collect: {
            staticDistDir: './_site',
            numberOfRuns: 3,
        },
        assert: {
            preset: 'lighthouse:recommended',
        },
        upload: {
            target: 'temporary-public-storage',
            githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
        },
    },
}