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
/*const Lookup = require("node-yeelight-wifi").Lookup;
let look = new Lookup();
look.on("detected", (light) => {
    console.log(chalk.green.bold("LIGHT FOUND. I'M READY, LET'S DO THIS!\n\n"));
    mainTest(light);
});*/
/*----*/
const { withHermes } = require('hermes-javascript');
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

mainTest();

function mainTest(/*light*/) {
    withHermes(hermes => {

        const dialog = hermes.dialog()

        /*------------------STAI-ZITTO-------------------*/
        dialog.on('intent/YantCaccia:stopNews', (msg) => {
            stopPlaying();
            dialog.publish('end_session', {
                sessionId: msg.sessionId,
            })
        })
        /*-----------------------------------------------*/
        /*-----------------GESTIONE-METEO----------------*/
        dialog.on('intent/YantCaccia:getForecast', (msg) => {
            console.log(chalk.green.bold(msg.input.toUpperCase()));

            var quando = msg.slots.find(slot => slot.slotName == 'giorno');
            if (quando != undefined) quando = quando.value.value;
            else quando = 'oggi';

            switch (quando) {//non so se funziona se è undefined: da provare
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

            //var latitude, longitude;
            var data = '';

            //if (msg.slots[0] == undefined) { city = "Napoli"; }
            //else { city = msg.slots[0].value.value; }

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
                            text: JSON.stringify(data.daily.summary)
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
                player = new Player(url);
                player.play();

            })();
            dialog.publish('end_session', {
                sessionId: msg.sessionId,
            })
        })
        /*---------------------------------------------------------------*/

        /*-----------------------GESTIONE-LUCI---------------------------*/
        dialog.on('intent/YantCaccia:Spegnere', (msg) => {
            let response = "Ok, spengo la luce";
            console.log(chalk.green.bold(msg.input.toUpperCase()));
            light.setPower(false);
            console.log(chalk.green.bold("> " + response + "\n"));
            dialog.publish('end_session', {
                sessionId: msg.sessionId,
                text: response
            })
        })

        dialog.on('intent/YantCaccia:Accendere', (msg) => {
            let response = "Ok, accendo la luce";
            console.log(chalk.green.bold(msg.input.toUpperCase()));
            light.setPower(true);
            console.log(chalk.green.bold("> " + response + "\n"));
            dialog.publish('end_session', {
                sessionId: msg.sessionId,
                text: response
            })
        })

        dialog.on('intent/YantCaccia:Alzare', (msg) => {
            let response = "Ok, aumento la luminosità della luce";
            console.log(chalk.green.bold(msg.input.toUpperCase()));
            light.setBright(light.bright + 15);
            console.log(chalk.green.bold("> " + response + "\n"));
            dialog.publish('end_session', {
                sessionId: msg.sessionId,
                text: response
            })
        })

        dialog.on('intent/YantCaccia:Abbassare', (msg) => {
            let response = "Ok, abbasso la luminosità della luce";
            console.log(chalk.green.bold(msg.input.toUpperCase()));
            light.setBright(light.bright - 15);
            console.log(chalk.green.bold("> " + response + "\n"));
            dialog.publish('end_session', {
                sessionId: msg.sessionId,
                text: response
            })
        })

        dialog.on('intent/YantCaccia:Colore', (msg) => {
            let response = "Okay, cambio il colore della luce";
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
        })
        /*--------------------------------------------------------------*/
        /*--------------------------TIMER-------------------------------*/
        dialog.on('intent/YantCaccia:setTimer', (msg) => {
            var numero, secondi = 1;
            if (msg.slots[0].slotName == "numero") numero = msg.slots[0].value.value;
            //toDo: error management

            if (msg.slots[1].value.value == "secondi") secondi = 1;
            else if (msg.slots[1].value.value == "minuti" || msg.slots[1].value.value == "minuto") secondi = 60;
            else if (msg.slots[1].value.value == 'ora' || msg.slots[1].value.value == 'ore') secondi = 3600;

            var s = numero * secondi;
            console.log("Secondi effettivi: " + s);

            let response = "Okay, imposto il timer per " + msg.slots[0].value.value + " " + msg.slots[1].value.value;

            setTimeout(playTimer, s);

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
    })

}

function playTimer() {
    player = new Player('./alarm.mp3').play();
}

function stopPlaying() {
    player.stop();
}