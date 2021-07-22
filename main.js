var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const colorstring = require("color-string");

const last_restart = Date.now();
const bot_creation = 1618113720000;

require('dotenv').config();

// JSON storage for hannahbot read
const fs = require("fs");
let hannahbot_storage = JSON.parse(fs.readFileSync('./hannahbot_storage.json', 'utf-8'));

var leds_color = 'unknown';

var bot_enabled = true;

var colorchanger = false;
var lastcolor = "#FFFFFF";
var newcolor = "#FFFFFF";

var copyPerson = false;
var personToCopy = 'nobody';

var WOS_enabled = false;

// an array of objects where each object is a channel that hannahbot is in 
var hannahbot_channels_last_message = [
	{
		channel:"hannah_ye5",
		unicode_last_message:true
	}
];

var hannahbot_reminders = hannahbot_storage["reminders"];

function save_hannahbot_storage() {
	if (fs.writeFileSync('./hannahbot_storage.json', JSON.stringify(hannahbot_storage), 'utf-8')) {
		return true
	} else {
		return false
	}
}

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
		var mins_ = Math.floor(time_in_s/60);
		mins = `${mins_%60}m and `;
	}

	if (mins_ >59){
		var hours_ = Math.floor(time_in_s/3600);
		hours = `${hours_%24}h, `;
	}

	if (hours_ >23){
		var days_ = Math.floor(time_in_s/86400);
		days = `${days_}d, `;
	}

	return `${days}${hours}${mins}${seconds}seconds`;
}

function clientsay(channel_to_send_to, message){
	channel_to_send_to = channel_to_send_to.toLowerCase();
	//find the channel in the array of channels
	let channel_last_message_object = hannahbot_channels_last_message.find(o => o.channel === channel_to_send_to);
	// if no channel found, create new one
	if (channel_last_message_object === undefined) {
		hannahbot_channels_last_message.push({
			channel:channel_to_send_to,
			unicode_last_message:false
		});
	} else {
		// if channel was found and last message had no unicode
		if (channel_last_message_object.unicode_last_message === false){
			channel_last_message_object.unicode_last_message = true;
			message = `${message}\u{E0000}`;
		} else {// if channel was found and last message had unicode
			channel_last_message_object.unicode_last_message = false;
		}
	}
	
	client.say(channel_to_send_to, message);
	return;
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
	channels: []
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

	hannahbot_storage["channels"].forEach(channel_ => {
		client.join(channel_); 
	});
	client.say("hahah_ye5", `[INFO] hannahbot has joined ${hannahbot_storage["channels"].length +1} channels`);

	
	// setTimeout(() => {
		
	// }, timeout);
});


// All channels hannahbot is in
client.on('message', (channel, tags, message, self) => {
	if(self) return;

	// checks for messages from hahah_ye5 when colourchanger is on 
	if(tags.username.toLowerCase() ==='hahah_ye5' && colorchanger && !(/ (colourchanger|colorchanger|cc) /).test(message.toLowerCase())
	 ) {
		lastcolor = newcolor;
		newcolor = getTrueRandomColorHex();
		OPclient.say('hahah_ye5', `/color ${newcolor}`);
		return;
	}
	
	// if jade is a donker and types hbb instead of hhb 
	if(tags.username.toLowerCase() === "jadescatalog" && (/(\!?hbb)/).test(message.toLowerCase())){
		clientsay(channel, "Jadeyy use !hhb u absolute donker");
	}

	// checks if the command is for hannahbot
	if(!(/^(\!hannahbot|\!?hhb)/).test(message.toLowerCase())) return;
	if(tags.username.toLowerCase() === 'hannah_yee5') return;

	// removes chatterino voodoo char
	message = message.replace(/\u{E0000}/gu, '').trim();

	// creates array of args from the given command eg. !hhb list -> ['!hhb', 'list']
	const command_args = message.toLowerCase().split(" ");

	// checks if the command doesnt continue past hhb/!hhb/!hannahbot eg. !hannahbottest
	if(!(/^(\!hannahbot|\!?hhb)$/).test(command_args[0])) return;

	hannahbot_storage["last_command"]["user"] = tags.username;
	hannahbot_storage["last_command"]["command"] = message;
	save_hannahbot_storage();

	// commands available when hannahbot is disabled
	// hannahbot info
	if((/^(i|info|uptime|version)$/).test(command_args[1])) {
		var is_enabled = "disabled";
		if (bot_enabled === true) is_enabled = "enabled" ;
		clientsay(channel, `[INFO] hannahbot v1.0.5. - I was born ${ proper_date(Date.now()-bot_creation) } ago. - Currently ${is_enabled} - Uptime: ${ proper_date(Date.now()-last_restart) } FeelsStrongMan `);
		return;
	}

	// Enable hannahbot 
	if(tags.username.toLowerCase() ==='hahah_ye5' && (/^(enable|on)$/).test(command_args[1]) && !bot_enabled) {
		clientsay(channel, `[INFO] hannahbot is back online HandsUp`);
		bot_enabled = true;
		return;
	}

	// Disable hannahbot 
	if(tags.username.toLowerCase() ==='hahah_ye5' && (/^(disable|off)$/).test(command_args[1]) && bot_enabled){
		clientsay(channel, `[INFO] hannahbot disabled FeelsBadMan `);
		bot_enabled = false;
		return;
	}

	// Check if hannahbot is active, if yes continue
	if (!bot_enabled) {
		clientsay(channel, `[INFO] hannahbot is disabled, please ask paul to enable it. FeelsBadMan `);
		return;
	}

	// hannahbot 
	if(command_args.length < 2){
		clientsay(channel, `[INFO] Hi! I'm hannahbot, use "!hannahbot help" for a list of commands. peepoHappy `);
		return;
	}

	// whats my colour
	if((/^mycolou?r$/).test(command_args[1])) {
		clientsay(channel, `[INFO] Your colour is: ${ tags.color } `);
		
		return;
	}

	// Lists commands / usage
	if(/^(commands|help|list|\?)$/.test(command_args[1])) {
		if (tags.username.toLowerCase() ==='hahah_ye5') {
			clientsay(channel, "[INFO] Usage: !hannahbot (channels | colorchanger | commands | copy | disable | enable | info | led | messageuuid | status)");
			return;
		} else {
			clientsay(channel, "[INFO] Usage: !hannahbot (channels | commands | info | status)");
			return;
		}
	}

	// Messageuuid test
	if((/^messageuuid$/).test(command_args[1])) {
		clientsay(channel, `${tags.id}`);
		return;
	}

	// channels commands
	if((/^channels?/).test(command_args[1])){
		
		if (command_args.length < 3){
			//client.say("hahah_ye5", `[CHN] I have whispered you the channels I am in, @${tags.username} peepoHappy `);
			clientsay(channel, `[CHN] I'm currently in ${String(client.getChannels()).split(",").length} channels. Join another with ${command_args[0]} channels join {channel} peepoGlad  `)
			return;
		} else {
			if (command_args[2] === "join") {
				if (command_args.length < 4){
					clientsay(channel, `[CHN] Please supply a channel name!`);
					return;
				} else {
					clientsay(channel, `[CHN] I'm trying to join ${command_args[3]}'s channel`);
					client.join(command_args[3].trim());
					hannahbot_storage.channels.push(command_args[3].trim());
					save_hannahbot_storage();
					return;
				}
			}
		}
	}

	// test command
	if((/^test$/).test(command_args[1])){
		clientsay(channel, `[TEST] "${hannahbot_storage["vars"]["test_reply"]}"`);
		return;
	}

	// fav song command 
	if((/^(song|fav|favou?rite)$/).test(command_args[1])) {
		clientsay(channel, `[INFO] paul's current favourite song: ${hannahbot_storage["vars"]["fav_song"]} catJAM`);
		return;
	}

	
	// Colorchanger
	if(tags.username.toLowerCase() ==='hahah_ye5' && /^(\!hannahbot|\!hhb|hhb) (colourchanger|colorchanger|cc)/.test(message.toLowerCase())){
		if (command_args.length < 3){
			if(colorchanger === true) {
				colorchanger = false;
				clientsay(channel, `[CC] Colorchanger disabled.`);
				return;
			} else {
				color_ = getTrueRandomColorHex();
				OPclient.say(channel, `/color ${color_}`);
				clientsay(channel, `[CC] Colorchanger enabled.`);
				colorchanger = true;
				return;
			}
		} else {
			if (/(single|once|one)/.test(command_args[2].toLowerCase())) { 
				colorchanger = false;
				color_ = getTrueRandomColorHex();
				lastcolor = color_;
				OPclient.say(channel, `/color ${color_}`);
				clientsay(channel, `[CC] This is your new color: ${color_}`);
				return;
			} else { 
				if (/(last(|col|colour|color)|cur(|r|rent))/.test(command_args[2].toLowerCase())) {
					clientsay(channel, `[CC] Your last color was: ${lastcolor}`);
					return;
				} else { 
					if (/(set|select)/.test(command_args[2].toLowerCase())) {
						if (command_args.length < 4){ return; }
						color_ = command_args[3];
						OPclient.say(channel, `/color ${color_}`);
						clientsay(channel, `[CC] This is your new color: ${color_}`)
						colorchanger = false;
						return;
					} else { 
						if (/(reset|default|normal)/.test(command_args[2].toLowerCase())) {
							OPclient.say(channel, `/color #d9453b`);
							clientsay(channel, `[CC] Your color has been reset to normal.`);
							colorchanger = false;
							return;
						}
					}
				}
			}
		}
	}

	// reminders command
	if((/^remind(ers?)?$/).test(command_args[1])) { 
		return;
	}

	// if command was not found and channel is not hahah_ye5
	if (!(channel.toLowerCase() === "#hahah_ye5")) {
		if (tags.username.toLowerCase() === "hahah_ye5"){
			clientsay(channel, `[INFO] Command "${message}" was not found Sadge `);
			return;
		} else {
			clientsay(channel, `[INFO] That command was not found Sadge If you believe this is an error, inform paul.`);
			return;
		}
	}
	
	/// Commands only in hahah_ye5' channel

	// enable / disable WOS commands
	if(tags.username.toLowerCase() ==='hahah_ye5' && (/^wos$/).test(command_args[1])){
		if ((/^(disable|off)$/).test(command_args[2])) {
			WOS_enabled = false;
			client.say('hahah_ye5', `[WOS] Command has been disabled.`);
			return;
		} else if ((/^(enable|on)$/).test(command_args[2])){
			WOS_enabled = true;
			client.say('hahah_ye5', `[WOS] Command is enabled. Usage: !continue and !restart`);
			return;
		}
	}

	// modme command
	if((/^modme$/).test(command_args[1])){
		if(hannahbot_storage["homies"].includes(tags.username.toLowerCase())){
			OPclient.mod(channel, tags.username);
			client.say('hahah_ye5', `[MOD] You have been modded, @${tags.username}!`);
		} else {
			client.say('hahah_ye5', `[MOD] Sorry, you dont have permission to do that @${tags.username}!`);
		}
	}

	// vipme command
	if((/^vipme$/).test(command_args[1])){
		if(hannahbot_storage["homies"].includes(tags.username.toLowerCase())){
			OPclient.vip(channel, tags.username);
			client.say('hahah_ye5', `[VIP] You have been VIP'd, @${tags.username}!`);
		} else {
			client.say('hahah_ye5', `[VIP] Sorry, you dont have permission to do that @${tags.username}!`);
		}
	}

	// // LED commands

	// Enable/disable
	if((/^(led|lights?)$/).test(command_args[1])){
		if (command_args.length < 3){
			if(hannahbot_storage["vars"]["enable_leds"]) {
				client.say('hahah_ye5', `[LED] Command is enabled. Usage: !led {colour}`);
			} else {
				client.say('hahah_ye5', `[LED] Command currently disabled.`);
			}
		} else {
			if (tags.username.toLowerCase() ==='hahah_ye5') {
				if (/(enable|on)/.test(command_args[2].toLowerCase())){
					hannahbot_storage["vars"]["enable_leds"] = true;
					client.say('hahah_ye5', `[LED] Command has been enabled. Usage: !led {colour}`);
				} else if (/(disable|off)/.test(command_args[2].toLowerCase())){
					hannahbot_storage["vars"]["enable_leds"] = false;
					client.say('hahah_ye5', `[LED] Command has been disabled.`);
				}
			} 
		}
	}
});


// special commands in hahah_ye5' chat
OPclient.on('message', (channel, tags, message, self) => {
	if(!channel === "#hahah_ye5") return;
	if(tags.username.toLowerCase() === "hannah_yee5" || tags.username.toLowerCase() === "hannah_copy") return;

	// creates array of args from the given command eg. !hhb list -> ['!hhb', 'list']
	const command_args = message.toLowerCase().split(" ");

	// Words on Stream
	if(!tags.username.toLowerCase() ==='hahah_ye5' && message.toLowerCase().includes('!continue') && WOS_enabled) {
		OPclient.say("hahah_ye5", "!continue");
		return;
	}

	if(!tags.username.toLowerCase() ==='hahah_ye5' && message.toLowerCase().includes('!restart') && WOS_enabled) {
		OPclient.say("hahah_ye5", "!restart");
		return;
	}

	// LED commmands 
	if((hannahbot_storage["vars"]["enable_leds"] || tags.username.toLowerCase() ==='hahah_ye5')  && /^\!led yourm(u|o)m/.test(message.toLowerCase())){
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

	
	if(/^\!led$/.test(command_args[0]) ){
		if (!(tags.username.toLowerCase() ==='hahah_ye5'|| hannahbot_storage["vars"]["enable_leds"])) {
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