import express from 'express';
import {
	getProfileByUsername,
	getProfileByPlatformUsername,
	createOrUpdateProfile,
} from '../controllers/profile.js';
import { isLoggedIn } from '../controllers/auth.js';

const router = express.Router();

router.post('/', isLoggedIn, createOrUpdateProfile);
router.get('/:username', getProfileByUsername);
router.post('/find/:username', getProfileByPlatformUsername);

export default router;
