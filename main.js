require('dotenv').config();
var rafflespam = false;

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
	channels: [ 'hahah_ye5' ]
});

client.connect().catch(console.error);
OPclient.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
	if(self) return;
	
	if(message.toLowerCase().includes('katy')) {
		client.say(channel, `@${tags.username}, Katy is a child`);
	}
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

	if(tags.username === 'streamelements' && message.toLowerCase().includes('raffle has begun')) {
		setTimeout(() => { OPclient.say(channel, `!join`); }, (Math.floor(Math.random() * 4) + 1) * 1000); 
	}

	if(tags.username.includes('hahah_ye5') && message.toLowerCase() ==='test') {
		OPclient.say(channel, `test nodders`);
	}
	if(!tags.username.includes('streamelements') && message.toLowerCase().includes('raffle has')) {
	OPclient.say(channel, `!join ${tags.username}'s real raffle`);
		setTimeout(() => { OPclient.say(channel, `Jebaited`); }, 3000); 
	}
	
	

});
