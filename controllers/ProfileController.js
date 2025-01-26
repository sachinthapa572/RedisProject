import prisma from "../DB/db.config.js";
import { generateRandomNum, imageValidator } from "../utils/helper.js";

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Profile management endpoints
 */
class ProfileController {
  /**
   * @swagger
   * /profile:
   *   get:
   *     summary: Get user profile
   *     tags: [Profile]
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: integer
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     name:
   *                       type: string
   *                     email:
   *                       type: string
   *                     profile:
   *                       type: string
   *       500:
   *         description: Internal server error
   */
  static async index(req, res) {
    try {
      const user = req.user;
      return res.json({ status: 200, user });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong!" });
    }
  }

  /**
   * @swagger
   * /profile/{id}:
   *   put:
   *     summary: Update user profile
   *     tags: [Profile]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               profile:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *       400:
   *         description: Validation error
   *       500:
   *         description: Internal server error
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      if (!req.files || Object.keys(req.files).length === 0) {
        return res
          .status(400)
          .json({ status: 400, message: "Profile image is required." });
      }

      const profile = req.files.profile;
      const message = imageValidator(profile?.size, profile.mimetype);
      if (message !== null) {
        return res.status(400).json({
          errors: {
            profile: message,
          },
        });
      }

      const imgExt = profile?.name.split(".");
      const imageName = generateRandomNum() + "." + imgExt[1];
      const uploadPath = process.cwd() + "/public/images/" + imageName;

      profile.mv(uploadPath, (err) => {
        if (err) throw err;
      });

      await prisma.users.update({
        data: {
          profile: imageName,
        },
        where: {
          id: Number(id),
        },
      });

      return res.json({
        status: 200,
        message: "Profile updated successfully!",
      });
    } catch (error) {
      console.log("The error is", error);
      return res
        .status(500)
        .json({ message: "Something went wrong.please try again!" });
    }
  }

  static async destroy() {}
}

export default ProfileController;
