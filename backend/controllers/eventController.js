const Event = require("../models/eventModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
let ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");



// Create Event -- Admin
exports.createEvent = catchAsyncErrors(async (req, res, next) => {
    let images = [];
  
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  
    const imagesLinks = [];
  
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "events",
      });
  
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  
    req.body.images = imagesLinks;
    req.body.user = req.user.id;
  
    const event = await Event.create(req.body);
  
    res.status(201).json({
      success: true,
      event,
    });
  });
  
// Get All Event
exports.getAllEvents = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 8;
    const eventsCount = await Event.countDocuments();
  
    const apiFeature = new ApiFeatures(Event.find(), req.query)
      .search()
      .filter();
  
    let events = await apiFeature.query;
  
    let filteredEventsCount = events.length;
  
    apiFeature.pagination(resultPerPage);
  
    //Events = await apiFeature.query;
  
    res.status(200).json({
      success: true,
      events,
      eventsCount,
      resultPerPage,
      filteredEventsCount,
    });
  });
  


//Get All Event (Admin)
exports.getAdminEvents = catchAsyncErrors(async(req,res, next)=>{
    const event = await Event.find();
    res.status(200).json({
        success:true,
        event,
    })
})


//Get event Details
exports.getEventDetails = catchAsyncErrors(async(req,res,next)=>{
    const event = await Event.findById(req.params.id);
    if(!event){
       return next(new ErrorHander("Event not found",404))
    }
    res.status(200).json({
        success:true,
        event,
    })
}
)


//Update Events -- Admin

exports.updateEvent = catchAsyncErrors(async(req,res,next)=>{
    let event = await Event.findById(req.params.id);

    if(!event){
        return next(new ErrorHander("Event not found",404));
    }

    //Images Start Here
    let images = [];

    if(typeof req.body.image==="string"){
        image.push(req.body.images);
    }else{
        images = req.body.images;
    }

    if(images !== undefined){
        //Deleting Images From Cloudinary
        for(let i=0; i<event.images.length; i++){
            await cloudinary.v2.uploader.destroy(event.images[i].public_id);
        }

        const imagesLinks=[];

        for(let i=0; i<images.length;i++){
            const result = await cloudinary.v2.uploader.upload(images[i],{
                folder:"event",
            })

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            })
        }
        req.body.images = imagesLinks;
    }
    event = await Event.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        success:true,
        event,
        eventCount,
    })
})

//Delete Event

exports.deleteEvent = catchAsyncErrors(async(req,res,next)=>{
    const event = await Event.findById(req.params.id);
    if(!event){
        return next(new ErrorHander("Event not found",404));
    }

    //Delete Images From Cloudinary
    for(let i=0; i<event.images.length; i++){
        const result = await cloudinary.v2.uploader.destroy(
            event.images[i].public_id
        );
    }

    await event.remove();
    res.status(200).json({
        success:true,
        message:"Event Delete SuccessFully"
    })
    
})

















// Get All Reviews of a event
exports.getEventReviews = catchAsyncErrors(async(req, res, next)=>{
    const event = await Event.findById(req.query.id);

    if(!event){
        return next(new ErrorHander("Event not found",404));
    }
    res.status(200).json({
        success: true,
        reviews:event.reviews
    })
})
// Delete Review
exports.deleteReview = catchAsyncErrors(async(req, res, next)=>{
    const event = await Event.findById(req.query.eventId);

    if(!event){
        return next(new ErrorHander("Event not found",404));
    }
    const reviews = event.reviews.filter(
        (rev) =>rev._id.toString() !== req.query.id.toString()
    )
    let avg = 0;

    reviews.forEach((rev)=>{
        avg += rev.rating;
    })

    let ratings =0;

    if(reviews.length===0){
        ratings =0;
    }else{
     ratings = avg/reviews.length;
    }
    const numOfReviews = reviews.length;

    await Event.findByIdAndUpdate(
        req.query.eventId,
        {
            reviews,
            ratings,
            numOfReviews
        },
        {
            new: true,
            runValidators:true,
            useFindAndModify:false
        }
    )

  
    res.status(200).json({
        success: ture
    })
})
















