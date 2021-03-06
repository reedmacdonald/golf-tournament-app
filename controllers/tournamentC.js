const express = require('express');
const router = express.Router();
const Tournament = require('../models/tournament');
const User = require('../models/user');
const GolfCourses = require('../models/clubs')

router.get('/host', (req, res)=>{

    if(req.session.logged==true){res.render('tournaments/host.ejs',{golfCourses: GolfCourses})}
    else{res.redirect('/auth/login')}
  });

  router.post('/', async (req, res)=>{
    try {
        const createdTournament = await Tournament.create(req.body)
        const foundUser = await User.findById(req.session.usersDbId)
        foundUser.Hosted.push(createdTournament._id)
        foundUser.signedUp.push(createdTournament._id)
        foundUser.save()
        createdTournament.host = foundUser._id
        createdTournament.players = foundUser._id
        createdTournament.save()
        res.redirect(`/tour/${createdTournament._id}`)
        }
        catch(err){res.redirect('tour/host')}})

  router.put('/:id/edit', (req, res) => {
    Tournament.findByIdAndUpdate(req.params.id, req.body, (err, updatedUser) => {
        res.redirect(`/tour/${req.params.id}`);
    });
});

  router.get('/:id/edit', (req, res) => {
    Tournament.findById(req.params.id, (err, foundTournament) => {
        res.render('tournaments/edit.ejs', {
            tournament: foundTournament
        })
        console.log(foundTournament.host)
        console.log(req.session.usersDbId)
    })
})

  router.put('/:id', async (req, res)=>{
   const foundTour = await Tournament.findById(req.params.id);
   const foundUser = await User.findById(req.session.usersDbId)
   foundTour.players.push(foundUser._id)
   foundTour.save();
   foundUser.signedUp.push(foundTour._id);
   foundUser.save();
   res.redirect('/tour')
})




router.get('/', async (req, res)=>{
const foundTournaments = await Tournament.find({eventDate: {$gt: req.session.userTimeStamp}}).sort({eventDate: 1});
if (req.session.logged==true)try{
res.render('tournaments/index.ejs', {
    tournaments: foundTournaments,
    userProfile: req.session.usersDbId
    });}catch(err){res.send(err)}else {
        res.redirect('/auth/login')
    }
})

router.get('/cat/:cat', async (req, res)=>{
    const foundTournaments = await Tournament.find({category: req.params.cat})
    try{
    res.render('tournaments/index.ejs', {
        tournaments: foundTournaments,
        userProfile: req.session.usersDbId
        });}catch(err){res.send(err)}
    })

router.get('/:id', (req, res)=>{
    Tournament.findById(req.params.id)
        .populate('host').exec((err,foundTournament)=>{
            console.log(foundTournament)
            res.render('tournaments/show.ejs', {    
                tournament: foundTournament,
                name: foundTournament.host.firstName,
                last: foundTournament.host.lastName,
                userId: req.session.usersDbId
                })}  
)})

router.delete('/:id', async (req, res)=>{
    try{const foundUser = await User.findById(req.session.usersDbId)
    console.log('before deletion')
    console.log(foundUser)
    foundUser.signedUp.remove(req.params.id)
    foundUser.save();
    console.log('did it delete?')
    console.log(foundUser)
    const foundTournament = await Tournament.findById(req.params.id)
    foundTournament.players.remove(req.session.usersDbId)
    foundTournament.save()
    res.redirect('/tour')}catch(err){
        res.send(err)
    }

  });

  router.delete('/:id/edit', (req, res)=> {
    Tournament.findByIdAndRemove(req.params.id, (err, deletedTournament) => {
      if(err){
        res.send(err);
      } else {
        console.log(deletedTournament);
        //Tour.deleteMany({
        //  _id: {
        //    $in: deletedUser.signedUp // array of article ids to delete
        //  }
        //}, (err, data) => {
          res.redirect('/home');
        }}
    )
    })

  


module.exports = router;