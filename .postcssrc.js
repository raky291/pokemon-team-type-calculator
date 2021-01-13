module.exports = {
    plugins: {
        autoprefixer: { cascade: false },
        cssnano: { preset: ['default', { discardComments: { removeAll: true } }] },
    },
};
