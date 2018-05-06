const Discord = require('discord.js');
const client = new Discord.Client();
const https = require('https');

/*** Generic variables ***/

var red = 0x880000;
var green = 0x008800;
var blue = 0x000088;
var yellow = 0x888800;
var turquoise = 0x0055aa;
var purple = 0x6b1e91;
var white = 0xffffff;
var black = 0x000000;
var brown = 0x7a3b00;
	
/*** Generic functions ***/

function randomNumber(n){
	return Math.floor(Math.random()*n) + 1;
}

function randomIn(t){
	return t[Math.floor(Math.random()*t.length)];
}

// Supprime les doublons du tableau t
function reduceToSet(t){
	var seen = {};
	for(var i=t.length-1;i>=0;i--){
		var el = t[i];
		if( seen[el] ){
			t.splice(i,1);
		} else {
			seen[el] = true;
		}
	}
	return t;
}

// Renvoit une permutation des indices de 0 à n-1
function permute(n){
	var integers = [];
	var s_n = [];
	for(var i=0;i<n;i++){
		integers[i] = i;
	}
	while( n > 0 ){
		s_n.push((integers.splice(Math.floor(Math.random()*integers.length),1))[0]);
		n--;
	}
	return s_n;
}

// Renvoit n éléments choisis aléatoirement du tableau t
function multiRandomIn( t, n ){
	if( n < 1 )
		return [];
	if( n > t.length )
		n = t.length;
	var arr = [];
	var indexes = permute(t.length);
	for( var k=0; k < n; k++ ){
		arr.push(t[indexes[k]]);
	}
	return arr;
}

// Renvoit des pourcentages sur n choix dans un tableau où la somme des % fait 100%
function randomVotes(n){
	var l = [];
	for(var i=0;i<n;i++){
		l[i] = 0;
	}
	for(var quota=100;quota>0;quota--){
		l[Math.floor(Math.random()*n)] += 1;
	}
	return l;
}

// Renvoit une chaîne "jj/mm/aaaa"
function dateDuJour(){
	var arr = new Date().toISOString().replace(/T/, '-').split('-');
	return arr[2] + "/" + arr[1] + "/" + arr[0];
}

// Booléen vrai si une chaîne peut être lue comme un nombre décimal
function isStringInteger(args){
	if(!args)
		return false;
	if(args !== '0' && args.charAt(0) === '0')
		return false;
	for(var j=0;j<args.length;j++){
		var c = args.charAt(j);
		if( c !== '0' && c !== '1' && c !== '2' && c !== '3' && c !== '4' && c !== '5' && c !== '6' && c !== '7' && c !== '8' && c !== '9' )
			return false;
	}
	return true;
}

// Renvoit [l'élément le plus fréquent, son nombre d'occurences], le premier si plusieurs avec même nombre d'occurences
function maxOccurence( arr ){
	var n = arr.length;
    if( n == 0 )
        return null;
    var map = {};
    var elementMax = arr[0];
	var	occMax = 1;
    for(var i=0; i<n; i++){
        var e = arr[i];
        if( !map[e] )
            map[e] = 1;
        else
            map[e] += 1; 
        if( map[e] > occMax ) {
            elementMax = e;
            occMax = map[e];
        }
    }
    return [elementMax, occMax];
}

/*** Aikatsu - tarot ***/

function Carte(nom, message, url){
	this.nom = nom;
	this.message = message;
	this.url = url;
	this.toString = function(){
		return "**" + this.nom + "** " + this.url + "\n" + this.message;
	}
}

var aikatsu = [
	new Carte("Ichigo","Ichigo représente un être encore absorbé par les apparences et les illusions. Ichigo est la jeunesse créative, l'innocence infantile, la spontanéité, la verdeur, mais aussi le manque de profondeur et d'expérience.","http://static.zerochan.net/Hoshimiya.Ichigo.full.1990915.jpg"),
	new Carte("Aoi","Aoi représente tout ce qui est en rapport avec les études, la formation, l'apprentissage. Elle est donc en relation avec la réflexion, le travail mental et l'analyse. Son regard est orienté vers la gauche, c'est-à-dire vers le passé. Sa question est \"que m'enseignent les écritures sur mes origines?\"","http://static.zerochan.net/Kiriya.Aoi.full.1990916.jpg"),
	new Carte("Ran","Ran est l'accès à la maîtrise de l'idée et du savoir, qui autorise l'engendrement avec certitude et sagesse. Elle récapitule à la fois Ichigo et Aoi. Ran reste ouverte au changement et peut encore se permettre d'agir contre ce qu'elle ne possède pas encore.","http://static.zerochan.net/Shibuki.Ran.full.2032988.jpg"),
	new Carte("Yurika","Yurika est le signe stable du pouvoir acquis et tenu, de la possession matérielle. Cette stabilité est tout à la fois un bien, puisqu'on peut lui faire confiance, mais un défaut car Yurika ne fait que suivant son habitude. Elle s'oppose naturellement à toute modification de ce qu'elle possède.","http://static.zerochan.net/Toudou.Yurika.full.1990919.jpg"),
	new Carte("Sakura","Sakura est le doute qui est mis en avant, l'incertitude quant au bon chemin à prendre. Elle doit être vue comme une épreuve subie, comme de se retrouver sur le gril de sa propre conscience. Là ou l'on se pensait être stable et sûr de soi, il existe toujours des situations où l'on a envie de rejeter ce qui est déjà acquis pour des plaisirs sans lendemain.","http://static.zerochan.net/Kitaouji.Sakura.full.1990911.jpg"),
	new Carte("Seira","Seira est le symbole des difficultés vaincues. Après avoir réalisé l'amour inconditionnel, s'être réalisé dans sa vie matérielle et spirituelle, l'homme a réussi son parcours, le voile est levé.","http://static.zerochan.net/Otoshiro.Seira.full.1990925.jpg"),
	new Carte("Risa","Risa dit toujours la vérité, tant en positif qu'en négatif. Il ne s'agit pas de la justice humaine, mais d'une justice parfaite, celle qui ne fait aucune erreur. La justice est comme le réel qui ni ne ment ni ne se trompe. Ce qui est faux sera toujours faux et ce qui est vrai le sera toujours.","http://static.zerochan.net/Shirakaba.Risa.full.1989041.jpg"),
	new Carte("Mizuki","Mizuki est celle qui amène la lumière dans les ténèbres, celle qui est capable de trier et de démêler sans effort l'inextricable, et l'inexprimable. Là où se trouve la nuit, la lune vient éclairer le requérant sur une facette du problème que celui-ci n'avait pas pris en compte. Elle doit éclairer le requérant, mais gare à sa lumière. Celle-ci par sa vérité brûlera sans doute autant les yeux de celui-ci.","http://static.zerochan.net/Kanzaki.Mizuki.full.1990927.jpg"),
	new Carte("Rin","Rin représente la fin d'un cycle et le retour au début d'un autre. Elle indique qu'une connaissance a été acquise et qu'il faut donc s'attendre à une évolution sûre de la vie. Elle peut aussi symboliser un état de changement passé, présent ou à venir. Rin est dans tous les cas très dynamique et indique qu'il faut se prémunir contre ses effets possiblement négatifs.","http://static.zerochan.net/Kurosawa.Rin.full.1990917.jpg"),
	new Carte("Nono","C'est dans la douceur, la passivité, la sérénité que Nono peut puiser une force infinie. Elle symbolise entre autres le courage, la force morale, la maîtrise de ses énergies et de ses pulsions animales.","http://static.zerochan.net/Daichi.Nono.full.1990920.jpg"),
	new Carte("Sora","Sora implique la tempérance. La personne qui se modère est celle qui s’oblige à résister à l’attraction excessive des passions et des plaisirs. Sora exprime la nécessité de dominer certains instincts, de façon à ce qu’au travers de cette vertu, ils s’équilibrent.","http://static.zerochan.net/Kazesawa.Sora.full.1990926.jpg"),
	new Carte("Kii","Kii annonce une période de chance et de rayonnement, tout va dans le bon sens. Elle représente l’esprit épanoui, capable d’harmoniser les forces contraires et opposées.","http://static.zerochan.net/Saegusa.Kii.full.1990923.jpg"),
	new Carte("Kokone","Kokone est symbole de transformation, de renaissance, de renouveau, pour celui qui sait écouter sa voix intérieure, son ange, son intuition.","http://static.zerochan.net/Kurisu.Kokone.full.2032987.jpg"),
	new Carte("Akari","Akari signifie voir plus grand et s'ouvrir. L'avenir exigera de s'éveiller à sa réalité extérieure, de penser au monde extérieur et à la grandeur des choses. L'individu a la qualité de s'ouvrir à sa réalité extérieure et que cette qualité trouve son utilité maintenant.","http://static.zerochan.net/Oozora.Akari.full.1990913.jpg"),
	new Carte("Kaede","Kaede est libre, elle va et vient au gré de ses envies et des possibilités de la vie. Elle chemine avec juste le bagage qui lui est nécessaire, son âme et saura se débrouiller dans toutes les situations. C’est une personne originale qui bien sûr a des comportements inattendus, parfois surprenants ou même choquants. C’est en elle que l’on peut trouver la plus grande liberté, la plus grande évolution mais aussi le chaos et la folie.","http://static.zerochan.net/Ichinose.Kaede.full.1990924.jpg")
];

function randomAikatsuCard(){
	return randomIn(aikatsu);
}

/*** Choix ***/

function analyseChoix(args){
	var arr = reduceToSet(args.split(" ou "));
	if(arr.length >= 2){
		return "Je choisis **" + randomIn(arr) + "**";
	}
	return "Il n'y a pas assez de choix!";
}

/*** Classement ***/

function analyseClassement(args){
	var arr = reduceToSet(args.split(" et "));
	var l = arr.length;
	if( l >= 2 ){
		var str = "";
		var p = permute(l);
		for(var i=0;i<l;i++){
			str += "**" + (i+1) + "** " + arr[p[i]] + "\n";
		}
		return str;
	}
	return "Il n'y a pas assez à classer!";
}

/*** Simuler un vote ***/

function analyseVote(args){
	var arr = reduceToSet(args.split(","));
	if(arr.length >= 2){
		var votes = randomVotes(arr.length);
		var str = "";
		for(var i=0;i<votes.length;i++){
			str += (i+1) + "." + arr[i] + " (" + votes[i] + "%)\n"
		}
		return str;
	}
	return "Il n'y a pas assez à voter!";
}

/*** Compter en Jap ***/

var chiffresRomajis = [ "rei", "ichi", "ni", "san", "yon", "go", "roku", "nana", "hachi", "kyū" ];
var chiffresKanjis = [ "〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

// hyperdecomposition("123456789") = [ ['9', '8', '7', '6'], ['5', '4', '3', '2'], ['1'] ]
function hyperdecomposition(str){
	var arr = [[]], i = 0, j = 0, k = 0;
	var l = str.length - 1;
	while( k <= l ){
		if(j == 4){
			i += 1;
			arr.push([]);
			j = 0;
		}
		arr[i].push( str.charAt(l-k) );
		j++;
		k++;
	}
	return arr;
}

function blocEnJaponais(d){
	var l = d.length - 1, romaji = "", kanji = "", c;
	// MILLIERS
	if( l == 3 ){
		c = d[l];
		if( c != 0 ){
			if( c == 1 ){
				romaji += " sen";
			} else {
				if( c == 3 ){
					romaji += " san zen";
				} else {
					romaji += " " + chiffresRomajis[c] + " sen";
				}
				kanji += " " + chiffresKanjis[c];
			}
			kanji += " 千";
		}
		l--;
	}
	// CENTAINES
	if( l == 2 ){
		c = d[l];
		if( c != 0 ){
			if( c == 1 ){
				romaji += " hyaku";
			}
			else if( c == 3 ){
				romaji += " san byaku";
				kanji += " 三";
			} else if( c == 6 ){
				romaji += " rop pyaku";
				kanji += " 六";
			} else if( c == 8 ) {
				romaji += " hap pyaku";
				kanji += " 八";
			} else {
				romaji += " " + chiffresRomajis[c] + " hyaku";
			}
			kanji += " 百";
		}
		l--;
	}
	// DIZAINES
	if( l == 1 ){
		c = d[l];
		if( c != 0 ){
			if( c != 1 ){
				romaji += " " + chiffresRomajis[c];
				kanji += " " + chiffresKanjis[c];
			}
			romaji += " jū";
			kanji += " 十";
		}
		l--;
	}
	// UNITES
	c = d[l];
	if( c != 0 ){
		romaji += " " + chiffresRomajis[c];
		kanji += " " + chiffresKanjis[c];
	}
	return [romaji, kanji];
}

var categoriesRomajis = ["man", "oku", "chō", "kei", "gai", "jo", "jō", "kō", "kan", "sei", "sai", "goku", "gōgasha", "asōgi", "nayuta", "fukashigi", "muryōtaisū" ];
var categoriesKanjis =  ["万", "億", "兆", "京", "垓", "𥝱", "穣", "溝", "澗", "正", "載", "極", "恒河沙", "阿僧祇", "那由他", "不可思議", "無量大数" ];

function enJaponais(args){
	if( args == '0' )
		return ["rei", "〇"];
	var h = hyperdecomposition(args);
	var romaji = "", kanji = "", l = h.length - 1, arr;
	for(var i=l; i>0; i--){
		arr = blocEnJaponais(h[i]);
		romaji += arr[0] + " " + categoriesRomajis[i-1];
		kanji += arr[1] + " " + categoriesKanjis[i-1];
	}
	arr = blocEnJaponais(h[0]);
	romaji += arr[0];
	kanji += arr[1];
	return [romaji, kanji];
}

function convertNombreJaponais(args){
	// MAX_LENGTH = (categoriesRomajis.length=17+1=18) * 4
	if( args.length > 72 )
		return "Nombre trop grand!";
	// checks if args is a string containing only 0-9 digits
	if( !isStringInteger(args) )
		return false;
	var arr = enJaponais(args);
	return arr[0] + " " + arr[1];
}

function User(){
	this.dernierTirage = ""; //dernière date du tirage Tarot Aikatsu, e.g. '01/01/1976'
	this.tirage = null; // Carte de tarot du jour
	/*this.brillance = 0;
	this.cute = 0;
	this.cool = 0;
	this.sexy = 0;
	this.pop = 0;*/
}

var users = [];

/*** COMMANDES ***/

function commandes( message, cmd, args ){
	var id = message.author.id;
	function sendText(s){
		if(s)
			message.channel.send(s).catch(console.error);
	}
	function mention(s){
		if(s)
			message.channel.send("<@" + id + "> " + s).catch(console.error);
	}
	function sendEmbed(e){
		if(e)
			message.channel.send({embed:e}).catch(console.error);
	}
	switch( cmd.toLowerCase() ){
		case 'aide':
			message.author.send("Demande moi ce que tu veux!\naikatsu:Je peux te tirer une carte Aikatsu tous les jours\navatar @pseudo:Trouver l'avatar de quelqu'un\nchoix:Choisir entre plein d'options! (!choix 1 ou 2 ou 3 ou 4)\nclasse: Etablir un classement ou une liste de priorité entre plein de candidats!\nnj:Convertir un nombre en japonais (jusqu'à 72 chiffres, !nj 0)\nvote: Simuler un vote (!vote Ichigo,Aoi,Ran").catch(console.error);
		break;
		 case 'aikatsu':
			var auj = dateDuJour();
			if ( users[id].dernierTirage == auj ){
				mention( "Ton tirage du " + dateDuJour() + " est " + users[id].tirage.toString() );
			} else {
				var carte = randomAikatsuCard();
				users[id].tirage = carte;
				users[id].dernierTirage = auj;
				mention( "Ton tirage du " + dateDuJour() + " est " + carte.toString() );
			}
		 break;
		 case 'avatar':
			var user = message.mentions.users.first();
			user ? sendText(user.avatarURL) : sendText( message.author.avatarURL );
		break;
		case 'choix':
			if(args)
				sendText( analyseChoix(args) );
		break;
		case 'choix':
			if(args)
				sendText( analyseChoix(args) );
		break;
		case 'classe':
			if(args)
				sendText( analyseClassement(args) );
		break;
		case 'nj':
			sendText( convertNombreJaponais(args) );
		break;
		case 'vote':
			if(args)
				sendText( analyseVote(args) );
		break;
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
	// Vérifie si l'user est déjà enregistré
	var id = message.author.id;
	if(!users[id]){
		users[id] = new User();
		console.log("Added " + message.author.username + " [" + id + "]");
	}
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

const { Client2 } = require('pg');

const client2 = new Client2({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client2.connect();

client.on('ready', () => {
  console.log( client.user.username + ' [' + client.user.id + '] est en ligne!');
});

client.on('error', error => {
	console.log( error.message ); 
});

client.login(process.env.BOT_TOKEN).catch(console.error);
