import express from 'express';
import sportRoutes from './modules/sport/routes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/sport', sportRoutes);

app.get('/', (_req, res) => {
  res.send('Hello, world!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
