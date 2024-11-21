app.use((req, res, next) => {
    req.body = null; // This would break things
    next();
});
