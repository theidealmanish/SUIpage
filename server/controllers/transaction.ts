import catchAsync from '@/utils/catchAsync.js';
import Transaction from '@/models/transaction.js';
import { NextFunction, Request, Response } from 'express';

// create transaction
export const createTransaction = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { from, to, transactionHash, amount, type, status } = req.body;

		const newTransaction = await Transaction.create({
			from,
			to,
			transactionHash,
			amount,
			type,
			status,
		});

		res.status(201).json({
			status: 'success',
			message: 'Transaction created successfully',
			data: newTransaction,
		});
	}
);
