const { generateAIChatResponse } = require("../services/geminiService");

const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = await generateAIChatResponse(message, history || [], req.user);

    res.json({
      success: true,
      response: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  chatWithAI,
};
