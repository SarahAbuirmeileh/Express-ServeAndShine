import express from "express";
import { putCertificateTemplate } from "../controllers/AWS-services/AWS-S3.js";
import { invokeLambdaFunction } from "../controllers/AWS-services/AWS-Lambda.js";
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("index");
});


router.post("/",  async (req, res, next) => {
  // 
  invokeLambdaFunction("generateCertificate",{ volunteerName:"Sarah", date:"12 october 2023", voluntaryWorkName:"Hello word",
   imageUrl:"https://volunteers-certificates.s3.eu-west-2.amazonaws.com/templates/general/certificate-template.jpeg"})
   .then(d=>console.log(d))
   .catch(r=>console.log(r))
  
});

export default router;
