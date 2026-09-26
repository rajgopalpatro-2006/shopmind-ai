// ==========================================
// SHOPMIND AI SMS SERVICE
// Development Version
// ==========================================

const sendSMS = async ({
  phone,
  message,
}) => {
  try {
    console.log(
      "\n=============================="
    );

    console.log("📱 SHOPMIND AI SMS");

    console.log(
      "=============================="
    );

    console.log(
      "Phone:",
      phone
    );

    console.log(
      "Message:",
      message
    );

    console.log(
      "==============================\n"
    );

    return {
      success: true,
      developmentMode: true,
    };
  } catch (error) {
    console.error(
      "SMS error:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  sendSMS,
};