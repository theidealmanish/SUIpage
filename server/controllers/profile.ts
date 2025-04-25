import Profile from '../models/profile.js';
import User from '../models/user.js';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { RequestWithAuth } from 'types/request.js';

// Create a new profile
export const createOrUpdateProfile = catchAsync(
	async (req: RequestWithAuth, res: Response, next: NextFunction) => {
		const userId = req.auth.id;
		const { bio, country, socials, wallets } = req.body;

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return next(new AppError('User not found', 404));
		}

		// Check if profile already exists for this user
		let profile = await Profile.findOne({ user: userId });
		let message = 'Profile updated successfully';
		let statusCode = 200;

		if (!profile) {
			// Create new profile
			profile = await Profile.create({
				user: userId,
				bio,
				country,
				socials,
				wallets,
			});
			message = 'Profile created successfully';
			statusCode = 201;
		} else {
			// Security check: Verify the authenticated user owns this profile
			if (profile.user.toString() !== userId) {
				return next(
					new AppError('You are not authorized to update this profile', 403)
				);
			}

			// Update existing profile
			profile = await Profile.findOneAndUpdate(
				{ user: userId },
				{
					bio: bio || profile.bio,
					country: country || profile.country,
					socials: {
						x: socials?.x || profile.socials?.x || '',
						facebook: socials?.facebook || profile.socials?.facebook || '',
						linkedin: socials?.linkedin || profile.socials?.linkedin || '',
						github: socials?.github || profile.socials?.github || '',
						youtube: socials?.youtube || profile.socials?.youtube || '',
					},
					wallets: {
						sui: wallets?.sui || profile.wallets?.sui || '',
						solana: wallets?.solana || profile.wallets?.solana || '',
						ethereum: wallets?.ethereum || profile.wallets?.ethereum || '',
					},
				},
				{ new: true, runValidators: true }
			);
		}

		res.status(statusCode).json({
			status: 'success',
			message,
			data: profile,
		});
	}
);

// Get profile by username
export const getProfileByUsername = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const username = req.params.username;

		const user = await User.findOne({ username });

		if (!user) {
			return next(new AppError('User not found', 404));
		}

		const userId = user?._id;
		const profile = await Profile.findOne({ user: userId }).populate(
			'user',
			'name username createdAt'
		);

		if (!profile) {
			return next(new AppError('Profile not found', 404));
		}

		res.status(200).json({
			status: 'success',
			data: profile,
		});
	}
);

// Get my profile
export const getMyProfile = catchAsync(
	async (req: RequestWithAuth, res: Response, next: NextFunction) => {
		// Assuming req.user is set from authentication middleware
		const userId = req.auth.id;

		if (!userId) {
			return next(
				new AppError('You must be logged in to access your profile', 401)
			);
		}

		const profile = await Profile.findOne({ user: userId }).populate(
			'user',
			'name username email'
		);

		if (!profile) {
			return next(
				new AppError('Profile not found. Please create one first.', 404)
			);
		}

		res.status(200).json({
			status: 'success',
			data: profile,
		});
	}
);

// Delete profile
export const deleteProfile = catchAsync(
	async (req: RequestWithAuth, res: Response, next: NextFunction) => {
		// Assuming req.user is set from authentication middleware
		const userId = req.auth.id;

		if (!userId) {
			return next(
				new AppError('You must be logged in to delete your profile', 401)
			);
		}

		const profile = await Profile.findOneAndDelete({ user: userId });

		if (!profile) {
			return next(new AppError('Profile not found', 404));
		}

		res.status(200).json({
			status: 'success',
			message: 'Profile deleted successfully',
			data: null,
		});
	}
);

// Search profiles by country
export const searchProfilesByCountry = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { country } = req.query;

		if (!country) {
			return next(new AppError('Country parameter is required', 400));
		}

		const profiles = await Profile.find({
			country: { $regex: country as string, $options: 'i' },
		}).populate('user', 'name username');

		res.status(200).json({
			status: 'success',
			results: profiles.length,
			data: profiles,
		});
	}
);

// Get profile by platform username
export const getProfileByPlatformUsername = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { platform } = req.body;
		const { username } = req.params;

		if (!platform || !username) {
			return next(new AppError('Platform and username are required', 400));
		}

		const profile = await Profile.findOne({
			[`socials.${platform}`]: username,
		}).populate('user', 'name username createdAt');
		console.log('profile', profile);

		if (!profile) {
			return next(new AppError('Profile not found', 404));
		}

		res.status(200).json({
			status: 'success',
			data: profile,
		});
	}
);
