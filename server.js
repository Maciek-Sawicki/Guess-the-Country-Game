import express from 'express'; 
import session from 'express-session';
import gameRoutes from './routes/gameRoutes.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(session({
  secret: 'your-secret-key', // Zmień na bezpieczny sekret w produkcji
  resave: false,
  saveUninitialized: true,
  cookie: {
      secure: false, // Ustaw na true, jeśli używasz HTTPS
      httpOnly: true,
      maxAge: 3600000, // Czas życia sesji w milisekundach
  },
}));

app.use('/api', gameRoutes); 

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
