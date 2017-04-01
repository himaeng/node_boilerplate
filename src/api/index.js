import { version } from '../../package.json';
import { Router } from 'express';

export default () => {
	let api = Router();

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
