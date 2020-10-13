require('dotenv').config()
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const ibmdb = require('ibm_db');
const { response } = require('express');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var datafinal
//Función para buscar en la base de datos, recibe el ID de la factura y el servicio
function db2(input, servicio) {
    return new Promise(function (resolve) {
        //Se definen los diferentes datos del db2, que se encuentran en el .env para la conexion
        let connStr = "DATABASE=" + process.env.DB_DATABASE + ";HOSTNAME=" + process.env.DB_HOSTNAME + ";PORT=" + process.env.DB_PORT + ";PROTOCOL=TCPIP;UID=" + process.env.DB_UID + ";PWD=" + process.env.DB_PWD + ";";
        console.log("Funcion db2");
        input = "'" + input + "'"
        console.log(input, servicio)
        ibmdb.open(connStr, function (err, conn) {
            if (err) {
                console.log("error en db2");
                response.json({ success: -1, message: err });
            }
            //Veriicamos si el servicio es Agua y buscamos con el ID en la base de datos    
            if (servicio == "agua") {
                console.log("Agua")
                conn.query("SELECT * FROM " + process.env.DB_SCHEMA + ".ME_FACTURA_AGUA WHERE ID_FACTURA=" + input + ";", function (err, data) {
                    if (err) {
                        console.log('hi')
                        response.json({ success: -1, message: err });
                    } else {
                        conn.query("SELECT * FROM " + process.env.DB_SCHEMA + ".ME_CONTEO_DIAS WHERE ID_FACTURA=" + input + ";", function (err, data2) {
                            if (err) {
                                response.json({ err })
                            }
                            conn.close(function () {
                                datafinal = {
                                    data,
                                    data2
                                }
                                resolve(datafinal)
                            })
                        });
                    }
                });
            } else if (servicio == "gas") {
                console.log("Gas")
                conn.query("SELECT * FROM " + process.env.DB_SCHEMA + ".ME_FACTURA_GAS WHERE ID_FACTURA=" + input + ";", function (err, data) {
                    if (err) {
                        console.log('hi')
                        response.json({ success: -1, message: err });
                    } else {
                        conn.query("SELECT * FROM " + process.env.DB_SCHEMA + ".ME_CONTEO_DIAS WHERE ID_FACTURA=" + input + ";", function (err, data2) {
                            if (err) {
                                response.json({ err })
                            }
                            conn.close(function () {
                                datafinal = {
                                    data,
                                    data2
                                }
                                resolve(datafinal)
                            })
                        });
                    }
                });
            } else if (servicio == "luz") {
                console.log("Luz")
                conn.query("SELECT * FROM " + process.env.DB_SCHEMA + ".ME_FACTURA_ENERGIA WHERE ID_FACTURA=" + input + ";", function (err, data) {
                    if (err) {
                        console.log('hi')
                        response.json({ success: -1, message: err });
                    } else {
                        conn.query("SELECT * FROM " + process.env.DB_SCHEMA + ".ME_CONTEO_DIAS WHERE ID_FACTURA=" + input + ";", function (err, data2) {
                            if (err) {
                                response.json({ err })
                            }
                            conn.close(function () {
                                datafinal = {
                                    data,
                                    data2
                                }
                                resolve(datafinal)
                            })
                        });
                    }
                });
            }

        });

    })


}

module.exports = db2;
