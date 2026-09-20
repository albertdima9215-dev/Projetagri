const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendPasswordResetCode = async (email, code) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Code de récupération de votre compte AgriConnect",

    text: `Votre code de récupération AgriConnect est : ${code}

Ce code expire dans 10 minutes.

Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        background: #f5f8f5;
      ">

        <div style="
          background: #2e7d32;
          padding: 20px;
          text-align: center;
          border-radius: 12px 12px 0 0;
        ">
          <h1 style="
            color: white;
            margin: 0;
          ">
            AgriConnect
          </h1>
        </div>

        <div style="
          background: white;
          padding: 30px;
          border-radius: 0 0 12px 12px;
        ">

          <h2 style="color: #26342a;">
            Réinitialisation du mot de passe
          </h2>

          <p style="color: #555;">
            Vous avez demandé à réinitialiser le mot de passe
            de votre compte AgriConnect.
          </p>

          <p style="color: #555;">
            Voici votre code de vérification :
          </p>

          <div style="
            text-align: center;
            margin: 25px 0;
          ">

            <span style="
              display: inline-block;
              padding: 15px 30px;
              background: #e8f5e9;
              color: #2e7d32;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              border-radius: 10px;
            ">
              ${code}
            </span>

          </div>

          <p style="color: #777;">
            Ce code expire dans <strong>10 minutes</strong>.
          </p>

          <p style="
            color: #777;
            font-size: 13px;
          ">
            Si vous n'êtes pas à l'origine de cette demande,
            vous pouvez ignorer cet email.
          </p>

          <hr style="
            border: none;
            border-top: 1px solid #eee;
            margin: 25px 0;
          ">

          <p style="
            text-align: center;
            color: #999;
            font-size: 12px;
          ">
            © AgriConnect
          </p>

        </div>
      </div>
    `,
  });
};

module.exports = {
  sendPasswordResetCode,
};