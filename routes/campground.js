var express    = require("express"),
    router     = express.Router(),
    Campground = require("../models/campground"),
    middleware = require("../middleware/index"),
    User       = require("../models/user"),
    moment     = require("moment");

    //Campground search user
    router.get("/campGround/search", async (req, res) => {
        let searchOptions = {}
        if (req.query.searchUser != null && req.query.searchUser !== "") {
            searchOptions = { username: RegExp(req.query.searchUser, "i") }
        }
        try {
            const findUser = await User.find(searchOptions)
            res.render("campgrounds/search", {
                findUser: findUser,
                searchOptions: req.query
            });
        } catch{
            res.redirect("/");
        }
    });

   // all campground and search feature
    router.get("/campGround", (req, res) => {
       if(req.query.search){
           const regex= new RegExp(escapeRegex(req.query.search),"gi");
           Campground.find({ name: regex }, (err, allcampground) => {
               if (err) {
                   console.log(err);
               } else {
                   res.render("campgrounds/index", { campGround:allcampground,
                     currentUser: req.user,
                     });
               }
           })
       }else{
           Campground.find({}, (err, allcampground) => {
               if (err) {
                   console.log(err);
               } else {
                   res.render("campgrounds/index", { campGround: allcampground, currentUser: req.user });
               }
           })
       }
    });
     function escapeRegex(text) {
     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\$&");        
     };
    //Create route
    router.post("/campGround",middleware.isLoggedIn, (req, res) => {
        var name = req.body.name;
        var image = req.body.image;
        var description = req.body.description;
        var author={
            id: req.user._id,
            username: req.user.username,
            createdAt: moment(new Date().getTime()).format('h:mm a')
        }
        var newcampGround = {
            name: name,
            image: image,
            description: description,
            author: author
        }
            // create a new campground an save in the database
            Campground.create(newcampGround, (err, newlyCreated) => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/campGround");
                }
            })
    });

    //new route
    router.get("/campGround/new",middleware.isLoggedIn, (req, res) => {
        res.render("campgrounds/new");
    });

    //show- show more info about campground
    router.get("/campGround/:id", (req, res) => {
        Campground.findById(req.params.id).populate("comments").exec(function (err, foundCamp) {
            if (err) {
                console.log(err);
            } else {
                //render show template with the campground
                res.render("campgrounds/show", { campground: foundCamp });
            }
        });
    });

    //edit campground
    router.get("/campGround/:id/edit",middleware.campgroundownership,(req,res)=>{
        Campground.findById(req.params.id,(err,foundCampground)=>{
            res.render("campgrounds/edit",{campground:foundCampground});
        })

    });

// PUT - updates campground in the database
router.put("/campGround/:id", middleware.campgroundownership, function (req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, campground) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success", "Successfully Updated!");
            res.redirect("/campGround/" + campground._id);
        }
    });
});

    //delete route
    router.delete("/campGround/:id", middleware.campgroundownership,(req,res)=>{
       Campground.findByIdAndDelete(req.params.id,(err)=>{
           if(err){
               res.redirect("/campGround");
           }else{
               res.redirect("/campGround");
           }
       })
    });

    module.exports=router;