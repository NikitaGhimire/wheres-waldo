const performanceMiddleware = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const time = diff[0] * 1e3 + diff[1] * 1e-6;
        console.log(`${req.method} ${req.url} - ${time.toFixed(2)}ms`);
    });

    next();
};

module.exports = performanceMiddleware;