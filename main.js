require('dotenv').config();
var rafflespam = false;
var colorchanger = false;

var copyPerson = false;
var personToCopy = 'nobody';

var test_reply = "test YEEHAWS";

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
	
	if(tags.username.includes('bauke') && message.toLowerCase().includes('!modme')) {
		OPclient.deletemessage("hahah_ye5", tags.id);
		OPclient.mod("hahah_ye5", "bauke");
	}
	
	if(!tags.username.includes('hahah_ye5') && message.toLowerCase().includes('!continue')) {
		OPclient.say("hahah_ye5", "!continue");
	}
	
	if(!tags.username.includes('hahah_ye5') && message.toLowerCase().includes('!restart')) {
		OPclient.say("hahah_ye5", "!restart");
	}
	
	
	if(tags.username.includes(personToCopy) && copyPerson === true && !message.toLowerCase().includes('paul stop')) {
		if(message.includes('!')) {
			OPclient.say(channel, 'LULW im not saying that.');
		} else {
			OPclient.say(channel, message);
		}
	}
	
	if(!tags.username.includes('hahah_ye5')  && message.toLowerCase().startsWith('paul copy me')) {
		OPclient.say(channel, `okay, i will ${tags.username} PepeLa `);
		copyPerson = true;
		personToCopy = tags.username;
	}
	
	if(tags.username.includes(personToCopy)  && message.toLowerCase().includes('paul stop')) {
		OPclient.say(channel, 'fine then, i wont copy you anymore PepeLa ');
		copyPerson = false;
	}
	
	if(tags.username.includes('hahah_ye5') && message.toLowerCase().startsWith('!copy')) {
		copyPerson = true;
		personToCopy = message.split(" ")[1];
		OPclient.say(channel, `okay, will copy ${personToCopy} PepeLa `);
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

	if(tags.username.toLowerCase() ==='hahah_ye5' && message.toLowerCase().startsWith('!!test')){
		OPclient.say('hahah_ye5', `${test_reply}`);

		if (message.toLowerCase().startsWith('!!colorchanger once')) { 
			OPclient.say('hahah_ye5', `This is the new color: ${color_}`);
		} 
		
	}

	if(tags.username.toLowerCase() ==='hahah_ye5' && message.toLowerCase().includes('wolfahalt paul bot')){
		OPclient.say('hahah_ye5', ``);
		OPclient.disconnect();
		client.disconnect();
	}
	
	

});
