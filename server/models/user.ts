import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface User extends mongoose.Document {
	name: string;
	avatar: string;
	username: string;
	email: string;
	password: string;
	otpCode: string;
	comparePassword: (password: string) => Promise<boolean>;
	generateToken: () => string;
	generateOtpCode: () => string;
}

const userSchema = new mongoose.Schema<User>(
	{
		avatar: {
			type: String,
		},
		name: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		otpCode: {
			type: String,
		},
	},
	{ timestamps: true }
);

// encrypt password before saving
userSchema.pre<User>('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

// compare password
userSchema.methods.comparePassword = async function (password: string) {
	return await bcrypt.compare(password, this.password);
};

// generate the jwt token
userSchema.methods.generateToken = function () {
	const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
		expiresIn: '1d',
	});
	return token;
};

// generate the otp code
userSchema.methods.generateOtpCode = function () {
	const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
	this.otpCode = otpCode;
	return otpCode;
};

const User = mongoose.model<User>('User', userSchema);

export default User;
