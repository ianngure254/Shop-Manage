// import User from '../models/User.js';
// import asyncHandler from '../utils/asyncHandler.js';
// import ApiError from '../utils/ApiError.js';
// import jwt from 'jsonwebtoken';

// //Register user..
// export const register = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body;

//   // Check if any admin exists
//   const adminExists = await User.findOne({ role: 'admin' });

//   //if Admin exists, login instead
//   if(adminExists){
//     return res.status(200).json({
//       success: true,
//       message: 'Admin already exists. Please login.',
//       data: null
//     });
//   }

//   //validation
//   if(!name || !email || !password) {
//     throw new ApiError(400, 'Please provide all the required fields');
//   }

//   //check if email is taken
//   const emailExisting = await User.findOne({ email });
//   if(emailExisting) {
//     throw new ApiError(400, 'The email is already in use');
//   }

//   // first User is the Admin
//   const newUser = await User.create({
//     name,
//     email,
//     password,
//     role: 'admin'
//   });

//   const accessToken = newUser.generateAccessToken();
//   const refreshToken = newUser.generateRefreshToken();

//   newUser.refreshToken = refreshToken;
//   await newUser.save();

//   res.status(201).json({
//     success: true,
//     message: 'Admin account created successfully',
//     data: {
//       user: {
//         _id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role
//       },
//       accessToken,
//       refreshToken
//     }
//   });
// });

// //login user
// export const login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     throw new ApiError(400, 'Please provide email and password');
//   }

//   const foundUser = await User.findOne({ email }).select('+password');
//   if (!foundUser) {
//     throw new ApiError(401, 'Invalid email or password');
//   }

//   if (!foundUser.isActive) {
//     throw new ApiError(403, 'Your account has been deactivated');
//   }

//   const isPasswordCorrect = await foundUser.comparePassword(password);
//   if (!isPasswordCorrect) {
//     throw new ApiError(401, 'Invalid email or password');
//   }

//   const accessToken = foundUser.generateAccessToken();
//   const refreshToken = foundUser.generateRefreshToken();

//   foundUser.refreshToken = refreshToken;
//   foundUser.lastLogin = new Date();
//   await foundUser.save();

//   res.status(200).json({
//     success: true,
//     message: 'Login successful',
//     data: {
//       user: {
//         _id: foundUser._id,
//         name: foundUser.name,
//         email: foundUser.email,
//         role: foundUser.role,
//         lastLogin: foundUser.lastLogin
//       },
//       accessToken,
//       refreshToken
//     }
//   });
// });


// // Logout user
// export const logout = asyncHandler(async (req, res) => {
//   await User.findByIdAndUpdate(req.user.id, {
//     $unset: { refreshToken: 1 }
//   });

//   res.status(200).json({
//     success: true,
//     message: 'Logout successful'
//   });
// });

// // Get current user
// export const getMe = asyncHandler(async (req, res) => {
//   const foundUser = await User.findById(req.user.id);

//   res.status(200).json({
//     success: true,
//     data: { user: foundUser }
//   });
// });

// // Update user profile
// export const updateProfile = asyncHandler(async (req, res) => {
//   const { name, email } = req.body;

//   if (email && email !== req.user.email) {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       throw new ApiError(409, 'Email already in use');
//     }
//   }

//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     { name, email },
//     { new: true, runValidators: true }
//   );

//   res.status(200).json({
//     success: true,
//     message: 'Profile updated successfully',
//     data: { user: updatedUser }
//   });
// });

// // Change password
// export const changePassword = asyncHandler(async (req, res) => {
//   const { currentPassword, newPassword } = req.body;

//   if (!currentPassword || !newPassword) {
//     throw new ApiError(400, 'Please provide current and new password');
//   }

//   const foundUser = await User.findById(req.user.id).select('+password');

//   const isPasswordCorrect = await foundUser.comparePassword(currentPassword);
//   if (!isPasswordCorrect) {
//     throw new ApiError(401, 'Current password is incorrect');
//   }

//   foundUser.password = newPassword;
//   await foundUser.save();

//   res.status(200).json({
//     success: true,
//     message: 'Password changed successfully'
//   });
// });

// // Refresh access token
// export const refreshToken = asyncHandler(async (req, res) => {
//   const { refreshToken } = req.body;

//   if (!refreshToken) {
//     throw new ApiError(400, 'Refresh token is required');
//   }

//   const decoded = jwt.verify(
//     refreshToken,
//     process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
//   );

//   const foundUser = await User.findById(decoded.id).select('+refreshToken');
//   if (!foundUser || foundUser.refreshToken !== refreshToken) {
//     throw new ApiError(401, 'Invalid refresh token');
//   }

//   const newAccessToken = foundUser.generateAccessToken();

//   res.status(200).json({
//     success: true,
//     data: { accessToken: newAccessToken }
//   });
// });

// // ADMIN ROUTES

// // Get all users
// export const getAllUsers = asyncHandler(async (req, res) => {
//   const { page = 1, limit = 10, isActive } = req.query;

//   const filter = {};
//   if (isActive !== undefined) filter.isActive = isActive === 'true';

//   const skip = (page - 1) * limit;

//   const [users, total] = await Promise.all([
//     User.find(filter)
//       .select('-refreshToken')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit)),
//     User.countDocuments(filter)
//   ]);

//   res.status(200).json({
//     success: true,
//     data: {
//       users,
//       pagination: {
//         total,
//         page: parseInt(page),
//         pages: Math.ceil(total / limit)
//       }
//     }
//   });
// });

// // Delete user
// export const deleteUser = asyncHandler(async (req, res) => {
//   const foundUser = await User.findById(req.params.id);

//   if (!foundUser) {
//     throw new ApiError(404, 'User not found');
//   }

//   if (foundUser._id.toString() === req.user.id) {
//     throw new ApiError(400, 'You cannot delete your own account');
//   }

//   await foundUser.deleteOne();

//   res.status(200).json({
//     success: true,
//     message: 'User deleted successfully'
//   });
// });

// // Toggle user status
// export const toggleUserStatus = asyncHandler(async (req, res) => {
//   const foundUser = await User.findById(req.params.id);

//   if (!foundUser) {
//     throw new ApiError(404, 'User not found');
//   }

//   if (foundUser._id.toString() === req.user.id) {
//     throw new ApiError(400, 'You cannot deactivate your own account');
//   }

//   foundUser.isActive = !foundUser.isActive;
//   await foundUser.save();

//   res.status(200).json({
//     success: true,
//     message: `User ${foundUser.isActive ? 'activated' : 'deactivated'} successfully`,
//     data: { user: foundUser }
//   });
// });
