import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';


//routes....
//import authRoutes from './routes/authRoutes.js';   
import productRoutes from './routes/productRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';


//middleware error handler
import { errorHandler } from './middlewares/error.middleware.js';
const app = express();

//Security Middlewares

app.use(helmet());
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  // req.query is read-only in newer Express — don't touch it
  next();
});


//CORS cross-origin....
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionSuccessStatus: 200
}));

        //Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, //15 minutes
            max: 100, // limit @ to 100 request per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        app.use('/api', limiter);

        //BodyParsers..
        
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    //LOGGING
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined'));
    }

        //Heath check...
    app.get('/health', (req, res) => {
        res.status(200).json({

    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
        });
    });     

            //API ROUTES
 //app.use('/api/auth', authRoutes);           
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);


         //Handlers(404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

export default app;
