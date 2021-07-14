var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const colorstring = require("color-string");

const last_restart = Date.now();

require('dotenv').config();

var bot_enabled = true;

var colorchanger = false;
var lastcolor = "#FFFFFF";
var newcolor = "#FFFFFF";

var copyPerson = false;
var personToCopy = 'nobody';

var test_reply = "test YEEHAWS";

var enable_leds = false;
var leds_color = 'unknown';

var homies = ["idrksowhatever", "bauke", "beekay5", "whekau", "nyyxx10", "potatoesareus", "d_o_u_g_h_n_u_t", "jadescatalog", "hexiaq", "maximus6216", "leoz_13"];

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
	channels: [ 'hahah_ye5' , 'hannah_yee5' ] /* , 'grinikth'  , 'midnightcrystall' , 'tinemither' , 'dizzilulu' , 
				'freyzplayz' , 'whekau' , 'bauke' , 'beekay5' , 'lexiemariex' , 'ressnie' , 'innjeopardy' , 
				'hexiaq' , 'idrksowhatever' , 'jadescatalog' ] */
});

const OPclient = new tmi.Client({
	options: { },
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

const hannah_copy_client = new tmi.Client({
	options: {},
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: 'hannah_copy',
		password: process.env.TWITCH_OAUTH_TOKEN_3,
	},
	channels: [ 'hahah_ye5' ]
});

client.connect().catch(console.error);
OPclient.connect().catch(console.error);
hannah_copy_client.connect().catch(console.error);


client.on("connected", (OPclient, port) => {
    client.say("hahah_ye5", `[INFO] hannahbot is back online HandsUp`);
});

OPclient.on("timeout", (channel, username, reason, duration, userstate) => {
	if(self) return;
	
	if (homies.includes(username.toLowerCase())){
		OPclient.timeout("hahah_ye5", username, 1);
	}
});


client.on('message', (channel, tags, message, self) => {
	if(self) return;

	if(tags.username.includes('hahah_ye5') &&
	 colorchanger && !(/(colourchanger|colorchanger|cc)/).test(message.toLowerCase())
	 ) {
		lastcolor = newcolor;
		newcolor = getTrueRandomColorHex();
		OPclient.say('hahah_ye5', `/color ${newcolor}`);
		return;
	}
	
});

OPclient.on('message', (channel, tags, message, self) => {
	if(tags.username.includes('hannah_yee5')) return;

	// hannahbot status
	if((/\!(hannahbot|hhb) status/).test(message.toLowerCase())) {
		if (!bot_enabled){
			client.say(channel, `[INFO] hannahbot is disabled, please ask paul to enable it. FeelsBadMan `);
			return;
		} else {
			client.say(channel, `[INFO] hannahbot is up and running, use "!hannahbot help" for a list of commands. peepoHappy `);
			return;
		}
	}

	// Enable hannahbot 
	if(tags.username.toLowerCase() ==='hahah_ye5' && (/\!(hannahbot|hhb) (en|enable|on)/).test(message.toLowerCase()) && !bot_enabled) {
		client.say("hahah_ye5", `[INFO] hannahbot is back online HandsUp`);
		bot_enabled = true;
		return;
	}

	// Disable hannahbot 
	if(tags.username.toLowerCase() ==='hahah_ye5' && (/\!(hannahbot|hhb) (dis|disable|off)/).test(message.toLowerCase()) && bot_enabled){
		client.say('hahah_ye5', `[INFO] hannahbot disabled FeelsBadMan `);
		bot_enabled = false;
		return;
	}

	if (!bot_enabled) {return;}

	// hannahbot info
	if((/\!(hannahbot|hhb) (i|info)/).test(message.toLowerCase())) {
		client.say(channel, `[INFO] hannahbot v1.0.4. - I was born 54 days ago. - Uptime: ${Math.round((Date.now()-last_restart)/60000)} minutes FeelsStrongMan `);
		return;
	}

	// Lists commands / usage
	if(/\!(hannahbot|hhb) (commands|help|list|\?)/.test(message.toLowerCase())) {
		if (tags.username.includes('hahah_ye5')) {
			client.say("hahah_ye5", "[INFO] Usage: !hannahbot (channels | colorchanger | commands | copy | disable | enable | info | led | messageuuid | status)");
			return;
		} else {
			client.say("hahah_ye5", "[INFO] Usage: !hannahbot (channels | commands | info | status)");
			return;
		}
	}

	// Messageuuid test
	if((/\!(hannahbot|hhb) messageuuid/).test(message.toLowerCase())) {
		client.say(channel, `${tags.id}`);
		return;
	}
	
	// Words on Stream
	if(!tags.username.includes('hahah_ye5') && message.toLowerCase().includes('!continue')) {
		OPclient.say("hahah_ye5", "!continue");
		return;
	}
	if(!tags.username.includes('hahah_ye5') && message.toLowerCase().includes('!restart')) {
		OPclient.say("hahah_ye5", "!restart");
		return;
	}

	// channels commands
	if(tags.username.includes('hahah_ye5') && (/\!(hannahbot|hhb) channels/).test(message.toLowerCase())){
		var channelscommand = message.toLowerCase().split(" ");
		
		if (channelscommand.length < 3){
			//client.say("hahah_ye5", `[CHN] I have whispered you the channels I am in, @${tags.username} peepoHappy `);
			client.say("hahah_ye5", `[CHN] I'm currently in ${String(client.getChannels()).split(",").length} channels. Join another with ${channelscommand[0]} channels join {channel} peepoGlad  `)
			return;
		} else {
			if (channelscommand[2] === "join") {
				if (channelscommand.length < 4){
					client.say('hahah_ye5', `[CHN] Please supply a channel name!`);
					return;
				} else {
					client.say('hahah_ye5', `[CHN] I'm trying to join ${channelscommand[3]}'s channel`);
					client.join(channelscommand[3].trim());
					return;				
				}
			} 
		}
	}
	
	// Chat copy commands
	if(tags.username.includes(personToCopy) && copyPerson === true && !message.toLowerCase().includes('hannah stop')) {
		if(message.startsWith('!')) {
			hannah_copy_client.say(channel, 'LULW im not saying that.');
		} else {
			hannah_copy_client.say(channel, `${message}`); 
		}
	}
	
	if(tags.username.includes('hahah_ye5') && message.toLowerCase().startsWith('!copy')) {
		copyPerson = true;
		personToCopy = message.split(" ")[1];
		hannah_copy_client.say(channel, `okay, will copy ${personToCopy} PepeLa `);
	}
	
	if(!tags.username.includes('hannah_yee5')  && message.toLowerCase().startsWith('hannah copy me')) {
		hannah_copy_client.say(channel, `okay, i will ${tags.username} PepeLa stop this with "hannah stop" peepoGlad `);
		copyPerson = true;
		personToCopy = tags.username;
	}
	
	if(tags.username.includes(personToCopy)  && message.toLowerCase().includes('hannah stop')) {
		hannah_copy_client.say(channel, 'fine then, i wont copy you anymore PepeLa ');
		copyPerson = false;
	}
	

	// Colorchanger
	if(tags.username.toLowerCase() ==='hahah_ye5' && /\!(hannahbot|hhb) (colourchanger|colorchanger|cc)/.test(message.toLowerCase())){
		var colorchangercommand = message.toLowerCase().split(" ");
		if (colorchangercommand.length < 3){
			if(colorchanger === true) {
				colorchanger = false;
				client.say('hahah_ye5', `[CC] Colorchanger disabled.`);
			} else {
				color_ = getTrueRandomColorHex();
				OPclient.say('hahah_ye5', `/color ${color_}`);
				client.say('hahah_ye5', `[CC] Colorchanger enabled.`);
				colorchanger = true;
			}
		} else {
			if (/(single|once|one)/.test(colorchangercommand[2].toLowerCase())) { 
				colorchanger = false;
				color_ = getTrueRandomColorHex();
				lastcolor = color_;
				OPclient.say('hahah_ye5', `/color ${color_}`);
				client.say('hahah_ye5', `[CC] This is your new color: ${color_}`);
			} else { 
				if (/(last(|col|colour|color)|cur(|r|rent))/.test(colorchangercommand[2].toLowerCase())) {
					client.say('hahah_ye5', `[CC] Your last color was: ${lastcolor}`);
				} else { 
					if (/(set|select)/.test(colorchangercommand[2].toLowerCase())) {
						if (colorchangercommand.length < 4){ return; }
						color_ = colorchangercommand[3];
						OPclient.say('hahah_ye5', `/color ${color_}`);
						client.say('hahah_ye5', `[CC] This is your new color: ${color_}`);
					}
				}
			}
		}
	}

	// test command
	if(tags.username.toLowerCase() ==='hahah_ye5' && (/\!(hannahbot|hhb) test/).test(message.toLowerCase())){
		client.say('hahah_ye5', `[TEST] ${test_reply}`);
	}

	// // LED commands

	// Enable/disable
	if(/\!(hannahbot|hhb) led/.test(message.toLowerCase())){
		var ledcommand = message.toLowerCase().split(" ");
		if (ledcommand.length < 3){
			if(enable_leds) {
				client.say('hahah_ye5', `[LED] LED Command is enabled. Usage: !led {colour}`);
			} else {
				client.say('hahah_ye5', `[LED] LED Command currently disabled.`);
			}
		} else {
			if (tags.username.toLowerCase() ==='hahah_ye5') {
				if (/(enable|on)/.test(ledcommand[2].toLowerCase())){
					enable_leds = true;
					client.say('hahah_ye5', `[LED] LED Command has been enabled. Usage: !led {colour}`);
				} else if (/(disable|off)/.test(ledcommand[2].toLowerCase())){
					enable_leds = false;
					client.say('hahah_ye5', `[LED] LED Command has been disabled.`);
				}
			} 
		}
	}

	if((enable_leds || tags.username.toLowerCase() ==='hahah_ye5')  && /\!led yourm(u|o)m/.test(message.toLowerCase())){
		if(tags.username.toLowerCase() ==='beekay5'){
			client.say('hahah_ye5', `[LED] Paul's LED's set to: yourmom`);
			leds_color = "yourmom";
			
			const Http = new XMLHttpRequest();
			Http.open("GET", `http://192.168.100.24/win&R=255&G=90&B=90&W=1`);
			Http.send();
			return;
		} else {
			client.say('hahah_ye5', `[LED] Only katy has permission to set yourmom peepoHappy 

			⣿⣿⣿⣿⠟⣩⣴⣶⣦⣍⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⢏⣾⣿⣿⠿⣿⣿⣿⣌⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⠟⣩⣬⣭⠻⣿⣀⣿⣿⣿⢟⣤⡙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣷⣤⣒⠲⠶⢿⣘⣛⣻⠿⣿⣸⣿⣿⣷⣝⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⣿⠸⣿⣿⣿⣿⣿⣦⢹⣿⣿⣿⣿⣷⣌⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⡿⢉⣴⣶⣦⠙⣿⣿⣿⣿⡼⣿⣿⣿⣿⣿⢿⣷⡌⢿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⣷⡘⠿⠟⣛⡁⢻⣿⣿⣿⣿⣝⢿⣿⠻⣿⢮⣭⣥⣄⡹⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⡇⢿⣿⣿⣿⠘⣿⣿⣿⣿⣿⣷⣦⣟⡶⠶⢾⣭⣽⣗⡈⠻⣿⣿⣿⣿⣿
			⣿⣿⣷⡈⣿⣿⣿⣧⣌⠛⠿⣿⣿⣿⣿⣿⣿⣷⣷⡲⣶⣶⣾⣷⣌⡛⢿⣿⣿
			⣿⣿⣿⠗⡈⠻⣿⣿⡿⢛⣶⣤⣍⠻⣿⣿⣿⣿⣿⡿⠆⠻⠿⣿⣿⡿⠗⣢⣿
			⣿⣿⡏⢼⣿⣷⣶⢋⣴⣿⣿⣿⣿⡇⢀⣠⠄⣠⣶⣶⣿⣿⣷⣶⣶⣶⣿⣿⣿
			⣿⣿⣷⣌⠛⠛⠛⠈⠛⠛⠛⠛⢛⠁⢈⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⣿⣿⣿⣇⡈⢉⣩⡭⠽⢛⣒⣒⣒⣈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⣿⣿⣿⣿⣇⣉⣥⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿`);
			return;

			
		}
	}

	// LIGHT CONTROL
	if((enable_leds || tags.username.toLowerCase() ==='hahah_ye5') && message.toLowerCase().startsWith('!led')){
		const ledSite = "http://192.168.100.24/win"
		var custom_colors = {
			cum: [69,69,69],
			bauke: [105,19,55] // #691337
		};
		var colours_ = message.toLowerCase().split(" ");
		if (colours_.length < 2){
			client.say('hahah_ye5', `[LED] Current colour: ${leds_color} Usage: !led {colour}`);
			return;
		}

		var colour_ = colours_[1];
		if (custom_colors[colour_] === undefined) {
			colour_ = colorstring.get.rgb(colour_);
		} else {
			colour_ = custom_colors[colour_];
		}
		//1: check if cutom
		//2: else check colorstring
		//3: else not recognised
		
		
		if (colour_ === null) {
			client.say('hahah_ye5', `[LED] Color ${colours_[1].replace("!","")} does not exist.`);
		} else {
			client.say('hahah_ye5', `[LED] Paul's LED's set to: ${colour_}`);
			leds_color = `${colour_}`;
			
			const Http = new XMLHttpRequest();
			Http.open("GET", ledSite.concat(`&R=${colour_[0]}&G=${colour_[1]}&B=${colour_[2]}&W=${colour_[3]}`));
			Http.send();
		} 
	}
	
	

});
// Cock is always on my mind peepoGlad
// peepoAww . o O ( cock ) 

// ⠀⠀⠀⠀⠀// Very vital comments, do not delete:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡖⠋⠉⠉⠙⢲⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⡿⠀⠀⠀⠀⠀⠀⠃⠀⣤⡄⠀⠠⣤⠀⠀⢤⡄⡠⠤⣤⡀⡠⠤⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⣿⠀⠀⢸⡏⠀⠀⢸⡇⠀⠀⢹⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣄⠀⠀⠀⠀⢀⠄⠀⢿⡇⠀⢀⣿⡀⠀⢸⡇⠀⠀⢸⡇⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠓⠒⠒⠊⠁⠀⠀⠈⠛⠒⠁⠛⠃⠐⠚⠛⠂⠐⠚⠓⠂⠐⠛⠓⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣌⠻⣿⣿⣿⣧⠻
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⢿⣿⣿⣿⠟⢻⣿⣿⣿⡿⢿⣷⣌⡛⣿⣿⣷
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⡘⢿⡿⠃⣰⣿⣿⣿⣿⣿⣄⠢⣍⡛⢌⠻⣿
// ⣿⣿⣿⣿⣿⡇⠻⣿⣿⣿⣿⣿⣿⣷⡌⢡⣾⡿⠭⠝⣛⠻⠿⢿⣷⣌⡻⣷⡄⡹
// ⣿⣿⡇⢻⣿⣷⢸⣦⣙⠻⢿⣿⣿⠟⣠⡀⢡⣼⣿⣿⣦⣬⣷⣦⣤⣍⣛⠜⣿⡜
// ⣿⣿⢣⣆⠻⣿⡌⢿⣿⣿⣶⣬⣁⣐⡻⠿⠄⠙⠿⠿⢟⣛⣛⣛⣋⣭⣍⢩⣤⣝
// ⣿⡏⡼⢏⣀⠹⣿⡌⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⢸⣿⣿
// ⣿⢱⣴⣿⣿⣷⣌⡻⢌⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⠛⣻⣿⢸⣿⣿
// ⡿⣸⣿⣿⣿⣿⣿⠿⠷⢦⣼⣿⣿⣿⣿⣿⣿⣿⣋⠖⢁⣤⣶⣿⣿⣿⣿⢸⣿⣿
// ⡇⠿⠟⣋⣭⠭⣵⣾⣿⣶⡶⠾⠭⠙⢿⣿⣿⣿⣿⣾⣿⣿⣿⡟⡿⣿⢿⢸⣿⣿
// ⢡⣶⣿⣿⣿⣾⣿⣿⣿⡟⢘⣋⣍⣝⠊⣿⣿⣿⣿⣿⣿⣿⣿⣼⣶⣃⣾⠸⣿⣿
// ⣿⣿⢈⣿⣿⠃⢸⣿⣿⢣⠋⠶⠶⢊⢹⡿⠿⠛⠛⠉⠻⣿⣿⣿⣿⣿⡿⠇⣿⣿
// ⣿⡇⢾⣿⣿⢠⣿⣿⣿⣎⠻⠿⠛⢣⠃⠄⣠⣴⣶⣶⡆⣿⣿⣿⡿⠋⠄⠄⢻⣿
// ⢛⣓⠸⢟⣛⠘⣩⣶⣶⡌⡼⠋⣿⡸⡰⣾⣿⣿⣿⡿⢃⣿⠿⠋⣀⣀⠄⣠⡜⣿
// ⠈⠙⠂⠛⠿⠃⣩⣴⣶⣶⣦⣴⣿⣷⣱⣮⠭⠭⢔⣒⣩⡴⢚⣨⡜⣡⣾⣿⣷⠹

// 
// ⣿⣿⣿⣿⣿⣿⣿⢿⠟⠛⠿⠻⠿⠿⠟⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⡿⠛⢙⣨⣥⣶⣶⣿⢿⣿⣿⣷⣦⣅⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⠟⢀⡴⠟⠋⢉⣀⣠⣤⣤⣤⣀⠉⠻⣿⣧⡈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⠀⠁⣠⣴⣾⣿⣿⣿⣿⣿⣿⣿⣷⠀⢻⣿⣇⠝⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡀⣼⡿⠟⠀⠙⣛⣬⠱⣿⣿⣿⣿⣿⣿
// ⣿⣿⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⠿⠋⢀⠄⠁⣠⣶⣾⣿⣿⣿⡆⣼⣿⣿⣿⣿⣿
// ⣿⣿⠀⣀⠙⣛⣛⣻⠛⠋⣉⣢⣤⣾⠃⣰⡄⠸⣿⣿⣿⣿⣿⣷⠘⣿⣿⣿⣿⣿
// ⣿⣿⣤⢹⣷⣶⣶⣶⣾⣿⣿⣿⣿⣿⡄⠸⣷⠀⢻⣿⣿⡿⠟⠛⠡⣿⣿⣿⣿⣿
// ⣿⣿⣿⠄⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠄⠻⠇⢈⠁⠀⠀⠲⠠⠞⠿⣿⣿⣿⣿
// ⣿⣿⣿⣷⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⢤⠀⠀⢲⣿⣿⣿⣷⣤⡉⣻⣿⣿
// ⣿⣿⣿⣿⣧⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣳⡀⢻⣿⣿⣿⣿⣷⠐⣿⣿
// ⣿⣿⣿⣿⣿⣯⡈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⡇⡆⣿⣿⣿⣿⡟⣀⣿⣿
// ⣿⣿⣿⣿⣿⣿⣷⡀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⢃⡿⠿⠛⡋⣀⣾⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣷⣀⠹⣿⣿⣿⣿⣿⣿⣿⠿⠋⢁⣠⣿⡦⠐⠀⢈⡙⢿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⠋⢀⣿⣿⣿⣿⠟⢃⣤⣤⡀⠻⣿⣇⣠⣴⡿⠄⠹⣧⡸⣿
// ⣿⣿⣿⣿⣿⣿⡿⠃⢠⣾⣿⣿⡿⢋⣤⣿⣿⣿⣿⣄⠈⢿⡿⠋⣠⣤⣀⠈⣡⣿
// ⣿⣿⣿⠅⣀⣈⠁⣰⣿⣿⡿⠋⣤⣾⣿⣿⣿⣿⣿⣿⣷⣵⣂⣽⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣄⠘⢿⣿⣿⠟⠋⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣷⣤⣬⣅⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿

// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡜⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠠⢄⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠉⠢⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⢄⠀⠀⠀⠀⠰⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠠⡀⣀⣤⣦⣷⣤⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⣰⣷⣿⣿⠟⣫⠕⠒⢚⠹⣶⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⢐⣿⠟⠓⠂⠀⠀⠠⢨⣤⠉⠂⢳⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⡤⢶⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠸⡏⡄⢢⣖⠠⠀⠀⠈⠉⠀⠀⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣤⣤⣤⣤⡾⠗⢻⡷⠈⠻⡄⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⢏⠀⠈⠋⠀⠀⠄⢀⠀⠉⠀⠀⢱⠀⠀⠐⠖⣖⠒⠋⠉⠁⣀⣀⣤⣾⠿⠋⠁⠀⠀⢸⣧⠀⠀⠃⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠈⢦⡀⠐⠒⠒⠈⠀⠀⢀⣠⢆⡞⠀⠀⠀⣼⣏⠃⠀⠀⠀⣿⣿⣿⣿⡆⠀⡀⠀⠀⣾⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠈⠳⢤⣶⡶⣿⣿⣿⢟⡥⡊⠀⠀⠀⣼⣟⠂⠀⠀⠀⣸⣿⣿⣿⣿⠀⠀⣿⣆⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠧⠀⠙⠻⣿⣈⠀⠀⢀⣾⢟⠎⠀⠀⠀⢠⣿⣿⣿⣿⡟⠀⢀⣿⣿⡆⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠀⠀⠁⠜⠻⣾⣴⣿⣯⡂⠀⢀⠀⢀⣾⣿⣿⣿⡿⠁⠀⣼⣿⣿⢡⣻⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠀⠀⠈⠀⠘⠈⠛⠷⣷⣿⣷⣶⣌⣾⣿⣿⣿⣿⠃⠀⣼⣿⣿⠃⢸⠃⠻⣿⣧⠀⠀⠀⠀⣀⡀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡌⡤⠁⠀⠀⠀⠀⠀⠀⠀⠉⢻⣿⣾⣿⣿⣿⡿⠿⠿⣶⣿⣿⣯⣀⣟⣠⣴⣷⣾⣿⡿⠛⠛⠻⣟⣷⠒⠄
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⣿⡿⠋⠀⣰⣿⣿⡿⠃⣸⠟⠉⠁⠀⠀⠟⠛⠛⠚⠫⠀⠠⠙⠠⠇
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠤⠾⠿⠿⠋⠐⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⡿⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⠏⠄⠄⠄⣿⣿⣷⣷⣿⣶⣶⣷⣶⣶⣶⣶⣀⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⠐⠄⠄⠄⠉⢉⣉⠉⠛⣿⣟⠛⠛⠛⠛⣛⠉⢿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⡏⠉⠄⠄⠄⠄⠄⠿⣿⡷⠄⠄⣿⣿⣦⠄⠄⠿⡷⠄⣿⠿⣿⣿⣿⣿
// ⣿⣿⣿⡿⠫⠄⠠⠄⠄⢠⡀⠄⠈⣡⣷⣇⣛⣻⣿⣦⠄⠄⠉⣱⣷⠤⢿⣿⣿⣿
// ⣿⣿⣿⣷⢸⠄⢰⣶⠄⢸⣿⢹⡿⢿⡿⢿⡿⢿⡿⢿⡿⢿⣿⢻⣿⡷⢿⣿⣿⣿
// ⣿⣿⣿⣿⣞⣀⡀⠄⠄⠄⠁⢸⣇⣸⣇⣸⣇⣸⣇⣸⣇⣸⣿⠈⣿⣧⣾⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠉⣀⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿


// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠰⠛⠻⢿⣿⠿⠿⠟⡿⠿⢿⣿⠿⠿⣿⠃⠀⠟⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⣴⡄⠀⠘⡇⠀⣤⣤⡇⠀⣼⣿⠀⢠⡏⠀⢠⣦⠀⠀⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠛⠃⠀⡼⠀⠀⣿⣿⠀⠀⠛⠃⠀⢸⠁⠀⣼⡏⠀⢠⡟⠉⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣶⣶⣾⣷⣶⣾⣿⣿⣷⣶⣶⣶⣶⣿⣶⣶⣿⣷⣶⣾⣷⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿

// THIS STREAMER LOVES A LOT OF 
// ░█████╗░░█████╗░░█████╗░██╗░░██╗
// ██╔══██╗██╔══██╗██╔══██╗██║░██╔╝
// ██║░░╚═╝██║░░██║██║░░╚═╝█████═╝░
// ██║░░██╗██║░░██║██║░░██╗██╔═██╗░
// ╚█████╔╝╚█████╔╝╚█████╔╝██║░╚██╗
// ░╚════╝░░╚════╝░░╚════╝░╚═╝░░╚═╝