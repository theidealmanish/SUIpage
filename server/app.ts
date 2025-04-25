import express from 'express';
import { Request, Response } from 'express';
import connectDB from './utils/connectDB.js';
import globalError from './middlewares/globalError.js';
import notFound from './middlewares/notFound.js';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

// route imports
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';

// init app
const app = express();

// constants
const PORT = process.env.PORT || 8000;

// connect to database
connectDB((process.env.MONGO_URL as string) || '');

// middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(
	cors({
		origin: [
			'https://superpa.ge',
			'https://www.superpa.ge',
			'chrome-extension://gpohidbpkmkkcpffdeibpefjlbjlhfnn',
			'https://www.youtube.com/',
			'https://youtube.com/',
			'https://x.com/',
			'https://www.x.com/',
			'https://github.com',
			'https://www.github.com',
			'http://localhost:3000',
		],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
		credentials: true,
		preflightContinue: false,
		optionsSuccessStatus: 204,
	})
);

// routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// test route
app.use('/test', (req: Request, res: Response) => {
	res.json({ status: 'success', message: 'Test route' });
});

// not found
app.use('*', notFound);

// global error handler
app.use(globalError);

app.get('/', (req: Request, res: Response) => {
	res.json({ message: 'Hello World' });
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
