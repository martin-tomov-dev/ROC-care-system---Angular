// const admin = require('firebase-admin');

let objnew = {}
var newdb;
exports.getAllPatient = (db) => {
    newdb = db;
    let allPatient = [];
    var docRef = db.collection("patients");

    docRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            allPatient.push(doc.data())
        });
        chartData(allPatient);
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

exports.resetPatientIntake = (db) => {
    newdb = db;
    let allPatient = [];
    var docRef = db.collection("patients");

    docRef.get().then((querySnapshot) => {
        // console.log('querySnapshot ', querySnapshot)
        querySnapshot.forEach((doc) => {
            console.log(doc.id)
            docRef.doc(doc.id).update({
                intake: 0
            })
        });
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

exports.storePatientIntake = (db) => {
    newdb = db;
    let allPatient = [];
    var getPatientInfo = db.collection("patients");
    console.log("getPatientInfo:--CRON", getPatientInfo);

    // docRef.get().then((querySnapshot) => {
    //     // console.log('querySnapshot ', querySnapshot)
    //     querySnapshot.forEach((doc) => {
    //         console.log(doc.id)
    //         docRef.doc(doc.id).update({
    //             intake: 0
    //         })
    //     });
    // }).catch((error) => {
    //     console.log("Error getting document:", error);
    // });
}

function chartData(data) {
    let roc_drink = [];
    let roc_eat = [];
    let roc_holistic = [];
    data.map((y) => {
        if (y.is_active) {

            if (y.drink) {
                roc_drink.push(y.drink)
            }
            if (y.eat) {
                roc_eat.push(y.eat)
            }
            if (y.holistic) {
                roc_holistic.push(y.holistic)
            }

            countChartData(roc_drink, "roc_drink", roc_drink.length)
            countChartData(roc_eat, "roc_eat", roc_eat.length)
            countChartData(roc_holistic, "roc_holistic", roc_holistic.length)
        }
    })
    storeData();
}

function countChartData(arrayTobeMap, aryName, arylength) {
    var obj = {};
    arrayTobeMap.forEach(function (item) {
        if (typeof obj[item] == 'number') {
            obj[item]++;
        } else {
            obj[item] = 1;
        }
    });
    Object.keys(obj).map(function (item) {
        return item + (obj[item] == 1 ? '' : 0 + obj[item]);
    })

    let totalCount = (obj['Red'] ? obj['Red'] : 0) + (obj['Green'] ? obj['Green'] : 0) + (obj['Orange'] ? obj['Orange'] : 0);
    this[aryName] = [
        obj['Green'] ? +((obj['Green'] * 100) / totalCount).toFixed(2) : 0,
        obj['Orange'] ? +((obj['Orange'] * 100) / totalCount).toFixed(2) : 0,
        obj['Red'] ? +((obj['Red'] * 100) / totalCount).toFixed(2) : 0

    ];

    let temp = this[aryName];

    temp.map((x, i) => {
        let c = (temp[0] + temp[1] + temp[2]);
        console.log("c",c, "Total",temp[0] + temp[1] + temp[2])
        if (c > 100) {
            let d = c - 100;
            temp[0] = +(temp[0] - d).toFixed(2);
        }
    })
    this[aryName] = temp;

    console.log(temp,"temp")

    let setDate = new Date().setDate(new Date().getDate() - 1)
    objnew['time'] = setDate;
    // objnew['time'] = new Date().getTime();

    objnew[`${aryName}`] = {
        "Green": this[aryName][0],
        "Orange": this[aryName][1],
        "Red": this[aryName][2],
        "num_asmt": arylength
    }
    // console.log("obj", objnew)
}

async function storeData() {
    const dt = await newdb.collection('cron-data').doc().set(objnew);
}


