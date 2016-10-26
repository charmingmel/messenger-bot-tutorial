'use strict'

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const movies = require('./data/movie');
const cheerio = require('cheerio');
const fs = require('fs');

app.set('port', (process.env.PORT || 7777))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	// request('http://ozonecinemas.com/now_showing.htm', function(err, respond, html) {
	// 	// let body = cheerio.load(html);
	// 	let $ = cheerio.load(html);
	// 	let content = $('td').attr('width','540').first().html();
	// 	// [0].children[1].children[0].children;
	// 	// console.log(content)
	// 	fs.writeFile('data/content.html', content, (err) => {
	// 	  if (err) throw err;
	// 	  console.log('It\'s saved!');
	// 	});
	// })
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	console.log('Query --->',req.query)
	if (req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// to post data
app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		console.log('sender ===>', sender);
		if (event.message && event.message.text) {
			let text = event.message.text
			console.log('Text', text);
			if (text === 'movies') {
				sendGenericMessage(sender)
				continue
			}
			sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables
const token = process.env.FB_PAGE_TOKEN

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function sendGenericMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "Avatar is showing now",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://images2.fanpop.com/image/photos/12300000/Avatar-avatar-12304477-1280-720.jpg",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.enksoft.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Midnight in Paris Las Vegas",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "https://upload.wikimedia.org/wikipedia/commons/5/51/The_hotel_Paris_Las_Vegas_as_seen_from_the_hotel_The_Bellagio.jpg",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
