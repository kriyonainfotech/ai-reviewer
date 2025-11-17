const loggingMiddleware = (req, res, next) => {
    console.log(`[Server] ${req.method} ${req.url}`);
    next();
};

module.exports = loggingMiddleware;