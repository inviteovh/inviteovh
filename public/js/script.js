var things = ['lvlup', 'sparfy', 'egaming'];
var thing = things[Math.floor(Math.random()*things.length)];
if(thing == "lvlup") {
	document.getElementById("promote").src = "https://i.imgur.com/N885UnZ.png";
	document.getElementById("promotelink").href = "https://lvlup.pro";
} else if(thing == "sparfy") {
	document.getElementById("promote").src = "https://i.imgur.com/hGm1NLm.png";
	document.getElementById("promotelink").href = "https://invite.ovh/sparfy";
} else if(thing == "egaming") {
	document.getElementById("promote").src = "https://cdn.discordapp.com/attachments/661961741042843679/701103543503028224/900x200_gotowy_slate.jpg";
	document.getElementById("promote").width = "450";
	document.getElementById("promote").height = "100";
	document.getElementById("promotelink").href = "https://equalitygaming.pl/";
}
