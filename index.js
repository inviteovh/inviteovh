const Discord = require('discord.js');
const config = require('./config')
const {token, prefix} = require('./config')
const client = new Discord.Client();
const express = require('express')
const app = express()
const mysql = require('mysql')
const string = require('string-sanitizer')
const DBL = require("dblapi.js");
const dbl = new DBL(config.dbltoken, client);

const con = mysql.createConnection({
    host: config.mysqlhost,
    user: config.mysqluser,
    password: config.mysqlpasswd,
    database: config.mysqldb
})
con.connect((err) => {
	if(err) throw err;
	console.log('Połączono z MySQL')

})

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('invite.ovh || /help', {type: 'LISTENING'})
});

module.exports = {
    client: client,
    con: con,
    config: config,
    app: app
}

require('./web')
require('./commands')
require('./events')

client.login(token)