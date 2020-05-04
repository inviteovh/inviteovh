const {
    client,
    con
} = require('./index')
const Discord = require('discord.js')
const webhook = new Discord.WebhookClient('xx', 'xx')

client.on('ready', () => {
    async function premiumController() {
        const sql = `SELECT * FROM links WHERE ${Date.now()} > premium_ended AND premium="1"`
        con.query(sql, async (err, results1) => {
            if(results1[0]) {
                const sql1 = `UPDATE links SET premium="0", color="#23272A" WHERE id="${results1[0].id}"`
                const guild = client.guilds.cache.get(results1[0].guild_id)
                con.query(sql1, async (err, results1) => {
                    webhook.send(
                        new Discord.MessageEmbed()
                        .setTitle('Cofnięto premium')
                        .addFields(
                            {name: 'Serwer', value: guild.name},
                            {name: 'ID', value: guild.id},
                            {name: 'Właściciel serwera', value: guild.owner.user.tag}
                        )
                    )
                    if(guild) {
                        
                        guild.members.cache.forEach(member => {
                            if(member.hasPermission('ADMINISTRATOR')) {
                                member.user.createDM()
                                member.user.send(`Skończyło się premium dla ${guild.name}`).catch(e=>e)
                            }
                        })
                        
                    }
                })
            }
        })
    }
    setInterval(premiumController, 60000)
})


client.on('error', e => {
    console.log(e)
})
client.on('warn', e => {
    console.log(e)
})
