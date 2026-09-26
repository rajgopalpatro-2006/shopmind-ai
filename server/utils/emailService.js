const nodemailer = require("nodemailer");

// =====================================================
// CREATE EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// =====================================================
// CHECK EMAIL CONFIGURATION
// =====================================================

const checkEmailConfiguration = () => {
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_APP_PASSWORD
  ) {
    throw new Error(
      "Email credentials are missing from .env"
    );
  }
};

// =====================================================
// SEND PASSWORD RESET EMAIL
// =====================================================

const sendPasswordResetEmail = async (
  email,
  resetCode
) => {
  try {
    checkEmailConfiguration();

    const mailOptions = {
      from: {
        name: "ShopMind AI",
        address: process.env.EMAIL_USER,
      },

      to: email,

      subject:
        "ShopMind AI - Password Reset Code",

      // ===============================================
      // PLAIN TEXT VERSION
      // ===============================================

      text: `
ShopMind AI Password Reset

We received a request to reset the password for your ShopMind AI account.

Your verification code is:

${resetCode}

This code will expire in 10 minutes.

If you did not request a password reset, you can ignore this email.

For your security, never share this verification code with anyone.

ShopMind AI
      `.trim(),

      // ===============================================
      // HTML VERSION
      // ===============================================

      html: `
        <div
          style="
            margin: 0;
            padding: 30px 15px;
            background-color: #f1f5f9;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <div
            style="
              max-width: 520px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 8px 30px rgba(0,0,0,0.08);
            "
          >

            <!-- HEADER -->

            <div
              style="
                background: linear-gradient(
                  135deg,
                  #2563eb,
                  #4f46e5
                );
                padding: 30px;
                text-align: center;
                color: white;
              "
            >
              <div
                style="
                  font-size: 42px;
                  margin-bottom: 10px;
                "
              >
                🛍️
              </div>

              <h1
                style="
                  margin: 0;
                  font-size: 26px;
                "
              >
                ShopMind AI
              </h1>

              <p
                style="
                  margin: 8px 0 0;
                  opacity: 0.9;
                  font-size: 14px;
                "
              >
                AI-Powered Shopping Assistant
              </p>
            </div>

            <!-- CONTENT -->

            <div
              style="
                padding: 35px 30px;
                color: #1e293b;
              "
            >
              <h2
                style="
                  margin-top: 0;
                  margin-bottom: 15px;
                  text-align: center;
                  font-size: 22px;
                "
              >
                Reset Your Password
              </h2>

              <p
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #475569;
                "
              >
                We received a request to reset
                the password for your ShopMind AI
                account.
              </p>

              <p
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #475569;
                "
              >
                Enter the following 6-digit
                verification code in ShopMind AI:
              </p>

              <!-- OTP CODE -->

              <div
                style="
                  margin: 30px 0;
                  text-align: center;
                "
              >
                <div
                  style="
                    display: inline-block;
                    background: #eff6ff;
                    border: 2px dashed #2563eb;
                    border-radius: 12px;
                    padding: 18px 30px;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #1d4ed8;
                  "
                >
                  ${resetCode}
                </div>
              </div>

              <p
                style="
                  text-align: center;
                  color: #64748b;
                  font-size: 14px;
                "
              >
                ⏱️ This code will expire in
                <strong>10 minutes</strong>.
              </p>

              <!-- SECURITY WARNING -->

              <div
                style="
                  margin-top: 30px;
                  padding: 16px;
                  background: #fff7ed;
                  border-radius: 10px;
                  color: #9a3412;
                  font-size: 13px;
                  line-height: 1.6;
                "
              >
                🔐
                <strong>
                  Security notice:
                </strong>

                Never share this verification
                code with anyone.

                ShopMind AI will never ask you
                to provide this code outside
                the password-reset process.
              </div>

              <p
                style="
                  margin-top: 25px;
                  color: #64748b;
                  font-size: 13px;
                  line-height: 1.6;
                "
              >
                If you did not request a password
                reset, you can safely ignore this
                email. Your password will remain
                unchanged.
              </p>
            </div>

            <!-- FOOTER -->

            <div
              style="
                background: #f8fafc;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
              "
            >
              <p
                style="
                  margin: 0;
                  color: #94a3b8;
                  font-size: 12px;
                "
              >
                © ${new Date().getFullYear()}
                ShopMind AI
              </p>

              <p
                style="
                  margin: 6px 0 0;
                  color: #94a3b8;
                  font-size: 12px;
                "
              >
                Shop smarter with AI.
              </p>
            </div>

          </div>
        </div>
      `,
    };

    // ===============================================
    // SEND EMAIL
    // ===============================================

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "Password reset email sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Password reset email error:",
      error.message
    );

    throw error;
  }
};

// =====================================================
// SEND LOGIN SECURITY EMAIL
// =====================================================

const sendLoginSecurityEmail = async (
  email,
  userName = "ShopMind AI User"
) => {
  try {
    checkEmailConfiguration();

    // ===============================================
    // LOGIN DATE AND TIME
    // ===============================================

    const loginDate =
      new Date();

    const formattedDate =
      loginDate.toLocaleString(
        "en-IN",
        {
          timeZone:
            "Asia/Kolkata",

          dateStyle:
            "medium",

          timeStyle:
            "medium",
        }
      );

    // ===============================================
    // EMAIL OPTIONS
    // ===============================================

    const mailOptions = {
      from: {
        name:
          "ShopMind AI Security",

        address:
          process.env.EMAIL_USER,
      },

      to: email,

      subject:
        "ShopMind AI - New Login Detected",

      // =============================================
      // PLAIN TEXT VERSION
      // =============================================

      text: `
ShopMind AI Security Alert

Hello ${userName},

A successful login was detected on your ShopMind AI account.

Account: ${email}
Date & Time: ${formattedDate}

If this was you, no action is required.

If you do not recognize this login, reset your password immediately using the Forgot Password option.

For your security, never share your password or verification codes with anyone.

ShopMind AI Security
      `.trim(),

      // =============================================
      // HTML VERSION
      // =============================================

      html: `
        <div
          style="
            margin: 0;
            padding: 30px 15px;
            background-color: #f1f5f9;
            font-family: Arial, Helvetica, sans-serif;
          "
        >

          <div
            style="
              max-width: 540px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow:
                0 8px 30px
                rgba(0, 0, 0, 0.08);
            "
          >

            <!-- HEADER -->

            <div
              style="
                background:
                  linear-gradient(
                    135deg,
                    #2563eb,
                    #4f46e5
                  );
                padding: 30px;
                text-align: center;
                color: #ffffff;
              "
            >

              <div
                style="
                  font-size: 42px;
                  margin-bottom: 10px;
                "
              >
                🔐
              </div>

              <h1
                style="
                  margin: 0;
                  font-size: 26px;
                "
              >
                ShopMind AI
              </h1>

              <p
                style="
                  margin: 8px 0 0;
                  opacity: 0.9;
                  font-size: 14px;
                "
              >
                Account Security Alert
              </p>

            </div>

            <!-- CONTENT -->

            <div
              style="
                padding: 35px 30px;
                color: #1e293b;
              "
            >

              <h2
                style="
                  margin-top: 0;
                  margin-bottom: 20px;
                  text-align: center;
                  font-size: 22px;
                "
              >
                New Login Detected
              </h2>

              <p
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #475569;
                "
              >
                Hello
                <strong>
                  ${userName}
                </strong>,
              </p>

              <p
                style="
                  font-size: 15px;
                  line-height: 1.7;
                  color: #475569;
                "
              >
                A successful login was detected
                on your ShopMind AI account.
              </p>

              <!-- LOGIN DETAILS -->

              <div
                style="
                  margin: 25px 0;
                  padding: 20px;
                  background: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                "
              >

                <p
                  style="
                    margin: 0 0 12px;
                    font-size: 14px;
                    color: #64748b;
                  "
                >
                  <strong
                    style="
                      color: #1e293b;
                    "
                  >
                    Account:
                  </strong>

                  ${email}
                </p>

                <p
                  style="
                    margin: 0;
                    font-size: 14px;
                    color: #64748b;
                  "
                >
                  <strong
                    style="
                      color: #1e293b;
                    "
                  >
                    Date & Time:
                  </strong>

                  ${formattedDate}
                </p>

              </div>

              <!-- SAFE LOGIN MESSAGE -->

              <div
                style="
                  padding: 16px;
                  background: #f0fdf4;
                  border-radius: 10px;
                  color: #166534;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                ✅ If this was you, no action
                is required.
              </div>

              <!-- UNKNOWN LOGIN WARNING -->

              <div
                style="
                  margin-top: 15px;
                  padding: 16px;
                  background: #fef2f2;
                  border-radius: 10px;
                  color: #991b1b;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                ⚠️
                <strong>
                  Don't recognize this login?
                </strong>

                <br />
                <br />

                Reset your ShopMind AI password
                immediately using the
                <strong>
                  Forgot Password
                </strong>
                option on the login screen.
              </div>

              <!-- SECURITY MESSAGE -->

              <p
                style="
                  margin-top: 25px;
                  margin-bottom: 0;
                  color: #64748b;
                  font-size: 13px;
                  line-height: 1.6;
                "
              >
                For your security, never share
                your password or verification
                codes with anyone.
              </p>

            </div>

            <!-- FOOTER -->

            <div
              style="
                background: #f8fafc;
                padding: 20px;
                text-align: center;
                border-top:
                  1px solid #e2e8f0;
              "
            >

              <p
                style="
                  margin: 0;
                  color: #94a3b8;
                  font-size: 12px;
                "
              >
                © ${new Date().getFullYear()}
                ShopMind AI
              </p>

              <p
                style="
                  margin: 6px 0 0;
                  color: #94a3b8;
                  font-size: 12px;
                "
              >
                Keeping your shopping account
                secure.
              </p>

            </div>

          </div>

        </div>
      `,
    };

    // ===============================================
    // SEND LOGIN SECURITY EMAIL
    // ===============================================

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "Login security email sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Login security email error:",
      error.message
    );

    throw error;
  }
};

// =====================================================
// EXPORT EMAIL FUNCTIONS
// =====================================================

module.exports = {
  sendPasswordResetEmail,
  sendLoginSecurityEmail,
};