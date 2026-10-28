const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    // If it's a Zod error, format it nicely
    if (error.name === "ZodError") {
      console.error("Zod Validation Error:", JSON.stringify(error.errors, null, 2));
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({ message: "Validation failed", errors: formattedErrors });
    }
    next(error);
  }
};

module.exports = validate;
