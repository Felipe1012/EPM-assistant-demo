require('dotenv').config();
const AssistantV2 = require('ibm-watson/assistant/v2');
const express = require('express');
const bodyParser = require('body-parser');
const { IamAuthenticator } = require('ibm-watson/auth');
const db2 = require('./db2');
const app = express();
const { json } = require('express');
const port = 3000;

var cors = require('cors');
app.use(cors()) // Use this after the variable declaration

app.use(bodyParser.json());
app.use(express.static('./public'));
//Definimos las variables que se van a usar en el codigo
var resultadoAumento;
var resultadoDisminucion;
var aumentoDias;
var disminucionDias
var params = {};
var session = '';
var servicio = '';
var ID = '';

//constante para la comunicacion con el asistente
const assistant = new AssistantV2({
  version: '2020-07-29',

  authenticator: new IamAuthenticator({
    apikey: 'MbjMAXSvChIddj8fizanDG4eg4z4ueLitOoTGCWUwQBQ',
  }),
  url: 'https://api.us-south.assistant.watson.cloud.ibm.com/instances/276ee41d-29ca-414f-9848-c2c20fca0933',

});

//recibimos los datos en la direccion /conversation
app.post('/conversation/', (req, res) => {
  const { text } = req.body;
  //La variable reg es para comprobar si llega un id de factura para hacer la consulta
  var reg = new RegExp(/\I\D\_\d{3}/)
  //comprobamos si llega un texto vacío para crear un nuevo sessionID
  if (text == '') {
    assistant.createSession({
      assistantId: '5dde33be-40f2-4f4e-b273-3c064467b07a',
    })
      .then(res => {
        console.log(JSON.stringify(res.result, null, 2));
        session = res.result.session_id
      })
      .catch(err => {
        console.log(err);
      });
  } 

  var delayInMilliseconds = 2000;
  setTimeout(function () {
    //si se recibe el id, llamamos a la funcion db2 donde están almacenadas las facuras de agua, luz, gas y el conteo de los dias
    if (reg.test(text)) {
      ID = (text)
      db2(text, servicio).then((ans) => {
        console.log(JSON.stringify(ans))
        resultadoAumento = (ans.data[0].VALOR_MES_ACTUAL - ans.data[0].VALOR_MES_ANTERIOR)
        //comprobamos si el valor de la facura aumentó o disminuyó
        if (resultadoAumento > 0) {
          resultadoAumento
          params = {
            input: { text },
            assistantId: '5dde33be-40f2-4f4e-b273-3c064467b07a',
            sessionId: session,
            context: {
              'skills': {
                'main skill': {
                  'user_defined': {
                    'respuesta': {
                      'resultadoAumento': resultadoAumento,
                    }
                  }
                }
              }
            }
          };
        } else if (resultadoAumento <= 0) {
          resultadoDisminucion = -resultadoAumento
          params = {
            input: { text },
            assistantId: '5dde33be-40f2-4f4e-b273-3c064467b07a',
            sessionId: session,
            context: {
              'skills': {
                'main skill': {
                  'user_defined': {
                    'respuesta': {
                      'resultadoDisminucion': resultadoDisminucion,
                    }
                  }
                }
              }
            }
          };
        }
        //enviamos los datos al asistente
        assistant.message(params, (err, response) => {
          if (err) {
            console.error(err)
            res.status(500).json(err)
          } else {
            //console.log(JSON.stringify(response,null,2))
            console.log(JSON.stringify(params, null, 2));
            console.log(text)
            res.send(response)
          }
        })
      })

    }
    //comprobamos si el usuario tiene otra duda, tambien se pone desde watson assistant, pero acá es para saber que datos enviar
    else if (text == 'por que' || text == 'me llegó mas cara mi factura porque?' || text == 'no se porque tengo que pagar mas este mes?' || text == 'por que subió mi factura del gas?' || text == 'por que subió mi factura del agua?' || text == 'por que subió mi factura del luz?' || text == 'que pasa con la factura?' || text == 'por qué llegó más costoso el servicio este mes?' ||
      text == 'me estan cobrando mas que el mes anterior' || text == 'no entiendo porque esta mas cara' || text == 'por qué el aumento?' || text == 'por qué pago más?' || text == 'causa del incremento' || text == 'porque el servicio no tiene el mismo valor que el mes pasado?' || text == 'por qué no pago lo mismo del mes pasado?' || text == 'por que pago menos?' || text == 'este mes por qué llegó más barato?' ||
      text == 'este mes el valor de la factura es menor' || text == 'este mes el valor de la factura es mayor' || text == 'hubo algún descuento en la factura?' || text == 'por qué pago menos que el mes pasado' || text == 'el valor de este mes es más barato' || text == 'la factura de este mes tuvo un valor menor' || text == 'por qué este mes pago menos?' || text == 'porque este mes tengo que pagar más?' ||
      text == 'por qué bajó el valor de la factura' || text == 'razón aumento en mi factura' || text == 'causa disminución en la factura' || text == 'Por qué se incrementó mi factura?' || text == 'por qué pago más este mes?' || text == 'a que se debe el aumento en mi factura' || text == 'por qué debo pagar más?' || text == 'por que se incrementó la factura' || text == 'porque me estan cobrando mas?' ||
      text == 'reducción en mi factura') {
      //como quiere saber el por que aumenta o disminuye, comprobamos el cambio en los dias de la factura
      db2(ID, servicio).then((ans) => {
        aumentoDias = ans.data2[0].CONTEO_DIAS_MES_ACTUAL - ans.data2[0].CONTEO_DIAS_MES_ANTERIOR
        disminucionDias = -aumentoDias
        resultadoAumento
        console.log(resultadoAumento)
        console.log(JSON.stringify(ans))
        //definimos las posibles opciones de variable de acuerdo con cada caso de los usuarios
        if (resultadoAumento > 0 && aumentoDias > 0) {
          context = {
            'skills': {
              'main skill': {
                'user_defined': {
                  'respuesta2': {
                    'aumentoDias': aumentoDias,
                  }
                }
              }
            }
          }
        } else if (resultadoAumento > 0 && aumentoDias <= 0) {
          context = {
            'skills': {
              'main skill': {
                'user_defined': {
                  'respuesta2': {
                    'aumento': aumentoDias,
                  }
                }
              }
            }
          }
        } else if (resultadoAumento < 0 && aumentoDias >= 0) {

          context = {
            'skills': {
              'main skill': {
                'user_defined': {
                  'respuesta2': {
                    'reduccion': aumentoDias,
                  }
                }
              }
            }
          }

        } else if (resultadoAumento < 0 && aumentoDias < 0) {

          context = {
            'skills': {
              'main skill': {
                'user_defined': {
                  'respuesta2': {
                    'disminucionDias': disminucionDias,
                  }
                }
              }
            }
          }
        }
        params = {
          input: { text },
          assistantId: '5dde33be-40f2-4f4e-b273-3c064467b07a',
          sessionId: session,
          context
        };

        //Enviamos la informacion al asistente con los casos
        console.log(JSON.stringify(params, null, 2))
        assistant.message(params, (err, response) => {
          if (err) {
            console.error(err)
            res.status(500).json(err)
          } else {
            console.log(params)
            console.log(text)
            res.send(response)
          }
        })
      })
    } else {

      //todo el resto de la informacion si no se recibe ID de factura o un por que, se envía a continuacion
      params = {
        input: { text },
        assistantId: '5dde33be-40f2-4f4e-b273-3c064467b07a',
        sessionId: session

      };
      assistant.message(params, (err, response) => {
        if (err) {
          console.error(err)
          res.status(500).json(err)
        } else {
          //Guardamos los servicios si el usuario lo ingresa para una posterior busqueda en la funcion db2
          if (text == 'agua') {
            servicio = 'agua'
          } else if (text == 'gas') {
            servicio = 'gas'
          } else if (text == 'luz' || text == 'energia') {
            servicio = 'luz'
          }
          console.log(params)
          console.log(text)
          res.send(response)
        }
      })
    }

  }, delayInMilliseconds);
});

app.listen(port, () => console.log(`Running on port ${port}`));
/*var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();

app.listen(appEnv.port, "0.0.0.0", () => {
  console.log("Running at " + appEnv.url);
});
*/