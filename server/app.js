require('dotenv').config()
var config = require('./config.js');
const express = require('express');
const app = express();
const cors = require('cors');
var bodyParser = require('body-parser')
const admin = require('firebase-admin');
var nodemailer = require('nodemailer');
const cron = require('node-cron');
var ctl = require('./controller');

// console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const port = process.env.PORT;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://roc-care-systems-uk-default-rtdb.europe-west1.firebasedatabase.app"
});

// Should be after admin initialization
const db = admin.firestore();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

cron.schedule("*/2 * * * *", function() {
    console.log('running a task every 24 hrs')
    //every 5 min */5 * * * *
    //every 24 hrs 0 0 * * *
    // ctl.getAllPatient(db)
    
    ctl.resetPatientIntake(db)
});
// */2 * * * *  every 2 minutes
cron.schedule("*/2 * * * *", function() {
    ctl.storePatientIntake(db)
});

app.get('/api', (req, res) => {
    res.send('ROC Server is up and running');
})

app.delete('/api/deleteUser/:uid', (req, res) => {
    // console.log('REQ BODY :: ', req.params)
    const uid = req.params.uid;
    if (uid) {
        admin.auth().deleteUser(uid)
            .then(function () {
                res.status(200).send({ message: 'Success' });
            })
            .catch(function (error) {
                res.status(404).send({ message: error })
            });
    } else {
        res.status(404).send({ message: 'No user found with the given UID' })
    }
})

app.post('/api/sendmail', (req, res) => {
    let emaildata = '';
    let rocMail = 'dhruvika.kukadiya@iflair.com';
    // console.log("req mail:",req)
    if (req.body && req.body.createdEmail) {

        if (req.body.createdEmail) emaildata += `${req.body.createdEmail}`;
    }
    else if (req.body.nurseMail || req.body.carehomeMail) {

        if (req.body.nurseMail) emaildata += ` ${req.body.nurseMail},`;
        if (req.body.carehomeMail) emaildata += ` ${req.body.carehomeMail},`;
        emaildata += `${rocMail}`
    }
    else {
        emaildata += `${rocMail}`
    }
    // console.log("email data:",emaildata)
    var transporter = nodemailer.createTransport(config.nodemailerTransport);
    var mailOptions = {
        from: 'support@roccaresystems.co.uk',
        to: emaildata,
        subject: 'ROC Care Systems',
        html: req.body.msg
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.end();
})

app.listen(process.env.PORT, () => {
    console.log(`ROC Server listening on port ${port}`)
})


