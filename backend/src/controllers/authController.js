const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });
    
    return res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully'
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: {},
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const result = await authService.getUserProfile(req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'User profile retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
