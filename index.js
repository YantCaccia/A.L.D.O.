/*---------DISPLAY-TEXT-ON-TOP-----------*/
const chalk = require('chalk');
var figlet = require('figlet');
console.log(chalk.bgBlack.green.bold(figlet.textSync('  A.L.D.O.  ', {
    font: '3D-ASCII',
    horizontalLayout: 'full',
    verticalLayout: 'default'
})));
console.log(chalk.bgBlack.green.bold("\t\t\t  ANDROIDE LANCUSANO DIFFICILMENTE OBBEDIENTE  \n"));
/*---------------------------------------*/
const Lookup = require("node-yeelight-wifi").Lookup;
var look = new Lookup();
var light = undefined;
/*----*/
const { withHermes } = require('hermes-javascript');
const { Enums } = require('hermes-javascript/types')

/*----*/
const https = require('https');
var url = '';
/*----*/
var NodeGeocoder = require('node-geocoder');
var options = { provider: 'openstreetmap' };
var geocoder = NodeGeocoder(options);
/*----*/
let Parser = require('rss-parser');
let parser = new Parser();
/*----*/
var Player = require('player');
var player;
/*----*/

mainTest();

function mainTest() {
    withHermes(hermes => {

        look.on("detected", (bulbFound) => {
            console.log(chalk.green.bold("LIGHT FOUND. I'M READY, LET'S DO THIS!\n\n"));
            light = bulbFound;
        });

        const dialog = hermes.dialog();

        /*-----------------GESTIONE-METEO----------------*/
        dialog.on('intent/YantCaccia:getForecast', (msg) => {
            console.log(chalk.green.bold(msg.input.toUpperCase()));

            var quando = msg.slots.find(slot => slot.slotName == 'giorno');
            if (quando != undefined) quando = quando.value.value;
            else quando = 'oggi';

            switch (quando) {
                case "oggi": quando = 0;
                    break;
                case "domani": quando = 1;
                    break;
                default: quando = 0;
                    break;
            }//ora quando può essere usato come indice nelle API di DarkSky

            var city = msg.slots.find(slot => slot.slotName == 'city');
            if (city != undefined) city = city.value.value;
            else city = 'Napoli';

            var data = '';

            geocoder.geocode(city, function (err, res) {
                if (res == undefined) return;
                latitude = res[0].latitude;
                longitude = res[0].longitude;
                url = "https://api.darksky.net/forecast/30d1990af5040181eaae94b736cfcd20/" + latitude + "," + longitude + "?exclude=[currently,minutely,hourly,alerts,flags]&lang=it&units=si";
                https.get(url, (resp) => {
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });
                    resp.on('end', () => {
                        data = JSON.parse(data);
                        console.log(chalk.green.bold("> " + data.daily.data[quando].summary) + "\n");
                        dialog.publish('end_session', {
                            sessionId: msg.sessionId,
                            text: JSON.stringify(data.daily.data[quando].summary)
                        })
                    });
                })
            });
        })
        /*---------------------------------------------------------------*/

        /*------------------------NEWS-PROVIDER--------------------------*/
        dialog.on('intent/YantCaccia:getNews', (msg) => {
            let response = "Ok, ecco le ultime notizie";

            console.log(chalk.green.bold(msg.input.toUpperCase()));
            console.log(chalk.green.bold("> " + response + "\n"));
            (async () => {
                let feed = await parser.parseURL('http://cache.sky.it/google-home-assistant/tg24-last-news.xml');
                var url = feed.items[0].enclosure.url;
                playSound(url);
            })();

            dialog.publish('end_session', {
                sessionId: msg.sessionId
            })
        })
        /*---------------------------------------------------------------*/

        /*-----------------------GESTIONE-LUCI---------------------------*/

        dialog.on('intent/YantCaccia:Spegnere', (msg) => {

            if (light == undefined) {
                lightError(dialog, msg);
                return;
            }

            testLight().then(function (flag) {
                if (!flag) {
                    lightError(dialog, msg);
                    return;
                }

                let response = "Ok, spengo la luce";
                console.log(chalk.green.bold(msg.input.toUpperCase()));
                light.setPower(false);
                console.log(chalk.green.bold("> " + response + "\n"));
                dialog.publish('end_session', {
                    sessionId: msg.sessionId,
                    text: response
                })
            });
        })

        dialog.on('intent/YantCaccia:Accendere', (msg) => {

            if (light == undefined) {
                lightError(dialog, msg);
                return;
            }

            testLight().then(function (flag) {
                if (!flag) {
                    lightError(dialog, msg);
                    return;
                }
                let response = "Ok, accendo la luce";
                console.log(chalk.green.bold(msg.input.toUpperCase()));
                light.setPower(true);
                console.log(chalk.green.bold("> " + response + "\n"));
                dialog.publish('end_session', {
                    sessionId: msg.sessionId,
                    text: response
                })
            });
        })

        dialog.on('intent/YantCaccia:Alzare', (msg) => {

            if (light == undefined) {
                lightError(dialog, msg);
                return;
            }

            testLight().then(function (flag) {
                if (!flag) {
                    lightError(dialog, msg);
                    return;
                }
                let response = "Ok, aumento la luminosità della luce";
                console.log(chalk.green.bold(msg.input.toUpperCase()));
                light.setBright(light.bright + 30);
                console.log(chalk.green.bold("> " + response + "\n"));
                dialog.publish('end_session', {
                    sessionId: msg.sessionId,
                    text: response
                })
            });
        })

        dialog.on('intent/YantCaccia:Abbassare', (msg) => {

            if (light == undefined) {
                lightError(dialog, msg);
                return;
            }

            testLight().then(function (flag) {
                if (!flag) {
                    lightError(dialog, msg);
                    return;
                }
                let response = "Ok, abbasso la luminosità della luce";
                console.log(chalk.green.bold(msg.input.toUpperCase()));
                light.setBright(light.bright - 30);
                console.log(chalk.green.bold("> " + response + "\n"));
                dialog.publish('end_session', {
                    sessionId: msg.sessionId,
                    text: response
                })
            });
        })

        dialog.on('intent/YantCaccia:Colore', (msg) => {

            if (light == undefined) {
                lightError(dialog, msg);
                return;
            }

            testLight().then(function (flag) {
                if (!flag) {
                    lightError(dialog, msg);
                    return;
                }
                let response = "Okay, cambio il colore della luce";

                if (msg.slots[0] == undefined) {
                    dialog.publish('end_session', {
                        sessionId: msg.sessionId,
                        text: "Mi dispiace, non ho capito."
                    })
                    return;
                }//err management

                /*------COLORI-----*/
                let rgb;
                if (msg.slots[0].rawValue == 'rosso' || msg.slots[0].rawValue == 'rossa') rgb = [255, 0, 0];
                if (msg.slots[0].rawValue == 'verde') rgb = [0, 255, 0];
                if (msg.slots[0].rawValue == 'blu') rgb = [0, 0, 255];
                if (msg.slots[0].rawValue == 'arancio' || msg.slots[0].rawValue == 'arancione') rgb = [240, 120, 0];
                if (msg.slots[0].rawValue == 'bianco' || msg.slots[0].rawValue == 'bianca') rgb = [240, 240, 240];
                if (msg.slots[0].rawValue == 'gialla' || msg.slots[0].rawValue == 'giallo') rgb = [250, 210, 0];
                /*-----------------*/
                console.log(chalk.green.bold(msg.input.toUpperCase()));
                light.setRGB(rgb);
                console.log(chalk.green.bold("> " + response + "\n"));
                dialog.publish('end_session', {
                    sessionId: msg.sessionId,
                    text: response
                })
            });
        })
        /*--------------------------------------------------------------*/
        /*--------------------------TIMER-------------------------------*/
        dialog.on('intent/YantCaccia:setTimer', (msg) => {

            var tipo = msg.slots.find(slot => slot.slotName == 'tipo');
            var numero = msg.slots.find(slot => slot.slotName == 'numero');

            if (tipo == undefined || numero == undefined) {
                dialog.publish('end_session', {
                    sessionId: msg.sessionId,
                    text: "Mi dispiace, non ho capito."
                })
                return;
            } //error management done RIGHT (sort of..)

            var secondi = 1;
            numero = numero.value.value;
            tipo = tipo.value.value;

            switch (tipo) {
                case "secondi": secondi = 1;
                    break;
                case "minuti": secondi = 60;
                    break;
                case "minuto": secondi = 60;
                    break;
                case "ora": secondi = 3600;
                    break;
                case "ore": secondi = 3600;
                    break;
                default: secondi = 1;
            }

            var s = numero * secondi * 1000;
            console.log("Millisecondi effettivi: " + s);

            let response = "Okay, imposto il timer per " + numero + " " + tipo;

            setTimeout(playSound, s, "./alarm.mp3"); //setTimeout has a strange way to pass parameter

            console.log(chalk.green.bold(msg.input.toUpperCase()));

            console.log(chalk.green.bold("> " + response + "\n"));
            dialog.publish('end_session', {
                sessionId: msg.sessionId,
                text: response
            })
        })
        /*--------------------------------------------------------------*/

        /*-----------------------A.L.D.O. personality-------------------*/
        dialog.on('intent/YantCaccia:getDescription', (msg) => {
            let response = "Sono ALDO, Androide Lancusano Difficilmente Obbediente, e non mi lamento mai.";
            console.log(chalk.green.bold(msg.input.toUpperCase()));
            console.log(chalk.green.bold("> " + response + "\n"));
            dialog.publish('end_session', {
                sessionId: msg.sessionId,
                text: response
            })
        })

        dialog.on('intent/YantCaccia:getFeel', (msg) => {
            let response = "Eh, non ci lamentiamo";
            console.log(chalk.green.bold(msg.input.toUpperCase()));
            console.log(chalk.green.bold("> " + response + "\n"));
            dialog.publish('end_session', {
                sessionId: msg.sessionId,
                text: response
            })
        })
        /*--------------------------------------------------------------*/
        /*-----------------------STAI-ZITTO-----------------------------*/
        dialog.on('intent/YantCaccia:stopNews', (msg) => {
            stopPlaying();
            dialog.publish('end_session', {
                sessionId: msg.sessionId,
            })
        })
        /*--------------------------------------------------------------*/
    })

}

function playSound(source) {
    player = new Player(source).play();
    player.on('error', function (err) {/* Do nothing but needed to catch the error ('no next song found') */ });
}

function stopPlaying() {
    player.stop();
}

function testLight() {

    return light.updateState().then(() => {
        return true;
    }).catch((error => {
        look = new Lookup();
        return false;
    }));

}

function lightError(dialog, msg) {
    dialog.publish('end_session', {
        sessionId: msg.sessionId,
        text: "Mi dispiace, c'è un problema con le luci"
    })
}