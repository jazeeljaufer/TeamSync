const { body } = require("express-validator");

const reportValidator = [
  body("weekStart")
    .notEmpty()
    .withMessage("Week start date is required"),

  body("weekEnd")
    .notEmpty()
    .withMessage("Week end date is required"),

  body("project")
    .notEmpty()
    .withMessage("Project is required"),

  body("tasksCompleted")
    .isArray({ min: 1 })
    .withMessage("At least one completed task is required"),

  body("tasksPlanned")
    .isArray({ min: 1 })
    .withMessage("At least one planned task is required"),

  body("hoursWorked")
    .optional()
    .isNumeric()
    .withMessage("Hours worked must be a number"),
];

module.exports = {
  reportValidator,
};