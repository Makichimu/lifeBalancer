import express from 'express';
import path from 'path';
import sportRoutes from './modules/sport/routes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/sport', sportRoutes);

app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/sport-demo', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'sport-demo.html'));
});

app.get('/', (_req, res) => {
  res.send('Hello, world!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
