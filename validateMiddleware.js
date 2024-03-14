const validate = (schema) => async (req, res, next) => {
    try {
      const parseBody = await schema.parseAsync(req.body);
      req.body = parseBody;
      next();
    } catch (err) {
      const extraDetail = "please fill all the feild";
      const status = 400;
      const message = err.errors[0].message;
      const error = {
        message,
        status,
        extraDetail,
      };
  
      console.log(error);
      res.status(400).send({mess: message})
      // next(error);
    }
  };
  
  module.exports = validate;
  