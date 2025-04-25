import user from '../models/user.js';

import { NextFunction, Request, Response } from 'express';

import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// get user from username
export const getUserFromUsername = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { username } = req.params;
		const userData = await user.findOne({ username }).select('-password');
		if (!userData) {
			return next(new AppError('User not found', 404));
		}
		res.status(200).json({
			status: 'success',
			message: 'User fetched successfully',
			data: userData,
		});
	}
);
