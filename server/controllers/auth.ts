import user from '../models/user.js';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';
import { RequestWithAuth } from 'types/request.js';

// register
const register = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { name, username, email, password } = req.body;
		console.log(req.body);
		// check if username or email already exists
		const usernameExists = await user.findOne({
			username,
		});

		if (usernameExists) {
			return next(AppError.badRequest('Username already exists'));
		}
		const emailExists = await user.findOne({
			email,
		});
		if (emailExists) {
			return next(AppError.badRequest('Email already exists'));
		}

		const newUser = await user.create({
			name: name
				.trim()
				.split(' ')
				.map(
					(word: string) =>
						word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
				)
				.join(' '),
			username: username.trim().toLowerCase(),
			email: email.trim(),
			password,
		});
		// generate and send JWT token
		const token = jwt.sign(
			{ id: newUser._id },
			process.env.JWT_SECRET as string,
			{
				expiresIn: '30d',
			}
		);
		console.log(token);
		res.status(201).json({
			status: 'success',
			message: 'User created successfully',
			data: newUser,
			token,
		});
	}
);

// login
const login = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		console.log('login', { body: req.body });
		const { identifier, password } = req.body;
		const existingUser = await user.findOne({
			$or: [{ username: identifier }, { email: identifier }],
		});
		console.log('existingUser', existingUser);
		if (!existingUser) {
			return next(new AppError('User not found', 404));
		}
		if (!(await existingUser.comparePassword(password))) {
			return next(new AppError('Invalid Credential', 401));
		}
		// generate and send JWT token
		const token = jwt.sign(
			{ id: existingUser._id },
			process.env.JWT_SECRET as string,
			{
				expiresIn: '30d',
			}
		);
		res.status(200).json({
			status: 'success',
			message: 'User signed in successfully',
			token: token,
			user: existingUser,
		});
	}
);

// get current user
const getCurrentUser = catchAsync(
	async (req: RequestWithAuth, res: Response, next: NextFunction) => {
		const userId = req.auth.id;
		const currentUser = await user.findById(userId);
		if (!currentUser) {
			return next(new AppError('User not found', 404));
		}
		res.status(200).json({
			status: 'success',
			message: 'User fetched successfully',
			data: currentUser,
		});
	}
);

// check if the user is logged in
const isLoggedIn = expressjwt({
	secret: (process.env.JWT_SECRET as string) || '',
	algorithms: ['HS256'],
	getToken: function (req: Request) {
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			return req.headers.authorization.split(' ')[1];
		}
		return undefined;
	},
});

export { login, register, getCurrentUser, isLoggedIn };
