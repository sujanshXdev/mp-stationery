import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Joi from "joi";

dotenv.config({ path: "backend/config/config.env" });

const envVarsSchema = Joi.object({
  EMAIL_HOST: Joi.string().required(),
  EMAIL_SERVICE: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),
  EMAIL_SECURE: Joi.boolean().required(),
  EMAIL_USER: Joi.string().required(),
  EMAIL_PASS: Joi.string().required(),
})
  .unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: envVars.EMAIL_HOST,
      service: envVars.EMAIL_SERVICE,
      port: Number(envVars.EMAIL_PORT),
      secure: Boolean(envVars.EMAIL_SECURE),
      auth: {
        user: envVars.EMAIL_USER,
        pass: envVars.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: envVars.EMAIL_USER,
      to: email,
      subject: subject,
      html: message,
      text: message.replace(/<[^>]*>/g, ''),
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Email not sent", error.message);
    return false;
  }
};

export default sendEmail;
