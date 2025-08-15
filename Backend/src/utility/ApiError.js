class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong",
        error= [],
        stack = ""

    ){
        super(message)
        this.message =message,
        this.statusCode= statusCode
        this.data = null,
        this.success = false;
        this.error = error
    }
}


export {ApiError}
