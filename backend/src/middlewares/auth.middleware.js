// //auth middleware...

// //purpose
// //verify jwt tokens
// //attach user request objects
// //Restrict routes by role

// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';
// import asyncHandler from '../utils/asyncHandler.js';
// import ApiError from '../utils/ApiError.js';


// export const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   // Extract token from Authorization header
//   // Expected format: "Bearer <token>"
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   // Check if token exists
//   if (!token) {
//     throw new ApiError(401, 'Not authorized. Please log in to access this resource.');
//   }

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');

//     // Find user by ID from token
//     const foundUser = await User.findById(decoded.id).select('-refreshToken');

//     if (!foundUser) {
//       throw new ApiError(401, 'User no longer exists. Please log in again.');
//     }

//     // Check if user account is active
//     if (!foundUser.isActive) {
//       throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
//     }

//     // Attach user to request object for use in route handlers
//     req.user = foundUser;
//     next();
//   } catch (error) {
//     if (error.name === 'JsonWebTokenError') {
//       throw new ApiError(401, 'Invalid token. Please log in again.');
//     }
//     if (error.name === 'TokenExpiredError') {
//       throw new ApiError(401, 'Token expired. Please log in again.');
//     }
//     throw error;
//   }
// });

// /**
//  * @desc    Restrict route access by role
//  * @usage   Use after protect middleware
//  * 
//  * @param   {...String} roles - Allowed roles (e.g., 'admin', 'user')
//  * 
//  * EXAMPLE:
//  * router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);
//  * router.get('/dashboard', protect, restrictTo('admin', 'manager'), getDashboard);
//  */
// export const restrictTo = (...roles) => {
//   return (req, res, next) => {
//     // Check if user's role is in the allowed roles
//     if (!roles.includes(req.user.role)) {
//       throw new ApiError(
//         403,
//         'You do not have permission to perform this action'
//       );
//     }
//     next();
//   };
// };

// /**
//  * @desc    Optional authentication - attach user if token exists
//  * @usage   For routes that work both with and without authentication
//  * 
//  * DIFFERENCE FROM protect:
//  * - Does NOT throw error if token is missing
//  * - Silently continues if no token or invalid token
//  * - Useful for content that's available to everyone but personalized for logged-in users
//  * 
//  * EXAMPLE:
//  * router.get('/products', optionalAuth, getProducts);
//  * // If logged in: req.user exists, show personalized content
//  * // If not logged in: req.user is undefined, show generic content
//  */
// export const optionalAuth = asyncHandler(async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   if (!token) {
//     return next(); // Continue without authentication
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
//     const foundUser = await User.findById(decoded.id).select('-refreshToken');

//     if (foundUser && foundUser.isActive) {
//       req.user = foundUser;
//     }
//   } catch (error) {
//     // Silently ignore token errors for optional auth
//     console.log('Optional auth token invalid:', error.message);
//   }

//   next();
// });