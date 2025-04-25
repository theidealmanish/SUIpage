import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError.js';

export default function notFound(
	req: Request,
	res: Response,
	next: NextFunction
) {
	return next(AppError.badRequest('Route not found'));
}
