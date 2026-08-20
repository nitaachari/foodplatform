const cookieOptions = {
    httpOnly: true, //cannot be accessed by javascript and stays in the browser layer done for extra security

    secure: process.env.NODE_ENV === "production", //https In production, only send this cookie over HTTPS.

    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",//relaxed not strict but not open This controls when the browser is allowed to send the cookie in cross-site situations. if u click from another site to this site its fine

    maxAge: 7 * 24 * 60 * 60 * 1000, //in ms so like 7 days 24 hrs 60 min 60 sec 1000 ms

    path: "/"
};

module.exports = cookieOptions;
