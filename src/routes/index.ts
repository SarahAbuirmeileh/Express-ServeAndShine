import express from "express";
import { putCertificateTemplate } from "../controllers/AWS-services/AWS-S3.js";
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("index");
});


router.post("/:id",  async (req, res, next) => {
  const images = req.files?.image;
  if (!images) {
      return res.status(400).send("No images provided.");
  }

  try {
      const uploadedFiles = Array.isArray(images) ? images : [images];

      await putCertificateTemplate(Number(req.params.id), uploadedFiles);

      res.status(201).send("Images added successfully!!");
  } catch (err) {

      next(err);
  }
});

export default router;
