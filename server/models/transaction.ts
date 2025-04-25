import mongoose from 'mongoose';

interface Transaction {
	from: String;
	to: mongoose.Schema.Types.ObjectId;
	transactionHash: string;
	amount: number;
	network: string;
}

const transactionSchema = new mongoose.Schema<Transaction>(
	{
		from: {
			type: String,
		},
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		transactionHash: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		network: {
			type: String,
			enum: ['Ethereum', 'Binance Smart Chain', 'SUI', 'Solana'],
			default: 'Ethereum',
		},
	},
	{ timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
