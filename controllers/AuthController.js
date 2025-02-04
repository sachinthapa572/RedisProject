import vine, { errors } from "@vinejs/vine";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import prisma from "../DB/db.config.js";
import { emailQueue, emailQueueName } from "../jobs/SendEmailJob.js";
import { loginSchema, registerSchema } from "../validations/authValidation.js";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */
class AuthController {
    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *               password_confirmation:
     *                 type: string
     *     responses:
     *       200:
     *         description: User created successfully
     *       400:
     *         description: Validation error
     *       500:
     *         description: Internal server error
     */
    static async register(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(registerSchema);
            const payload = await validator.validate(body);

            //   * Check if email exist
            const findUser = await prisma.users.findUnique({
                where: {
                    email: payload.email,
                },
            });

            if (findUser) {
                return res.status(400).json({
                    errors: {
                        email: "Email already taken.please use another one.",
                    },
                });
            }

            //   * Encrypt the password
            const salt = bcrypt.genSaltSync(10);
            payload.password = bcrypt.hashSync(payload.password, salt);

            const user = await prisma.users.create({
                data: payload,
            });
            return res.json({
                status: 200,
                message: "User created successfully",
                user,
            });
        } catch (error) {
            console.log("The error is", error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                // console.log(error.messages);
                return res.status(400).json({ errors: error.messages });
            } else {
                return res.status(500).json({
                    status: 500,
                    message: "Something went wrong.Please try again.",
                });
            }
        }
    }

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Login a user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Logged in
     *       400:
     *         description: Validation error
     *       500:
     *         description: Internal server error
     */
    static async login(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(loginSchema);
            const payload = await validator.validate(body);

            //   * Find user with email
            const findUser = await prisma.users.findUnique({
                where: {
                    email: payload.email,
                },
            });

            if (findUser) {
                if (!bcrypt.compareSync(payload.password, findUser.password)) {
                    return res.status(400).json({
                        errors: {
                            email: "Invalid Credentials.",
                        },
                    });
                }

                // * Issue token to user
                const payloadData = {
                    id: findUser.id,
                    name: findUser.name,
                    email: findUser.email,
                    profile: findUser.profile,
                };
                const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
                    expiresIn: "365d",
                });

                return res.json({
                    message: "Logged in",
                    access_token: `Bearer ${token}`,
                });
            }

            return res.status(400).json({
                errors: {
                    email: "No user found with this email.",
                },
            });
        } catch (error) {
            console.log("The error is", error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                // console.log(error.messages);
                return res.status(400).json({ errors: error.messages });
            } else {
                return res.status(500).json({
                    status: 500,
                    message: "Something went wrong.Please try again.",
                });
            }
        }
    }

    /**
     * @swagger
     * /send-email:
     *   get:
     *     summary: Send a test email
     *     tags: [Auth]
     *     parameters:
     *       - in: query
     *         name: email
     *         schema:
     *           type: string
     *         required: true
     *         description: Email address to send the test email to
     *     responses:
     *       200:
     *         description: Job added successfully to send the Mail
     *       500:
     *         description: Internal server error
     */
    // * Send test email
    static async sendTestEmail(req, res) {
        try {
            const { email } = req.query;

            const payload = [
                {
                    toEmail: email,
                    subject: "Hey I am just testing",
                    body: "<h1>Hello World , I am from Gaindakot hai .</h1>",
                },
                {
                    toEmail: email,
                    subject: "You got an amazing",
                    body: "<h1>Hello Sachin ,  you got this amazing offer.</h1>",
                },
                {
                    toEmail: email,
                    subject: "Offers offers ... ",
                    body: "<h1>Its so cold like the offers we provide </h1>",
                },
            ];

            await emailQueue.add(emailQueueName, payload);

            return res.json({ status: 200, message: "Job added successfully to send the Mail " });
        } catch (error) {
            logger.error({ type: "Email Error", body: error });
            return res
                .status(500)
                .json({ message: "Something went wrong.pls try agian later." });
        }
    }
}

export default AuthController;
