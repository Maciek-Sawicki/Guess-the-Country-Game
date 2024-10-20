import express from 'express'; 
import gameRoutes from './routes/gameRoutes.js';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/api', gameRoutes); 

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
