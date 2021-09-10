var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const colorstring = require("color-string");

const last_restart = Date.now();
const bot_creation = 1618113720000;

require('dotenv').config();

if (process.env.TWITCH_USERNAME_BOT=="" || process.env.TWITCH_USERNAME_OWNER=="" || process.env.TWITCH_OAUTH_TOKEN_BOT=="" || process.env.TWITCH_OAUTH_TOKEN_OWNER=="") {
	console.log("Error: Some OAUTH-Token or Username is empty, please check your '.env' config.");
	process.exit(1);
} 

// JSON storage for peepoBot read
const fs = require("fs");
let peepoBot_storage = JSON.parse(fs.readFileSync('./peepoBot_storage.json', 'utf-8'));

var leds_color = 'unknown';

var bot_enabled = true;

var reminder_timeout_id = undefined;

var colorchanger = false;
var lastcolor = "#FFFFFF";
var newcolor = "#FFFFFF";

var copyPerson = false;
var personToCopy = 'nobody';

var WOS_enabled = false;

// an array of objects where each object is a channel that peepoBot is in
var peepoBot_channels_last_message = [
];

// Adds a reminder to the peepoBot storage
function addreminder(channel, in_how_long, from_who, to_who, where_to_remind, when_to_remind, what_to_remind) {
	reminder_to_add = {
		"remindee": from_who,
		"reminder": what_to_remind,
		"remind_time": when_to_remind,
		"remind_who": to_who,
		"remind_where": where_to_remind
	};

	peepoBot_storage["reminders"].push(reminder_to_add);
	peepoBot_storage.reminders = peepoBot_storage.reminders.sort((a, b) => a.remind_time - b.remind_time);
	save_peepoBot_storage();
	updatereminders();

	if (from_who === to_who) { to_who = "you"; } else { to_who = "them" }
	clientsay(channel, `[REM] Okay, I will remind ${to_who} in ${in_how_long}.`);
	return;
}

// Loads the closest reminder into the timeout, if there is one
function updatereminders() {
	if (peepoBot_storage["reminders"].length < 1) return;
	curr_reminder = peepoBot_storage["reminders"][0];
	if (reminder_timeout_id !== undefined) { clearTimeout(reminder_timeout_id); }

	reminder_timeout_id = setTimeout(() => {
		if (curr_reminder["remindee"] === curr_reminder["remind_who"]) {
			clientsay(curr_reminder["remind_where"], `[REM] @${curr_reminder["remind_who"]}, ${curr_reminder["reminder"]} - from yourself`);
		} else {
			clientsay(curr_reminder["remind_where"], `[REM] @${curr_reminder["remind_who"]}, ${curr_reminder["reminder"]} - from @${curr_reminder["remindee"]}`);
		}
		peepoBot_storage["reminders"].shift();
		save_peepoBot_storage();
		updatereminders();
	}, Math.max(1000, curr_reminder["remind_time"]) - Date.now());
	return;
}

// saves the obj peepoBot_storage to file
function save_peepoBot_storage() {
	if (fs.writeFileSync('./peepoBot_storage.json', JSON.stringify(peepoBot_storage), 'utf-8')) {
		return true
	} else {
		return false
	}
}

function getTrueRandomColorHex() {
	const colorLetters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += colorLetters[Math.floor(Math.random() * 16)];
	}
	return color;
}

// returns a dhms time from a given ms
function proper_date(time_in_ms) {
	var seconds = "";
	var mins = "";
	var hours = "";
	var days = "";
	const time_in_s = Math.floor(time_in_ms / 1000);

	seconds = time_in_s % 60;

	if (time_in_s > 59) {
		var mins_ = Math.floor(time_in_s / 60);
		mins = `${mins_ % 60}m and `;
	}

	if (mins_ > 59) {
		var hours_ = Math.floor(time_in_s / 3600);
		hours = `${hours_ % 24}h, `;
	}

	if (hours_ > 23) {
		var days_ = Math.floor(time_in_s / 86400);
		days = `${days_}d, `;
	}

	return `${days}${hours}${mins}${seconds}seconds`;
}

// returns ms from multiple number types. eg. 15secs => 15000
function get_ms_from_time(time_unspecified) {
	var time_num = time_unspecified.split(/([^0-9]+|[^a-zA-Z]+)/)[1].trim();
	var time_type = time_unspecified.split(/([^0-9]+|[^a-zA-Z]+)/)[3].trim();

	if ((/^(s|secs?)/).test(time_type)) {
		return time_num * 1000;
	} else if ((/^(m|mins?)/).test(time_type)) {
		return time_num * 60000;
	} else if ((/^(h|hours?)/).test(time_type)) {
		return time_num * 3600000;
	} else if ((/^(d|days?)/).test(time_type)) {
		return time_num * 86400000;
	} else if ((/^(w|weeks?)/).test(time_type)) {
		return time_num * 604800000;
	}
}

// adds a unicode char to the end of every second message, to get past twitch spam protection
function clientsay(channel_to_send_to, message) {
	channel_to_send_to = channel_to_send_to;
	message = message.toString();
	//find the channel in the array of channels
	let channel_last_message_object = peepoBot_channels_last_message.find(o => o.channel === channel_to_send_to);
	// if no channel found, create new one
	if (channel_last_message_object === undefined) {
		peepoBot_channels_last_message.push({
			channel: channel_to_send_to,
			unicode_last_message: false
		});
	} else {
		// if channel was found and last message had no unicode
		if (channel_last_message_object.unicode_last_message === false) {
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
// initialise the account 'BOT'
const client = new tmi.Client({
	options: { debug: true },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: process.env.TWITCH_USERNAME_BOT,
		password: process.env.TWITCH_OAUTH_TOKEN_BOT,
	},
	channels: []
});

// initialise the 'OWNER' account 
const OPclient = new tmi.Client({
	options: { debug: true },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: process.env.TWITCH_USERNAME_OWNER,
		password: process.env.TWITCH_OAUTH_TOKEN_OWNER,
	},
	channels: [process.env.TWITCH_USERNAME_OWNER]
});

client.connect().catch(console.error);
OPclient.connect().catch(console.error);

// informs chat and starts reminder loop on bot start
client.on("connected", (OPclient, port) => {
	//client.say(process.env.TWITCH_USERNAME_OWNER, `[INFO] process.env.BOT_NAME is back online HandsUp`);

	peepoBot_storage["channels"].forEach(channel_ => {
		client.join(channel_);
	});

	updatereminders();
});


// All channels peepoBot is in
client.on('message', (channel, tags, message, self) => {
	if (self) return;

	// checks for messages from 'OWNER' when colourchanger is on 
	if (tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER && colorchanger && !(/ (colourchanger|colorchanger|cc) /).test(message.toLowerCase())
	) {
		lastcolor = newcolor;
		newcolor = getTrueRandomColorHex();
		OPclient.say(process.env.TWITCH_USERNAME_OWNER, `/color ${newcolor}`);
		return;
	}

	// if jade is a donker and types hbb instead of hhb 
	if (tags.username.toLowerCase() === "jadescatalog" && (/(\!?hbb)/).test(message.toLowerCase())) {
		clientsay(channel, "Jadeyy use !hhb u absolute donker");
	}

	// checks if the command is for peepoBot
	if (!( new RegExp('^' + process.env.BOT_LISTENER_REGEX ).test(message.toLowerCase()))) return;
	if (tags.username.toLowerCase() === process.env.TWITCH_USERNAME_BOT) return;

	// removes chatterino voodoo char and combines multiple spaces into one
	message = message.replace(/\u{E0000}/gu, '').replace(/\s\s+/g, ' ').trim();

	// creates array of args from the given command eg. !peepobot list -> ['!peepobot', 'list']
	const command_args = message.toLowerCase().split(" ");

	// checks if the command doesnt continue past !peepoBot (eg. !peepoBotOtherCommand would be blocked)
	if (!( new RegExp('^' + process.env.BOT_LISTENER_REGEX + '$').test(command_args[0]))) return;

	peepoBot_storage["last_command"]["user"] = tags.username;
	peepoBot_storage["last_command"]["command"] = message;
	save_peepoBot_storage();

	// commands available when peepoBot is disabled
	// peepoBot info
	if ((/^(i|info|uptime|version|status)$/).test(command_args[1])) {
		var is_enabled = "disabled";
		if (bot_enabled === true) is_enabled = "enabled";
		clientsay(channel, `[INFO] ${process.env.BOT_NAME} v1.0.5. - I was born ${proper_date(Date.now() - bot_creation)} ago. - Currently ${is_enabled} - Uptime: ${proper_date(Date.now() - last_restart)} FeelsStrongMan `);
		return;
	}

	// Enable peepoBot 
	if (tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER && (/^(enable|on)$/).test(command_args[1]) && !bot_enabled) {
		clientsay(channel, `[INFO] ${process.env.BOT_NAME} is back online HandsUp`);
		bot_enabled = true;
		return;
	}

	// Disable peepoBot 
	if (tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER && (/^(disable|off)$/).test(command_args[1]) && bot_enabled) {
		clientsay(channel, `[INFO] ${process.env.BOT_NAME} disabled FeelsBadMan `);
		bot_enabled = false;
		return;
	}

	// Check if peepoBot is active, if yes continue
	if (!bot_enabled) {
		clientsay(channel, `[INFO] ${process.env.BOT_NAME} is disabled, please ask ${process.env.TWITCH_USERNAME_OWNER} to enable it. FeelsBadMan `);
		return;
	}

	// peepoBot 
	if (command_args.length < 2) {
		clientsay(channel, `[INFO] Hi! I'm ${process.env.BOT_NAME}, use "${process.env.BOT_MAIN_LISTENER} help" for a list of commands. peepoHappy `);
		return;
	}

	// whats my colour
	if ((/^mycolou?r$/).test(command_args[1])) {
		clientsay(channel, `[INFO] Your colour is: ${tags.color} `);

		return;
	}

	// Lists commands / usage
	if (/^(commands|help|list|\?)$/.test(command_args[1])) {
		if (tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER) {
			clientsay(channel, `[INFO] Usage: ${process.env.BOT_MAIN_LISTENER} (channels | colorchanger | commands | copy | disable | enable | info | led | messageuuid | status)`);
			return;
		} else {
			clientsay(channel, `[INFO] Usage: ${process.env.BOT_MAIN_LISTENER} (channels | commands | info | status)`);
			return;
		}
	}

	// Messageuuid test
	if ((/^messageuuid$/).test(command_args[1])) {
		clientsay(channel, `${tags.id}`);
		return;
	}

	// channels commands
	if ((/^channels?/).test(command_args[1])) {

		if (command_args.length < 3) {
			//client.say(process.env.TWITCH_USERNAME_OWNER, `[CHN] I have whispered you the channels I am in, @${tags.username} peepoHappy `);
			clientsay(channel, `[CHN] I'm currently in ${String(client.getChannels()).split(",").length} channels. Join another with ${command_args[0]} channels join {channel} peepoGlad  `)
			return;
		} else {
			if (command_args[2] === "join") {
				if (command_args.length < 4) {
					clientsay(channel, `[CHN] Please supply a channel name!`);
					return;
				} else {
					clientsay(channel, `[CHN] I'm trying to join ${command_args[3]}'s channel`);
					client.join(command_args[3].trim());
					peepoBot_storage.channels.push(command_args[3].trim());
					save_peepoBot_storage();
					return;
				}
			}
		}
	}

	// test command
	if ((/^test$/).test(command_args[1])) {
		clientsay(channel, `[TEST] "${peepoBot_storage["vars"]["test_reply"]}"`);
		return;
	}

	// fav song command 
	if ((/^(song|fav|favou?rite)$/).test(command_args[1])) {
		clientsay(channel, `[INFO] ${process.env.TWITCH_USERNAME_OWNER}'s current favourite song: ${peepoBot_storage["vars"]["fav_song"]} catJAM`);
		return;
	}


	// Colorchanger
	if (tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER &&  !RegExp("^" + process.env.BOT_LISTENER_REGEX + "(colourchanger|colorchanger|cc)").test(message.toLowerCase())) {
		if (command_args.length < 3) {
			if (colorchanger === true) {
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
						if (command_args.length < 4) { return; }
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
	if ((/^remind$/).test(command_args[1])) {
		if (command_args.length < 6) { // !hhb remind 
			clientsay(channel, "[REM] Usage: ${process.env.BOT_MAIN_LISTENER} remind [me|{user}] in ##[sec|min|hour|day] {message} ");
			return;
		}

		var reminder_split_message = message.split(" ");

		//remind yourself
		if ((/^me$/).test(command_args[2]) && (/^i?n?$/).test(command_args[3])) { // !hhb remind me in

			if ((/^[0-9]+(s|secs?|m|mins?|h|hours?|d|days?)$/).test(command_args[4])) { // !hhb remind me in 123days
				addreminder(channel, reminder_split_message[4], tags.username, tags.username, channel, get_ms_from_time(reminder_split_message[4]) + Date.now(), reminder_split_message.slice(5).join(" "));
				return;
			}
			if ((/^[0-9]+$/).test(command_args[4]) && (/^(s|secs?|m|mins?|h|hours?|d|days?)$/).test(command_args[5])) { // !hhb remind me in 123 days
				if (command_args.length < 7) {
					clientsay(channel, "[REM] Usage: ${process.env.BOT_MAIN_LISTENER} remind [me|{user}] in ##[sec|min|hour|day] {message} ");
					return;
				} else {
					addreminder(channel, reminder_split_message.slice(4, 6).join(""), tags.username, tags.username, channel, get_ms_from_time(reminder_split_message.slice(4, 6).join("")) + Date.now(), reminder_split_message.slice(6).join(" "));
					return;
				}
			} else {
				clientsay(channel, "[REM] Usage: ${process.env.BOT_MAIN_LISTENER} remind [me|{user}] in ##[sec|min|hour|day] {message} ");
				return;
			}
			// remind another person
		} else {

			if ((/^[0-9]+(s|secs?|m|mins?|h|hours?|d|days?)$/).test(command_args[4])) { // !hhb remind {person} in 123days
				addreminder(channel, reminder_split_message[4], tags.username, command_args[2], channel, get_ms_from_time(reminder_split_message[4]) + Date.now(), reminder_split_message.slice(5).join(" "));
				return;
			}
			if ((/^[0-9]+$/).test(command_args[4]) && (/^(s|secs?|m|mins?|h|hours?|d|days?)$/).test(command_args[5])) { // !hhb remind {person} in 123 days
				if (command_args.length < 7) {
					clientsay(channel, "[REM] Usage: ${process.env.BOT_MAIN_LISTENER} remind [me|{user}] in ##[sec|min|hour|day] {message} ");
					return;
				} else {
					addreminder(channel, reminder_split_message.slice(4, 6).join(""), tags.username, command_args[2], channel, get_ms_from_time(reminder_split_message.slice(4, 6).join("")) + Date.now(), reminder_split_message.slice(6).join(" "));
					return;
				}
			} else {
				clientsay(channel, "[REM] Usage: ${process.env.BOT_MAIN_LISTENER} remind [me|{user}] in ##[sec|min|hour|day] {message} ");
				return;
			}

		}
	}

	//  command to list all your reminders
	if ((/^reminders$/).test(command_args[1])) {
		if ((/^(list|mine)$/).test(command_args[2])) {

			return;
		}
		var your_reminders = [];
		peepoBot_storage.reminders.forEach(reminder => {
			if (reminder.remindee === tags.username.toLowerCase()) {
				your_reminders.push(reminder);
			}
		});
		if (your_reminders.length === 0) {
			clientsay(channel, `[REM] You have no reminders, @${tags.username} `);
			return;
		} else {
			clientsay(channel, `[REM] You have ${your_reminders.length} reminders due - first one in ${proper_date(your_reminders[0].remind_time - Date.now())}, @${tags.username} `);
			return;
		}
	}

	// if command was not found and channel is not 'OWNER's
	if (!(channel.toLowerCase() === process.env.TWITCH_USERNAME_OWNER)) {
		if (tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER) {
			clientsay(channel, `[INFO] Command "${message}" was not found Sadge `);
			return;
		} else {
			clientsay(channel, `[INFO] That command was not found Sadge If you believe this is an error, inform ${process.env.TWITCH_USERNAME_OWNER}.`);
			return;
		}
	}

	/// Commands only in 'OWNER's channel

	// enable / disable WOS commands
	if (tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER && (/^wos$/).test(command_args[1])) {
		if ((/^(disable|off)$/).test(command_args[2])) {
			WOS_enabled = false;
			client.say(process.env.TWITCH_USERNAME_OWNER, `[WOS] Command has been disabled.`);
			return;
		} else if ((/^(enable|on)$/).test(command_args[2])) {
			WOS_enabled = true;
			client.say(process.env.TWITCH_USERNAME_OWNER, `[WOS] Command is enabled. Usage: !continue and !restart`);
			return;
		}
	}

	// modme command
	if ((/^modme$/).test(command_args[1])) {
		if (peepoBot_storage["homies"].includes(tags.username.toLowerCase())) {
			OPclient.mod(channel, tags.username);
			client.say(process.env.TWITCH_USERNAME_OWNER, `[MOD] You have been modded, @${tags.username}!`);
		} else {
			client.say(process.env.TWITCH_USERNAME_OWNER, `[MOD] Sorry, you dont have permission to do that @${tags.username}!`);
		}
	}

	// vipme command
	if ((/^vipme$/).test(command_args[1])) {
		if (peepoBot_storage["homies"].includes(tags.username.toLowerCase())) {
			OPclient.vip(channel, tags.username);
			client.say(process.env.TWITCH_USERNAME_OWNER, `[VIP] You have been VIP'd, @${tags.username}!`);
		} else {
			client.say(process.env.TWITCH_USERNAME_OWNER, `[VIP] Sorry, you dont have permission to do that @${tags.username}!`);
		}
	}

	// vip command 
	if ((/^vip$/).test(command_args[1])) {
		if (command_args.length < 3) {
			client.say(process.env.TWITCH_USERNAME_OWNER, "[VIP] Usage: ${process.env.BOT_MAIN_LISTENER} vip {username} ");
			return;
		}
		if (tags.mod === true || tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER.toLowerCase()) {
			OPclient.vip(channel, command_args[2]);
			client.say(process.env.TWITCH_USERNAME_OWNER, `[VIP] You have successfully given @${command_args[2]} VIP!`);
		} else {
			client.say(process.env.TWITCH_USERNAME_OWNER, `[VIP] Sorry, you dont have permission to do that @${tags.username}!`);
		}
	}

	// vip command 2
	if ((/^!vip$/).test(command_args[0])) {
		if (command_args.length < 2) {
			client.say(process.env.TWITCH_USERNAME_OWNER, "[VIP] Usage: !vip {username} ");
			return;
		}
		if (tags.mod === true) {
			OPclient.vip(channel, command_args[1]);
			client.say(process.env.TWITCH_USERNAME_OWNER, `[VIP] You have successfully given @${command_args[1]} VIP!`);
		} else {
			client.say(process.env.TWITCH_USERNAME_OWNER, `[VIP] Sorry, you dont have permission to do that @${tags.username}!`);
		}
	}

	// // LED commands

	// Enable/disable
	if ((/^(led|lights?)$/).test(command_args[1])) {
		if (command_args.length < 3) {
			if (peepoBot_storage["vars"]["enable_leds"]) {
				client.say(process.env.TWITCH_USERNAME_OWNER, `[LED] Command is enabled. Usage: !led {colour}`);
			} else {
				client.say(process.env.TWITCH_USERNAME_OWNER, `[LED] Command currently disabled.`);
			}
		} else {
			if (tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER) {
				if (/(enable|on)/.test(command_args[2].toLowerCase())) {
					peepoBot_storage["vars"]["enable_leds"] = true;
					client.say(process.env.TWITCH_USERNAME_OWNER, `[LED] Command has been enabled. Usage: !led {colour}`);
				} else if (/(disable|off)/.test(command_args[2].toLowerCase())) {
					peepoBot_storage["vars"]["enable_leds"] = false;
					client.say(process.env.TWITCH_USERNAME_OWNER, `[LED] Command has been disabled.`);
				}
			}
		}
	}
});


// special commands in 'OWNER's chat
OPclient.on('message', (channel, tags, message, self) => {
	if (!channel === process.env.TWITCH_USERNAME_OWNER) return;
	if (tags.username.toLowerCase() === process.env.TWITCH_USERNAME_BOT) return;

	// creates array of args from the given command eg. !hhb list -> ['!hhb', 'list']
	const command_args = message.toLowerCase().split(" ");

	// Words on Stream
	if (!tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER && message.toLowerCase().includes('!continue') && WOS_enabled) {
		OPclient.say(process.env.TWITCH_USERNAME_OWNER, "!continue");
		return;
	}

	if (!tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER && message.toLowerCase().includes('!restart') && WOS_enabled) {
		OPclient.say(process.env.TWITCH_USERNAME_OWNER, "!restart");
		return;
	}

	// LED commmands 
	if ((peepoBot_storage["vars"]["enable_leds"] || tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER) && /^\!led yourm(u|o)m/.test(message.toLowerCase())) {
		if (tags.username.toLowerCase() === 'beekay5') {
			client.say(process.env.TWITCH_USERNAME_OWNER, `[LED] Paul's LED's set to: yourmom`);
			leds_color = "yourmom";

			const Http = new XMLHttpRequest();
			Http.open("GET", `http://192.168.100.24/win&R=255&G=90&B=90&W=1`);
			Http.send();
			return;
		} else {
			client.say(process.env.TWITCH_USERNAME_OWNER, `[LED] Only katy has permission to set yourmom peepoHappy 

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


	if (/^\!led$/.test(command_args[0])) {
		if (!(tags.username.toLowerCase() === process.env.TWITCH_USERNAME_OWNER || peepoBot_storage["vars"]["enable_leds"])) {
			client.say(process.env.TWITCH_USERNAME_OWNER, `[LED] Command currently disabled.`);
			return;
		}
		const ledSite = "http://192.168.100.24/win"
		var custom_colors = {
			cum: [69, 69, 69],
			bauke: [105, 19, 55], // #691337
			hooyah: [42, 04, 20]
		};
		if (command_args.length < 2) {
			client.say(process.env.TWITCH_USERNAME_OWNER, `[LED] Current colour: ${leds_color} Usage: !led {colour}`);
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
			client.say(process.env.TWITCH_USERNAME_OWNER, `[LED] Color ${command_args[1].replace("!", "")} does not exist.`);
		} else {
			client.say(process.env.TWITCH_USERNAME_OWNER, `[LED] Paul's LED's set to: ${colour_}`);
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