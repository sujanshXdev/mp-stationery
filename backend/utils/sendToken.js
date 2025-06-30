/**
 * Create token and save in the cookie
 * @param {Object} user - The user object
 * @param {Number} statusCode - The status code for the response
 * @param {Object} res - The response object
 */

const isProduction = process.env.NODE_ENV === "production";

const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  user.password = undefined;

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      sameSite: "lax", // Use "lax" for local development over HTTP
      secure: false, // Set to false for HTTP in development
      path: "/",
    })
    .json({
      success: true,
      token,
      user,
    });
};

export default sendToken;
