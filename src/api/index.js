import { version } from '../../package.json';
import { Router } from 'express';

export default () => {
	let api = Router();

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	api.get('/v1/product', (req, res) => {
		res.json(inventory);
	})

	return api;
}
