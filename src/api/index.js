import { Router } from 'express';

import { version } from '../../package.json';
import inventory from '../../data/produce.json';

export default () => {
	let api = Router();

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	api.get('/v1/product', (req, res) => {
		res.json(inventory);
	});

	api.get('/v1/product/:id', (req, res) => {
		const id = parseInt(req.params.id, 10);
		const record = inventory.find(item => item.id === id);
		if (record) {
			res.json({
				message: 'Success',
				item: record
			})
		} else {
			res.status(400).json({
				status: res.status,
				message: `หา item รหัส ${id} ไม่เจอ`
			})
		}
	});

	return api;
}
