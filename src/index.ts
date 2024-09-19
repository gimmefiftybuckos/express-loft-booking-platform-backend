import express from 'express';
import cors from 'cors';

import routes from './routes';

const app = express();
app.use(express.json());

app.use(
   cors({
      origin: 'http://localhost:5173',
      methods: 'GET,POST,PUT,DELETE',
      credentials: true,
   })
);

app.use(routes);

app.listen(3000, () => {
   console.log('Server is running on http://localhost:3000');
});
