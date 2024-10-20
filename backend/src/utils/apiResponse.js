class APIResponse {
    constructor(status, message, data = null) {
      this.status = status;
      this.message = message;
      this.data = data;
    }
  
    static success(res, message, data, statusCode = 200) {
      return res.status(statusCode).json(new APIResponse('success', message, data));
    }
  
    static error(res, message, statusCode = 400) {
      return res.status(statusCode).json(new APIResponse('error', message));
    }
  }
  
  module.exports = APIResponse;