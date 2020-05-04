const { client, con, config, app } = require('./index')
const express = require('express')

client.on('ready', () => {
    app.use(express.static(__dirname + '/public'))

    app.set('view engine', 'ejs');
    app.get('/', async (req, res) => {
        res.render('index')
    })

    app.get('*', async (req, res) => {
        const link = req.path
        //console.log(req)
        const sql = `SELECT * FROM links WHERE router="${link}" OR alt_router="${link}"`
        con.query(sql, async (err, results, fields) => {
            if(err) return res.render('error', {
                error: '500',
                desc: 'UPS! Coś poszło nie tak.'
            })
            if(!results[0]) return res.render('error', {
                error: "404",
                desc: 'Podany link nie jest zapisany w bazie danych.'
            })
            //console.log(results[0])
            const db = results[0]
            const guild = client.guilds.cache.find(gld => gld.id == db.guild_id)
            if(!guild) return res.render('error', {
                error: '404',
                desc: 'Podany link został znaleziony w bazie danych lecz bot z tego serwera został usunięty.'
            })
            const online = guild.members.cache.filter(user => user.presence.status == 'online').size
            const idle = guild.members.cache.filter(user => user.presence.status == 'idle').size
            const dnd = guild.members.cache.filter(user => user.presence.status == 'dnd').size
            const all = online + idle + dnd;

            res.render('server', {
                code: db.link,
                opis: db.opis,
                premium: db.premium,
                guildName: guild.name,
                online: all,
                users: guild.memberCount,
                icon: guild.iconURL({ format: 'png', dynamic: true, size: 1024 }),
                link: db.link,
                embed_color: db.embed_color,
                color: db.color,
                auto_forwarding: db.auto_forwarding,
                db: db
            })
        })
    })

    app.listen(config.expressport, () => {
        console.log('Express OK!')
    })

})