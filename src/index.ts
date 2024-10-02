import express from 'express';
import cors from 'cors';

import routes from './routes';

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use(
   cors({
      origin: '*',
      methods: 'GET,POST,PUT,DELETE',
      credentials: true,
   })
);

app.use(routes);

app.listen(port, () => {
   console.log('Server is running on http://localhost:3000');
});
