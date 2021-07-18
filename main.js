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

var WOS_enabled = false;

var homies = process.env.HOMIES_LIST;

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

function proper_date(time_in_ms){
	var seconds = "";
	var mins = "";
	var hours = "";
	var days = "";
	const time_in_s = Math.floor(time_in_ms/1000);

	seconds = time_in_s%60;

	if (time_in_s >59){
		var mins_ = Math.floor(time_in_s/60)%60;
		mins = `${mins_}m and `;
	}

	if (mins_ >59){
		var hours_ = Math.floor(time_in_s/3600) % 60;
		hours = `${hours_}h, `;
	}

	if (hours_ >23){
		var days_ = Math.floor(time_in_s/86400)%60;
		days = `${days_}d, `;
	}

	return `${days}${hours}${mins}${seconds}seconds`;
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

client.on('message', (channel, tags, message, self) => {
	if(self) return;

	if(tags.username.toLowerCase() ==='hahah_ye5' &&
	 colorchanger && !(/(colourchanger|colorchanger|cc)/).test(message.toLowerCase())
	 ) {
		lastcolor = newcolor;
		newcolor = getTrueRandomColorHex();
		OPclient.say('hahah_ye5', `/color ${newcolor}`);
		return;
	}
	
});

OPclient.on('message', (channel, tags, message, self) => {
	if(tags.username.toLowerCase() === 'hannah_yee5') return;

	// hannahbot status
	if((/^(\!hannahbot|\!hhb|hhb) (i|info|uptime|status|version)/).test(message.toLowerCase())) {
		client.say(channel, `[INFO] hannahbot v1.0.5. - I was born 54 days ago. - Currently enabled - Uptime: ${ proper_date(Date.now()-last_restart) } FeelsStrongMan `);
		return;
	}

	// Enable hannahbot 
	if(tags.username.toLowerCase() ==='hahah_ye5' && (/^(\!hannahbot|\!hhb|hhb) (enable|on)/).test(message.toLowerCase()) && !bot_enabled) {
		client.say("hahah_ye5", `[INFO] hannahbot is back online HandsUp`);
		bot_enabled = true;
		return;
	}

	// Disable hannahbot 
	if(tags.username.toLowerCase() ==='hahah_ye5' && (/^(\!hannahbot|\!hhb|hhb) (disable|off)/).test(message.toLowerCase()) && bot_enabled){
		client.say('hahah_ye5', `[INFO] hannahbot disabled FeelsBadMan `);
		bot_enabled = false;
		return;
	}
	// Check if hannahbot is active, if yes continue
	if (!bot_enabled) {
		client.say(channel, `[INFO] hannahbot is disabled, please ask paul to enable it. FeelsBadMan `);
		return;
	}



	// creates array of args from the given command eg. !hhb list -> ['!hhb', 'list']
	const command_args = message.toLowerCase().split(" ");

	// hannahbot 
	if(command_args.length < 2 && (/^(\!hannahbot|\!hhb|hhb)/).test(message.toLowerCase())){
		client.say(channel, `[INFO] Hi! I'm hannahbot, use "!hannahbot help" for a list of commands. peepoHappy `);
		return;
	}

	// Lists commands / usage
	if(/^(\!hannahbot|\!hhb|hhb) (commands|help|list|\?)/.test(message.toLowerCase())) {
		if (tags.username.toLowerCase() ==='hahah_ye5') {
			client.say("hahah_ye5", "[INFO] Usage: !hannahbot (channels | colorchanger | commands | copy | disable | enable | info | led | messageuuid | status)");
			return;
		} else {
			client.say("hahah_ye5", "[INFO] Usage: !hannahbot (channels | commands | info | status)");
			return;
		}
	}

	// Messageuuid test
	if((/^(\!hannahbot|\!hhb|hhb) messageuuid/).test(message.toLowerCase())) {
		client.say(channel, `${tags.id}`);
		return;
	}
	
	// Words on Stream
	if(!tags.username.toLowerCase() ==='hahah_ye5' && message.toLowerCase().includes('!continue') && WOS_enabled) {
		OPclient.say("hahah_ye5", "!continue");
		return;
	}

	if(!tags.username.toLowerCase() ==='hahah_ye5' && message.toLowerCase().includes('!restart') && WOS_enabled) {
		OPclient.say("hahah_ye5", "!restart");
		return;
	}

	if(tags.username.toLowerCase() ==='hahah_ye5' && (/^(\!hannahbot|\!hhb|hhb) wos/).test(message.toLowerCase())){
		if (command_args[2] === 'disable') {
			WOS_enabled = false;
			client.say('hahah_ye5', `[WOS] Command has been disabled.`);
			return;
		} else if (command_args[2] === 'enable'){
			WOS_enabled = true;
			client.say('hahah_ye5', `[WOS] Command is enabled. Usage: !continue and !restart`);
			return;
		}
	}


	// channels commands
	if(tags.username.toLowerCase() ==='hahah_ye5' && (/^(\!hannahbot|\!hhb|hhb) channels/).test(message.toLowerCase())){
		
		if (command_args.length < 3){
			//client.say("hahah_ye5", `[CHN] I have whispered you the channels I am in, @${tags.username} peepoHappy `);
			client.say("hahah_ye5", `[CHN] I'm currently in ${String(client.getChannels()).split(",").length} channels. Join another with ${command_args[0]} channels join {channel} peepoGlad  `)
			return;
		} else {
			if (command_args[2] === "join") {
				if (command_args.length < 4){
					client.say('hahah_ye5', `[CHN] Please supply a channel name!`);
					return;
				} else {
					client.say('hahah_ye5', `[CHN] I'm trying to join ${command_args[3]}'s channel`);
					client.join(command_args[3].trim());
					return;				
				}
			} 
		}
	}
	
	
	// Colorchanger
	if(tags.username.toLowerCase() ==='hahah_ye5' && /^(\!hannahbot|\!hhb|hhb) (colourchanger|colorchanger|cc)/.test(message.toLowerCase())){
		if (command_args.length < 3){
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
			if (/(single|once|one)/.test(command_args[2].toLowerCase())) { 
				colorchanger = false;
				color_ = getTrueRandomColorHex();
				lastcolor = color_;
				OPclient.say('hahah_ye5', `/color ${color_}`);
				client.say('hahah_ye5', `[CC] This is your new color: ${color_}`);
			} else { 
				if (/(last(|col|colour|color)|cur(|r|rent))/.test(command_args[2].toLowerCase())) {
					client.say('hahah_ye5', `[CC] Your last color was: ${lastcolor}`);
				} else { 
					if (/(set|select)/.test(command_args[2].toLowerCase())) {
						if (command_args.length < 4){ return; }
						color_ = command_args[3];
						OPclient.say('hahah_ye5', `/color ${color_}`);
						client.say('hahah_ye5', `[CC] This is your new color: ${color_}`);
					}
				}
			}
		}
	}

	// test command
	if(tags.username.toLowerCase() ==='hahah_ye5' && (/^(\!hannahbot|\!hhb|hhb) test/).test(message.toLowerCase())){
		client.say('hahah_ye5', `[TEST] ${test_reply}`);
	}

	// // LED commands

	// Enable/disable
	if(/^(\!hannahbot|\!hhb|hhb) led/.test(message.toLowerCase())){
		if (command_args.length < 3){
			if(enable_leds) {
				client.say('hahah_ye5', `[LED] Command is enabled. Usage: !led {colour}`);
			} else {
				client.say('hahah_ye5', `[LED] Command currently disabled.`);
			}
		} else {
			if (tags.username.toLowerCase() ==='hahah_ye5') {
				if (/(enable|on)/.test(command_args[2].toLowerCase())){
					enable_leds = true;
					client.say('hahah_ye5', `[LED] Command has been enabled. Usage: !led {colour}`);
				} else if (/(disable|off)/.test(command_args[2].toLowerCase())){
					enable_leds = false;
					client.say('hahah_ye5', `[LED] Command has been disabled.`);
				}
			} 
		}
	}

	if((enable_leds || tags.username.toLowerCase() ==='hahah_ye5')  && /^\!led yourm(u|o)m/.test(message.toLowerCase())){
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
	if(message.toLowerCase().startsWith('!led')){
		if (!(tags.username.toLowerCase() ==='hahah_ye5'|| enable_leds)) {
			client.say('hahah_ye5', `[LED] Command currently disabled.`);
			return;
		}
		const ledSite = "http://192.168.100.24/win"
		var custom_colors = {
			cum: [69,69,69],
			bauke: [105,19,55] // #691337
		};
		if (command_args.length < 2){
			client.say('hahah_ye5', `[LED] Current colour: ${leds_color} Usage: !led {colour}`);
			return;
		}

		var colour_ = command_args[1];
		if (custom_colors[colour_] === undefined) {
			colour_ = colorstring.get.rgb(colour_);
		} else {
			colour_ = custom_colors[colour_];
		}
		//1: check if cutom
		//2: else check colorstring
		//3: else not recognised
		
		
		if (colour_ === null) {
			client.say('hahah_ye5', `[LED] Color ${command_args[1].replace("!","")} does not exist.`);
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