import express from 'express';
import {
	login,
	register,
	getCurrentUser,
	isLoggedIn,
} from '../controllers/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/current-user', isLoggedIn, getCurrentUser);

export default router;
