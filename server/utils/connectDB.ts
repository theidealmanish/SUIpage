import mongoose from 'mongoose';

export default function connectDB(DBUri: string) {
	mongoose
		.connect(DBUri)
		.then(() => {
			console.log('MongoDB connected');
		})
		.catch((err) => {
			console.error('MongoDB connection error:', err);
		});
}
