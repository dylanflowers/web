// Route for the root / path of the website.

export default function(req, res, next) {
    if (req.originalUrl != "/") {
        return next()
    }

    const settings = require("setmeup").settings

    // Force remove the www.
    if (req.hostname.toLowerCase().substring(0, 4) == "www.") {
        return res.redirect(settings.app.url)
    }

    // Logged users go to dashboard, others to home.
    if (!req.headers.cookie || req.headers.cookie.toString().indexOf("strautsession=") < 0) {
        return res.redirect("/home")
    } else {
        return res.redirect("/dashboard")
    }
}
