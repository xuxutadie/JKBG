import { ZodError } from 'zod';
import { HttpError } from '../lib/httpError.js';

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: '请求参数校验失败',
      errors: error.flatten()
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      message: error.message,
      details: error.details || null
    });
  }

  console.error(error);
  return res.status(500).json({
    message: '服务器内部错误'
  });
};
