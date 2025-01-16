const globalErrorHandlerMiddleware = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500
    error.status = error.status || "error"

    if (process.env.NODE_ENV === "development") {
        return res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
            error: error,
            stack: error.stack
        })
    } else {
        return res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
        })
    }
}

module.exports = globalErrorHandlerMiddleware