const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON request body"
        });
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID or data format"
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};

module.exports = errorHandler;
