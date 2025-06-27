import "server-only";

import nodemailer, { Transporter } from "nodemailer";
import server_env from "@/utils/env.server";

// Create transporter once
const transporter: Transporter = nodemailer.createTransport({
  service: server_env.SMTP_HOST,
  auth: {
    user: server_env.SMTP_USER,
    pass: server_env.SMTP_PASSWORD,
  },
});

// Verify email transporter connection status
transporter
  .verify()
  // .then(() => {
  //   console.log("Email transporter is ready");
  // })
  .catch((error) => {
    console.error("Error with email transporter:", error);
  });

export default transporter;
