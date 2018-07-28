const allowOriginWithAuth = function (req, res, next) {
    const allowedOrigins = [
      'http://localhost:8080',
      'https://askanexpert-landing-page.herokuapp.com',
      'https://askanexpert-web-app.herokuapp.com'];
    const origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'x-auth, content-type');
    res.setHeader('Access-Control-Allow-Credentials', true); // for future cookies
    res.setHeader('Access-Control-Expose-Headers', 'x-auth');
    next();
}

module.exports = {allowOriginWithAuth};
