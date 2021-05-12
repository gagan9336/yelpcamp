var express    = require("express"),
    router     = express.Router(),
    passport   = require("passport"),
    User       = require("../models/user");
    middleware = require("../middleware/index");


    //root route
    router.get("/", (req, res) => {
        res.render("landing",);
    });

    //auth route
    //=============
    router.get("/register", (req, res) => {
        res.render("register", { message: req.flash("error") });
    })

    //signup logic
    //show register form
    router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username,
        email: req.body.email
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("register");
        }
            passport.authenticate("local")(req, res, () => {
                req.flash("success", "Welcome to YelpCamp > "+ user.username)
                res.redirect("/campGround");
            })
        })
    })

    //show login form
    router.get("/login", (req, res) => {
        res.render("login",{message: req.flash("error")});
    })

    //login route for handeling login logic
    router.post("/login", passport.authenticate("local", {
        successRedirect: "/campGround",
        failureRedirect: "/login"
    }), (req, res) => {

    });

    //logout route
    router.get("/logout", (req, res) => {
        req.logout();
        req.flash("success","logged you out");
        res.redirect("/campGround");
    })

router.get("campGround/profile/:id", function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            req.flash("error", "Something went wrong.");
            return res.redirect("/");
        }
    });
})

module.exports=router;