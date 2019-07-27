const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite'); // Favorite model

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// .all(authenticate.verifyOrdinaryUser) // this middleware will be included in the methods 
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne( { user: req.user._id } )
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite) => {
    if (err) {
        return next(err);
    }
    if (!favorite) {
        Favorites.create({user: req.user._id})
        .then((favorite) => {
            for (i = 0; i < req.body.length; i++) {
                if (favorite.dishes.indexOf(req.body[i]._id) == -1) {
                    favorite.dishes.push(req.body[i]);
                }
            }
            favorite.save()
                .then((favorite) => {
					Favorites.findById(favorite._id)
					.populate('user')
					.populate('dishes')
					.then((favorite) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favorite);
					})
					})
                .catch((err) => {
                    return next(err);
                });
        })
        .catch((err) => {
            return next(err);
        });
    } else {
        for (i = 0; i < req.body.length; i++) {
        if (favorite.dishes.indexOf(req.body[i]._id)) {
            favorite.dishes.push(req.body[i]);
        }
        favorite.save()
		.then((favorite) => {
			Favorites.findById(favorite._id)
			.populate('user')
			.populate('dishes')
			.then((favorite) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(favorite);
			})
            })
            .catch((err) => {
                return next(err);
            });
        }
    }
    });
})

.delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (favorites) { // we delete the document
            Favorites.remove({user: req.user._id})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite) => {
    if (err) {
        return next(err);
    }
    if (!favorite) {
        Favorites.create({user: req.user._id})
        .then((favorite) => {
            for (i = 0; i < req.body.length; i++) {
                if (favorite.dishes.indexOf(req.body[i]._id) == -1) {
                    favorite.dishes.push(req.body[i]);
                }
            }
            favorite.save()
                .then((favorite) => {
					Favorites.findById(favorite._id)
					.populate('user')
					.populate('dishes')
					.then((favorite) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favorite);
					})
					})
                .catch((err) => {
                    return next(err);
                });
        })
        .catch((err) => {
            return next(err);
        });
    } else {
        for (i = 0; i < req.body.length; i++) {
        if (favorite.dishes.indexOf(req.body[i]._id)) {
            favorite.dishes.push(req.body[i]);
        }
        favorite.save()
		.then((favorite) => {
			Favorites.findById(favorite._id)
			.populate('user')
			.populate('dishes')
			.then((favorite) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(favorite);
			})
            })
            .catch((err) => {
                return next(err);
            });
        }
    }
    });
})



.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (favorites) { // we delete the dish from the document
            var index = favorites.dishes.indexOf(req.params.dishId);
            if (index > -1) { 
                favorites.dishes.splice(index, 1);            
                favorites.save()
                .then((favorites) => {
                    Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorites) => {
                    console.log('Favorite Dish Deleted!', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                })
                .catch(err => next(err));
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;