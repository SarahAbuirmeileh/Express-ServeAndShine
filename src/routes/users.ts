// import express from 'express';
// import { getAllUsersController, loginController, signupController } from '../controllers/user.js';
// const router = express.Router();

// /* POST Signup user. */
// router.post("/signup", async (req: express.Request, res: express.Response) => {
//   try {
//     if (req.body.userName && req.body.password && req.body.email) {
//       await signupController(req.body)
//       res.status(200).json("User created successfully");
//     } else {
//       res.status(400).json("All fields are required");
//     }
//   } catch (error) {
//     console.log(error);
//     if (error !== "user already exists") {
//       res.status(500).json("Internal server error");
//     }
//     res.status(409).json("user already exists");
//   }
// });

// /* POST Login user. */
// router.post("/login", async (req: express.Request, res: express.Response) => {
//   try {
//     if (req.body.email && req.body.password) {
//       const data = await loginController(req.body)
//       res.status(200).json(data);
//     } else {
//       res.status(400).json("All fields are required");
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(400).json("invalid email or password");
//   }
// });


// /* GET All users. */
// router.get("/", async (req: express.Request, res: express.Response) => {
//   try {
//     const users = await getAllUsersController();
//     res.status(200).json({ users: users[0], count: users[1] });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json("Internal server error");
//   }
// })


// export default router;
