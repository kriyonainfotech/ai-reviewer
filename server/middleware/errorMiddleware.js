const errorHandler = (err, req, res, next) => {
    console.error("[Server] Unhandled Error:", err.stack);
    res.status(500).json({ message: "Something broke on the server!" });
};

module.exports = errorHandler;