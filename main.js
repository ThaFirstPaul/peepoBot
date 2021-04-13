require('dotenv').config();
var rafflespam = false;
var colorchanger = false;

function getRandomColorHex() {
	colors = ['Blue', 'BlueViolet', 'CadetBlue', 'Chocolate', 'Coral', 'DodgerBlue', 'Firebrick', 'GoldenRod', 'Green', 'HotPink', 'OrangeRed', 'Red', 'SeaGreen', 'SpringGreen', 'YellowGreen' ] 
	return colors[Math.floor(Math.random() * colors.length)];
}

function getTrueRandomColorHex() {
    const colorLetters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += colorLetters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const tmi = require('tmi.js');
const client = new tmi.Client({
	options: { debug: true, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: 'hannah_yee5',
		password: process.env.TWITCH_OAUTH_TOKEN_1,
	},
	channels: [ 'hahah_ye5' ]
});

const OPclient = new tmi.Client({
	options: { debug: true, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: 'hahah_ye5',
		password: process.env.TWITCH_OAUTH_TOKEN_2,
	},
	channels: [ 'hahah_ye5' , 'wolfabelle' , 'grinikth' ]
});

client.connect().catch(console.error);
OPclient.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
	if(self) return;
	
	if(tags.username === 'streamelements' && message.toLowerCase().includes('raffle has begun for')) {
		setTimeout(() => { client.say(channel, `!join`); }, (Math.floor(Math.random() * 4) + 1) * 1000); 
	}
	if(tags.username === 'streamelements' && message.toLowerCase().includes('hannah_yee5 won')) {
		client.say(channel, `!give hahah_ye5 all`);
	}
	if(tags.username === 'streamelements' && message.toLowerCase().includes('hannah_yee5 has won')) {
		client.say(channel, `!give hahah_ye5 all`);
	}
	
	if(tags.username === 'hexiaq' && message.toLowerCase().includes('!setpoints hexiaq')) {
		client.say(channel, `hannah denied`);
		client.deletemessage("hahah_ye5", tags.id);
	}
	if(tags.username.includes('hexiaq') && message.toLowerCase().includes('!addpoints')) {
		client.say(channel, `hannah denied`);
		client.deletemessage("hahah_ye5", tags.id);
	}
	if(message.toLowerCase() === '!messageuuid') {
		client.say(channel, `${tags.id}`);
		
	}
	if(tags.username.includes('nyyxx11dmaslkdm')) {
		client.deletemessage("hahah_ye5", tags.id);
		
	}
	
	
});


OPclient.on('message', (channel, tags, message, self) => {
	if(self) return;
	
	// Code to change the user color each message if colorchanger is enabled
	if(tags.username.includes('hahah_ye5') && colorchanger === true) {
		color_ = getTrueRandomColorHex();
		OPclient.say('hahah_ye5', `/color ${color_}`);
	}

	if(tags.username === 'streamelements' && message.toLowerCase().includes('raffle has begun')) {
		setTimeout(() => { OPclient.say(channel, `!join`); }, (Math.floor(Math.random() * 4) + 1) * 1000); 
	}
	
	if(tags.username === 'streamlabs' && message.toLowerCase().includes('try smoking frog products')) {
		setTimeout(() => { OPclient.say(channel, `peepoGlad SmokeTime `); }, Math.floor(Math.random()* 2000) + 100) ; 
	}

	if(tags.username.includes('hahah_ye5') && message.toLowerCase() ==='test') {
		OPclient.say(channel, `test nodders`);
	}
	if(!tags.username.includes('streamelements') && message.toLowerCase().includes('raffle has')) {
	OPclient.say(channel, `!join ${tags.username}'s real raffle`);
		setTimeout(() => { OPclient.say(channel, `Jebaited`); }, 3000); 
	}
	
	if(tags.username.toLowerCase() ==='hahah_ye5' && message.toLowerCase().startsWith('!!colorchanger')){
		if(colorchanger === true) {
			colorchanger = false;
		} else {
			color_ = getTrueRandomColorHex();
			OPclient.say('hahah_ye5', `/color ${color_}`);

			if (message.toLowerCase().startsWith('!!colorchanger once')) { 
				OPclient.say('hahah_ye5', `This is the new color: ${color_}`);
			} else { 
				colorchanger = true; 
			}
		}
	}
	
	if(message.toLowerCase().includes('paul')) {
		OPclient.say(channel, `ive gone to bed Sadge `);
	}


	if(tags.username.toLowerCase() ==='hahah_ye5' && message.toLowerCase().includes('wolfahalt bot')){
		OPclient.say('hahah_ye5', ``);
		OPclient.disconnect();
		client.disconnect();
	}
	
	

});
