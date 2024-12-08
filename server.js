import express from 'express'; 
import session from 'express-session';
import gameRoutes from './routes/gameRoutes.js';
import cors from 'cors'; 

const corsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true, 
};

const app = express();
const port = 3000;

app.use(cors(corsOptions));
app.use(express.json());
app.use(
  session({
      secret: 'key', 
      resave: false,
      saveUninitialized: false,
      cookie: {
          secure: false, 
          maxAge: 24 * 60 * 60 * 1000 
      }
  })
);

app.use('/api', gameRoutes); 

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
