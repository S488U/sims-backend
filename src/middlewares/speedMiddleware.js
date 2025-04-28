export const speedMiddleware = (req, res, next) => {
    const start = Date.now();
    res.locals.startTime = start;

    res.on('finish',  () => {
        const end = Date.now();
        res.locals.timeTake = end - start;
    });

    next();
};