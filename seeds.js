var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
    {
        name: "Cloud's Rest",
        image: "https://images.unsplash.com/photo-1484960055659-a39d25adcb3c?auto=format&fit=crop&w=750&q=80",
        description: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"
    },
    {
        name: "camp 2 the moon",
        image: "https://images.unsplash.com/photo-1496545672447-f699b503d270?auto=format&fit=crop&w=751&q=80",
        description: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"
    },
    {
        name: "bohols finest!",
        image: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?auto=format&fit=crop&w=750&q=80",
        description: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"
    }
];

function seedDB() {
    //REMOVE ALL CAMPGROUNDS
    Campground.remove({},function(err) {
        if(err){
            console.log(err);
        } //else {
        //     console.log("removed campgrounds");
        //     //ADD A FEW CAMPGROUNDS
        //     data.forEach(function(seed) {
        //         Campground.create(seed, function(err, campground) {
        //             if(err){
        //                 console.log(err);
        //             } else {
        //                 console.log("added a campground!");
        //                 //create a comment
        //                 // Comment.create({
        //                 //         text: "Napakanda ng asawa ko grabe!!!!!",
        //                 //         author: "Kenneth Pogi!!!"
        //                 //     }, function(err, comment) {
        //                 //         if(err) {
        //                 //             console.log(err);
        //                 //         } else {
        //                 //             campground.comments.push(comment);
        //                 //             campground.save();
        //                 //             console.log("Created a new comment!")
        //                 //         }
        //                 //     });
        //             }
        //         })
        //     });
        // }
    });
   

}

module.exports = seedDB;