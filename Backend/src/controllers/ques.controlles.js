// ques.controllers.js

import { Questions } from "../models/ques.models.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/apiError.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";

const quesUpload = asyncHandler(async (req, res) => {
  const { type, question, opt, correct } = req.body;

  // Validate required fields
  if (!type) {
    throw new ApiError(400, "Type is not defined");
  }
  if (!question) {
    throw new ApiError(400, "Question is not defined");
  }
  if (!opt || opt.length !== 4) {
    throw new ApiError(400, "Options should be an array of 4 elements");
  }
  if (!correct) {
    throw new ApiError(400, "Correct answer is not defined");
  }

  // Find the user
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  // Check if there is already a type of question for the user
  let typeOfQuestion = await Questions.findOne({ type, owner: user._id });

  if (!typeOfQuestion) {
    // Create a new type of question if it doesn't exist
    const newQuestion = {
      type,
      owner: req.user._id,
      questions: [
        {
          question,
          options: [
            { a: opt[0] },
            { b: opt[1] },
            { c: opt[2] },
            { d: opt[3] },
          ],
          correct,
        },
      ],
    };

    typeOfQuestion = await Questions.create(newQuestion);

    if (!typeOfQuestion) {
      throw new ApiError(400, "Error in creating new type");
    }

    // Respond with success message
    const que = await Questions.findById(typeOfQuestion._id).select(
      "-questions.correct"
    );
    return res
      .status(200)
      .json(new ApiResponse(200, que, "New type of question created"));
  }

  // Add new question to existing type
  typeOfQuestion.questions.push({
    question,
    options: [
      { a: opt[0] },
      { b: opt[1] },
      { c: opt[2] },
      { d: opt[3] },
    ],
    correct,
  });

  await typeOfQuestion.save({ validateBeforeSave: false });

  // Respond with success message
  const que = await Questions.findById(typeOfQuestion._id).select(
    "-questions.correct"
  );
  return res.status(200).json(new ApiResponse(200, que, "Question added"));
});

export { quesUpload };
