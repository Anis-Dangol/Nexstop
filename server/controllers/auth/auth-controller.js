import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

// register
export const registerUser = async (req, res) => {
    const { userName, email, password } = req.body;
    console.log(userName, email, password);

    try {
        const checkUser = await User.findOne({ email });
        if (checkUser) return res.json({ success: false, message: "User already exists with this email. Please Try Again!!!", });

        const hashPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            userName,
            email,
            password: hashPassword,
        });

        await newUser.save();
        res.status(200).json({
            success: true,
            message: "Registration successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error in Registering User",
        });
    }
};

//login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const checkUser = await User.findOne({ email });
        if (!checkUser) return res.json({ success: false, message: "User does not exist with this email. Please Register An Account!!!" });

        const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
        if (!checkPasswordMatch) return res.json({ success: false, message: "Invalid Password. Please Try Again!!!" });

        const token = jwt.sign({
            id : checkUser._id, 
            role : checkUser.role, 
            email : checkUser.email,
            userName : checkUser.userName,
        }, 'CLIENT_SECRET_KEY', { expiresIn: '60000m' });

        res.cookie('token', token, { httpOnly: true, secure: false}).json({ 
            success: true, 
            message: "Login Successfully", 
            user : {
                email : checkUser.email,
                role : checkUser.role,
                id : checkUser._id,
                userName : checkUser.userName,
            }
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Some error occured",
        });
    }
}

//logout

export const logoutUser = (req, res) => {
    res.clearCookie('token').json({ 
        success: true, 
        message: "Logout Successfully!!!", 
    });
}

// auth middleware
export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ 
        success: false, 
        message: "Unauthorized User!" 
    });

    try {
        const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: "Unauthorized User!" 
        });
    }
}


