const Discord = require('discord.js');
const client = new Discord.Client();

const red = 0xaa0000;
const green = 0x00aa00;
const blue = 0x0000aa;
const yellow = 0xeeee11;
const turquoise = 0x0099aa;
const purple = 0x6b1e91;
const white = 0xffffff;
const black = 0x000000;
const brown = 0x7a3b00;
const pink = 0xf3a5c4;
const orange = 0xffa200;
const grey = 0xaaaaaa;

function twoZeros(n){
	if(n<10)
		return "00"+n;
	if(n<100)
		return "0"+n;
	return n;
}

function capitalize(str){
	return str.charAt(0).toUpperCase() + str.substr(1);
}

function getUTCFullDate(){
	var d = new Date();
	return d.getUTCDate() + "/" + d.getUTCMonth() + "/" + d.getYear();
}

function Type(name, color){
	this.name = name;
	this.color = color;
}

function Idol(id, fullname, nickname, type){
	this.id = id;
	this.fullname = fullname;
	this.nickname = nickname;
	this.idolPower = 0;
	this.rank = 1;
	this.fanNumber = 0;
	this.type = type;
	this.receivedFlowers = 0;
	this.receivedLetters = 0;
	this.getProfile = function(){
		var r_embed = {
			"title": "Stats de " + this.fullname,
			"color": this.type.color,
			"thumbnail" : {
				"url": "https://i.imgur.com/0OyUF4J.png"
			},
			"fields": [
				{
					"name": "ID" + twoZeros(this.id) + "["+ this.type.name +"]",
					"value": "\nClassement #" + this.rank + " ("+this.idolPower+" points Aikatsu!)\n" + (10000*this.fanNumber+Math.floor(Math.random()*100)) + " fans\n" + this.receivedFlowers + " bouquets de fleurs reçus\n" + this.receivedLetters + " lettres de fans reçus"
				}
			]
		};
		return r_embed;
	}
}

function Player(id){
	this.id = id;
	this.profileColor = white;
	this.lastSupportDate = undefined;
	this.favType = "";
	// supported idols / up to 3
	this.idols = [];
	this.givenFlowers = [0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // but show only current supported idols
	this.givenLetters = [0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // but show only current supported idols
	this.mention = function(str){
		return "<@"+this.id+"> " + str;
	}
	this.idolsToString = function(){
		var s = "";
		if(this.idols.length == 0)
			return "Aucune";
		for(var i=0;i<this.idols.length-1;i++){
			s += this.idols[i].fullname + ", ";
		}
		s += this.idols[this.idols.length-1].fullname;
		return s;
	}
	this.cash = 10;
	this.canSupport = function(){
		return this.lastSupportDate != getUTCFullDate();
	}
	this.hasIdol = function(idolID){
		for(var k=0;k<this.idols.length;k++){
			if(this.idols[k].id == idolID)
				return true;
		}
		return false;
	}
	this.addIdol = function(idol){
		if( this.idols.length == 3 )
			return this.mention("Maximum atteint! Tu ne peux pas supporter plus de 3 idoles en même temps!");
		if(this.hasIdol(idol.id))
			return this.mention("Tu supportes déjà " + idol.fullname + "!");
		this.idols.push(idol);
		idol.fanNumber += 1;
		return this.mention(idol.fullname + " ajoutée à ta liste.");
	}
	this.removeIdol = function(idol){
		if(this.hasIdol(idol.id)){
			var i = this.idols.indexOf(idol);
			this.idols.splice(i,1);
			idol.fanNumber -= 1;
			return this.mention(idol.fullname + " a été supprimée de ta liste.");
		}
		return this.mention(idol.fullname + " n'est pas dans ta liste");
	}
	this.buyNewProfileColor = function(n){
		var availableColors = [red,green,blue,yellow,turquoise,purple,white,black,brown,pink,orange,grey];
		var cost = 1;
		if(this.cash < cost){
			return this.mention("Pas assez d'argent!");
		} else {
			this.cash -= cost;
			this.profileColor = availableColors[n];
			return this.mention("Merci de ton achat!");
		}
	}
	this.buyGift = function(gift, idol, numberOfGifts){
		var totalPrice = gift.price * numberOfGifts;
		if( this.cash >= totalPrice){
			if( gift.name == "fleurs" ){
				this.cash -= totalPrice;
				this.givenFlowers[idol.id] += numberOfGifts
				idol.receivedFlowers += numberOfGifts;
				idol.idolPower += gift.power * numberOfGifts;
				return this.mention("Fleurs données "+(numberOfGifts > 1 ? "("+numberOfGifts+") " : "")+"à " + capitalize(idol.nickname) + " <:hearts:465129487550513155>");
			} else if( gift.name == "lettre" ) {
				this.cash -= totalPrice;
				this.givenLetters[idol.id] += numberOfGifts; 
				idol.receivedLetters += gift.power * numberOfGifts;
				return this.mention("Lettre donnée "+(numberOfGifts > 1 ? "("+numberOfGifts+") " : "")+"à " + capitalize(idol.nickname) + " <:hearts:465129487550513155>");
			}
			return "Erreur sur " + gift.name;
		} else {
			return this.mention("Pas assez d'argent!");
		}
	}
	this.getProfile = function(discordUser){
		var gift_string = "";
		for(var i=0;i<this.idols.length;i++){
			var idol = this.idols[i];
			var index = idol.id;
			gift_string += "\n" + this.givenFlowers[index] + " fleurs et " + this.givenLetters[index] + " lettres données à " + capitalize(idol.nickname)
		}
		return {
			"title": "Stats de " + discordUser.username,
			"color": this.profileColor,
			"thumbnail" : {
				"url": discordUser.avatarURL
			},
			"fields": [
				{
					"name": "ID " + this.id,
					"value": "Idoles favorites: " + this.idolsToString() + "\nPièces Aikatsu!: " + this.cash + gift_string
				}
			]
		};
	}
}

var cute = new Type("cute", pink);
var cool = new Type("cool", blue);
var sexy = new Type("sexy", purple);
var pop = new Type("pop", yellow);

var ichigo = new Idol(0, "Ichigo Hoshimiya", "ichigo", cute);
var aoi = new Idol(1, "Aoi Kiriya", "aoi", cool);
var ran = new Idol(2, "Ran Shibuki", "ran", sexy);
var akari = new Idol(3, "Akari Ōzora", "akari", cute);
var sumire = new Idol(4, "Sumire Hikami", "sumire", cool);
var himaki = new Idol(5,"Hinaki Shinjō", "hinaki", pop);
var yume = new Idol(6,"Yume Nijino", "yume", cute);
var rola = new Idol(7,"Laura Sakuraba", "laura", cool);
var mahiru = new Idol(8,"Mahiru Kasumi", "mahiru", sexy);
var ako = new Idol(9,"Ako Saotome", "ako", pop);
var aine = new Idol(10,"Aine Yūki", "aine", cute);
var mio = new Idol(11,"Mio Minato", "mio", cool);
var maika = new Idol(12,"Maika Chōno", "maika", sexy);
var ema = new Idol(13,"Ema Hinata", "ema", pop);

var idols = [
ichigo,
aoi,
ran,
akari,
sumire,
himaki,
yume,
rola,
mahiru,
ako,
aine,
mio,
maika,
ema
];

function getIdol(mark){
	var isId = !isNaN(parseInt(mark));
	if(isId){
		for(var i=0;i<idols.length;i++){
			if(idols[i].id==mark){
				return idols[i];
			}
		}
	} else {
		for(var i=0;i<idols.length;i++){
			if(idols[i].nickname==mark.toLowerCase()){
				return idols[i];
			}
		}
	}
	return null;
}

var players = [];

function fetchPlayer(id){
	for(var i=0;i<players.length;i++){
		if(players[i].id == id){
			return players[i];
		}
	}
	var p = new Player(id);
	players.push(p);
	return p;
}

/* Idol Management */

function addFavIdol(playerID, idolID, signe){
	var idol = getIdol(idolID);
	if(idol == null)
		return "L'idole " + idolID + " n'a pas été trouvée";
	var player = fetchPlayer(playerID);
	if( signe == "+" )
		return player.addIdol(idol);
	else if(signe == "-")
		return player.removeIdol(idol);
}

function supportIdol(playerID, idolMark){
	var idol = getIdol(idolMark);
	if(idol == null)
		return "L'idole " + idolMark + " n'a pas été trouvée";
	var player = fetchPlayer(playerID);
	if(!player.canSupport()){
		return "Tu as déjà supporté une idole aujourd'hui.";
	}
	if(!player.hasIdol(idol.id)){
		return "Il faut d'abord ajouter " + idol.fullname + " à ta liste.";
	}
	player.lastSupportDate = getUTCFullDate();
	player.cash += 100;
	idol.idolPower += 20;
	updateClassement();
	return idol.fullname + " reçoit ton soutien avec joie! Tu reçois 100 aicoins pour ta participation!";
}

/* Idol Rank */

var classement = idols.slice(0);

function updateClassement(){
	classement.sort(function(x,y){return y.idolPower - x.idolPower});
	var rang = 1;
	classement[0].rank = rang;
	for(var i=1;i<classement.length;i++){
		if( classement[i].idolPower != classement[i-1].idolPower )
			rang += 1;
		classement[i].rank = rang;
	}
}

function getClassement(){
	updateClassement();
	var s = "";
	for(var k=0;k<classement.length;k++){
		s += "**" + classement[k].rank + "** - " + classement[k].fullname + "\n";
	}
	return s;
}

/* Profile */

function changeColor(playerID, args){
	if(!args || isNaN(args) || args < 0 || args > 11){
		return "La table des couleurs https://i.imgur.com/dYV1Z8a.png";
	} else {
		var p = fetchPlayer(playerID);
		return p.buyNewProfileColor(args);
	}
}

/* GIFTING */

function Gift(name, price, power){
	this.name = name;
	this.price = price;
	this.power = power;
}

var flowers = new Gift("fleurs", 5, 5);
var fanLetter = new Gift("lettre", 10, 10);

function giftIdol(playerID, idolMark, giftName, numberOfGifts){
	var idol = getIdol(idolMark);
	if(idol == null)
		return "L'idole " + idolMark + " n'a pas été trouvée";
	var player = fetchPlayer(playerID);
	if(!player.hasIdol(idol.id)){
		return "Il faut d'abord ajouter " + idol.fullname + " à ta liste.";
	}
	if( giftName == "f" || giftName == "fleurs" ){
		var gift = flowers;
	} else if( giftName == "l" || giftName == "lettre" ){
		var gift = fanLetter;
	} else {
		return giftName + " n'est pas un cadeau reconnu";
	}
	return player.buyGift(gift, idol, numberOfGifts);
}

function commandes( message, cmd, args ){
	switch(cmd.toLowerCase()){
		case "g":
			var a = args.split(" ");
			if( a.length == 2 && (a[1] == "+" || a[1] == "-")){
				message.channel.send(addFavIdol(message.author.id, a[0], a[1])).catch(console.error);
			}
		break;
		case "s":
			var a = args.split(" ");
			var str;
			switch(a.length){
				case 1:
					str = supportIdol(message.author.id, args);
				break;
				case 2:
					str = giftIdol(message.author.id, a[0], a[1], 1);
				break;
				case 3:
					var n = a[2];
					if(!isNaN(n) && n > 0){
						n = parseInt(n);
					} else {
						n = 1;
					}
					str = giftIdol(message.author.id, a[0], a[1], n);
				break;
			}
			message.channel.send(str).catch(console.error);
		break;
		case "p":
		if(!args){
			var user = message.author;
			var r_embed = fetchPlayer(user.id).getProfile(user);
			message.channel.send({embed:r_embed}).catch(console.error);
		}
		else if( message.mentions ){
			var user = message.mentions.users.first();
			//if(!user.bot){
				var r_embed = fetchPlayer(user.id).getProfile(user);
				message.channel.send({embed:r_embed}).catch(console.error);
			//}
		}
		else {
			var idol = getIdol(args);
			if(idol){
				var r_embed = idol.getProfile();
				message.channel.send({embed:r_embed}).catch(console.error);
			}
		}
		break;
		case "c":
			message.channel.send(getClassement()).catch(console.error);
		break;
		case "clr":
			message.channel.send(changeColor(message.author.id, args)).catch(console.error);
	}
}

client.on('message', message => {
	// Message humain
	if( message.author.bot )
		return;
	var input = message.content;
	// Message adressé au bot
	var sign = input.charAt(0);
	if ( sign != '!' )
		return;
	// Décompose la commande
	input = input.substring(1);
	var i = input.indexOf(' ');
	if( i == -1 ){
		var cmd = input;
		var args = "";
	} else {
		var cmd = input.substr(0,i);
		var args = input.substr(i+1);
	}
	// Lance le menu des commandes
	commandes( message, cmd, args );
});

client.on('ready', () => {
  console.log( client.user.username + ' [' + client.user.id + '] est en ligne!');
});

client.on('error', error => {
	console.log( error.message ); 
});

client.login(process.env.BOT_TOKEN).catch(console.error);
