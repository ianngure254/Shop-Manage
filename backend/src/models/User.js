// import mongoose from 'mongoose';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

// const userSchema = mongoose.Schema ({

//   name: {
//      type: String,
//     required: [true, 'Name is required'],
//     trim: true
//   },
//   email: {    
//     type : String,
//     required : [true, 'Email is required'],
//     unique: true,
//       lowercase: true,
//       trim: true,
//       match: [
//         /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
//         'Please provide a valid email'
//       ]
    
// },

// password : {
//     type : String,
//      required: [true, 'Password is required'],
//       minlength: [6, 'Password must be at least 6 characters'],
//       select: false
// },
//         role : {
//      type: String,
//       enum: ['admin'],
//       default: 'admin'
            
//         },
//         refreshToken: {
//           type: String,
//           select: false
//         },

//         isActive: {
//           type: Boolean,
//           default: true
//         },
        
//         lastLogin: {
//           type: Date,
//           default: Date.now
//         }

// },
// {
//     timestamps: true,
//     toJSON: {virtual: true },
//     toObject: { virtuals: true }
// }

// );

// //hashpassword
//     userSchema.pre("save", async function () {
//     if(!this.isModified("password")) return;
//     this.password = await bcrypt.hash(this.password, 10);

//     });

//     //compare passwords
//     userSchema.methods.comparePassword = async function (password) {
//         return await bcrypt.compare(password, this.password)

//     };


//         //Generate Access Tokens(jwt)
//     userSchema.methods.generateAccessToken = function () {
//     return jwt.sign(
//     { 
//       id: this._id, 
//       email: this.email, 
//       role: this.role 
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRE || '7d' }
//   );
// };

// // Generate refresh token
// userSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     { id: this._id },
//     process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
//     { expiresIn: '30d' }
//   );
// };


// // REMOVE SENSITIVE DATA FROM JSON

// userSchema.methods.toJSON = function () {
//   const user = this.toObject();
//   delete user.password;
//   delete user.refreshToken;
//   delete user.__v;
//   return user;
// };



// export default mongoose.model("User", userSchema);

        
