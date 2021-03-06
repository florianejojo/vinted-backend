// VAR ENV
require("dotenv").config();

// EXPRESS & FORMIDABLE & CORS
const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

// MONGOOSE
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

// CLOUDINARY
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// STRIPE
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

// MODELS
const Offer = require("./models/Offer");
const User = require("./models/User");

// ROUTES

app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to Vinted API by Floriane!" });
});

app.post("/payment", async (req, res) => {
    // On récupère le token pour l'envoyer dans la transaction
    const { stripeToken, itemId } = req.fields;

    // On recherche l'annonce dans la DB: infos à jour
    const offer = await Offer.findById(itemId);

    // Requete stripe pour transaction
    const response = await stripe.charges.create({
        amount: offer.product_price * 100,
        currency: "eur",
        description: offer.product_description,
        source: stripeToken,
    });

    // TODO
    // Sauvegarder la transaction dans une BDD MongoDB

    res.json(response);
});

const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
    res.json("Bad getaway");
});

// PORTS
app.listen(process.env.PORT, () => {
    console.log("Server started");
});
