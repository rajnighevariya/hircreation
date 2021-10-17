module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        res.render('index')
    }
    next();
}