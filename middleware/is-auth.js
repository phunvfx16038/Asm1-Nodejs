module.exports = (req, res, next) => {
  if (!req.session.isLoggin) {
    res.redirect("/");
  }
  next();
};
