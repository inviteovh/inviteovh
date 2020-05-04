const {client, con, config} = require('./index')
const Discord = require('discord.js')
const prefix = config.prefix
const validHex = require('valid-hex-color')
const string = require('string-sanitizer')
const ms = require('ms')
const showdown = require('showdown')
var converter = new showdown.Converter();

const webhook = new Discord.WebhookClient(config.newserversid, config.newserverstoken)
const webhook2 = new Discord.WebhookClient(config.logsid, config.logstoken)

client.on('message', async message => {
    if(message.author.bot) return
    if(message.content == prefix) return

  if(message.author.bot) return;

  if(message.content.indexOf(prefix) !== 0) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
    if(command == 'setup') {
        
    if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Musisz posiadać permisje administratora aby użyć tej komendy!')

        if(args[0] == 'invite') {

                const embed = new Discord.MessageEmbed()
                .setThumbnail(client.user.displayAvatarURL())
                .setColor('RED')
                .setTitle('Tworzenie strony')
                const sql3 = `SELECT * FROM links WHERE guild_id=${message.guild.id}`

                con.query(sql3, async (err, result) => {
                    if(result[0]) return message.channel.send(embed.setDescription(`Ten serwer posiada już stronę.`));
                    
                    const channel = message.mentions.channels.first();
                    if(!channel) return message.channel.send(embed.setDescription(`Nie podano kanału do utworzenia zaproszenia.`));
                    if(!args[2]) return message.channel.send('Nie podałeś linku do utworzenia')
                    const slink = string.sanitize(`/${args[2]}`);
                    const salt_link = string.sanitize(`/${args[2]}/`);
                    const link = `/${slink}`;
                    const alt_link = `/${salt_link}/`
                    const invite = await channel.createInvite({
                        maxAge: 0
                    });
                    const sql1 = `SELECT guild_id FROM links WHERE router="${link}"" OR alt_router="${alt_link}"`;

                    con.query(sql1, async (err, result) => {

                        if(result) return message.channel.send(embed.setDescription(`Ten link jest zajęty przez jakiś serwer`));

                        const guildID = message.guild.id;

                        const sql2 = `INSERT INTO links (guild_id, router, alt_router, link) VALUES ("${guildID}", "${link}", "${alt_link}", "${invite.url}")`
                        con.query(sql2, async (err, result) => {
                            if(err) throw err;
                            //console.log(result)
                            message.channel.send(embed.setDescription(`Pomyślnie utworzono stronę www serwera.\nLink: ${config.www}${link}`));
                            const guildname=message.guild.name
                            const riplejsguildname = guildname.replace(/@everyone/gi, 'Nie działa frajerze pingowanie roli').replace(/@here/gi, 'Nie działa frajerze pingowanie roli').replace(/@Ping/gi, 'Nie działa frajerze pingowanie roli').replace(/<@&688295715797336074>/gi, 'Nie działa frajerze pingowanie roli')
                            webhook.send(`:fire: Utworzono nowy link! :fire:\n\nSerwer: \`${riplejsguildname}\`\n\nLink: ${config.www}${link}`)
                            webhook2.send(`Nazwa serwera: ${message.guild.name} \n\nLink: ${invite.url}\nLink invite.ovh: ${config.www}${link} \n\nOsoba tworzaca link: ${message.author.id} \`${message.author.tag}\``)
                            
                        });
                    })
            })

        } else if(args[0] == 'opis') {
            const embed = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('Zmiana opisu')
            .setThumbnail(client.user.displayAvatarURL())
            const opis = args.slice(1).join(' ').replace(/--/gi, '')
            con.query(`SELECT * FROM links WHERE guild_id=${message.guild.id}`, async (err, results) => {
                if(err) return message.channel.send(embed.setDescription(`UPS! Coś poszło nie tak.`)), console.log(err)
                if(!results) return message.channel.send(embed.setDescription(`Serwer nie posiada swojej strony!`))
            })
            if(!opis) return message.channel.send('Nie podałeś opisu serwera')
            var opis2 = converter.makeHtml(opis)
            const sql = `UPDATE links SET opis="${opis2}" WHERE guild_id="${message.guild.id}"`
            con.query(sql, async (err, results) => {
                if(err) {
                    message.channel.send('Coś poszło nie tak')
                    console.log(err)
                    return
                }
                message.channel.send(embed.setDescription(`Pomyślnie zaaktualizowano opis. Możesz zobaczyć efekty na swojej stronie.`).addField('Opis', opis))
                var channel = message.channel
                const invite = await channel.createInvite({
                });
                webhook2.send(`Nazwa serwera: ${message.guild.name} \n\nLink: ${invite.url} \n\nOsoba edytująca link: ${message.author.id} \`${message.author.tag}\`\n\nNowy opis: ${opis}`)
            })
        } else if(args[0] == 'kolor') {
            const embed = new Discord.MessageEmbed()
            .setThumbnail(client.user.displayAvatarURL())
            .setColor('RED')
            .setTitle('Zmiana koloru')
            const kolor = args[1]
            if(!kolor) return message.channel.send(embed.setDescription('Nie podano koloru'))
            if(!validHex.check(kolor)) return message.channel.send(embed.setDescription('Podano nieprawidłowy kolor HEX'))
            con.query(`SELECT * FROM links WHERE guild_id=${message.guild.id}`, async (err, results) => {
                if(err) return message.channel.send(embed.setDescription(`UPS! Coś poszło nie tak.`)), console.log(err)
                if(!results) return message.channel.send(embed.setDescription(`Serwer nie posiada swojej strony!`))
            })
            const sql = `UPDATE links SET embed_color="${kolor}" WHERE guild_id="${message.guild.id}"`
            con.query(sql, async (err) => {
                if(err) {
                    message.channel.send('Coś poszło nie tak')
                    console.log(err)
                    return
                }
                message.channel.send(embed.setDescription(`Pomyślnie zaaktualizowano kolor embedu. Możesz zobaczyć efekty wysyłając tutaj link do swojego Discorda.`).addField('Kolor', kolor))
            })

        } else if(args[0] == 'bg-color') {
            const embed = new Discord.MessageEmbed()
            .setThumbnail(client.user.displayAvatarURL())
            .setColor('RED')
            .setTitle('Zmiana koloru tła strony')
            const kolor = args[1]
            if(!kolor) return message.channel.send(embed.setDescription('Nie podano koloru'))
            if(!validHex.check(kolor)) return message.channel.send(embed.setDescription('Podano nieprawidłowy kolor HEX'))
            con.query(`SELECT * FROM links WHERE guild_id=${message.guild.id}`, async (err, results) => {
                if(err) return message.channel.send(embed.setDescription(`UPS! Coś poszło nie tak.`)), console.log(err)
                if(!results[0]) return message.channel.send(embed.setDescription(`Serwer nie posiada swojej strony!`))
                if(results[0].premium != 1) return message.channel.send(embed.setDescription('Serwer nie posiada Premium!'))
                
                const sql = `UPDATE links SET color="${kolor}" WHERE guild_id="${message.guild.id}"`
                con.query(sql, async (err) => {
                    if(err) {
                        message.channel.send('Coś poszło nie tak')
                        console.log(err)
                        return
                    }
                    message.channel.send(embed.setDescription(`Pomyślnie zaaktualizowano kolor stronki. Możesz zobaczyć efekty wchodząc na swoją stronkę.`).addField('Kolor', kolor))
                })
            })

        } else if(args[0] == 'auto-przekierowanie') {
            const embed = new Discord.MessageEmbed()
            .setThumbnail(client.user.displayAvatarURL())
            .setColor('RED')
            .setTitle('Auto-Przekierowanie')
            const oyo = args[1]
            if(!oyo) return message.channel.send(embed.setDescription('Zarządzanie auto-przekierowaniem\non - włączenie\noff - wyłączenie'))
            let sup
            if(oyo == 'on'){
                sup = 1
            } else if(oyo == 'off') {
                sup = 0
            } else {
                message.channel.send('Podałeś zły wybór')
                return
            }
            con.query(`SELECT * FROM links WHERE guild_id=${message.guild.id}`, async (err, results) => {
                if(err) return message.channel.send(embed.setDescription(`UPS! Coś poszło nie tak.`)), console.log(err)
                if(!results[0]) return message.channel.send(embed.setDescription(`Serwer nie posiada swojej strony!`))
                if(results[0].premium != 1) return message.channel.send(embed.setDescription('Serwer nie posiada Premium!'))
                
                const sql = `UPDATE links SET auto_forwarding="${sup}" WHERE guild_id="${message.guild.id}"`
                con.query(sql, async (err) => {
                    if(err) {
                        message.channel.send('Coś poszło nie tak')
                        console.log(err)
                        return
                    }
                    message.channel.send(embed.setDescription(`Pomyślnie zaaktualizowano auto-przekierowanie. Możesz zobaczyć efekty wchodząc na swoją stronę.`))
                })
            })
        } else if(args[0] == 'typ') {
            const embed = new Discord.MessageEmbed()
            .setThumbnail(client.user.displayAvatarURL())
            .setColor('RED')
            .setTitle('Typ tła stronki')
            const type = args[1]
            if(!type) {
                message.channel.send(embed.setDescription(`${prefix}setup typ <typ>\n
Dostępne typy:

kolor - ustawiasz tło swojej stronki na kolor
zdj - ustawiasz tło swojej stronki na zdjęcie

Owe typy działają tylko dla serwerów premium. Jeśli nie posiadasz pakietu premium zmiana typu nie zmieni twojej stronki`))
                return
            }
            const types = {
                "kolor": "color",
                "zdj": "img"
            }

            if(!types[type]) {
                console.log(type)
                message.channel.send(embed.setDescription(`Podałeś błędny typ`))
                return
            }
            con.query(`UPDATE links SET type = "${types[type]}" WHERE guild_id=${message.guild.id}`, async (err) => {
                if(err) {
                    console.log(err)
                    message.channel.send('OOPS! Coś poszło nie tak')
                    return
                }
                message.channel.send(embed.setDescription(`Pomyślnie zaaktualizowano typ tła na: ${type}`))
            })
        } else if (args[0] == 'img') {
            const embed = new Discord.MessageEmbed()
            .setThumbnail(client.user.displayAvatarURL())
            .setColor('RED')
            .setTitle('Zdjęcie tła stronki')
            const url = args[1]
            if(!url) {
                message.channel.send(embed.setDescription(`
Użycie - ${prefix}setup img <link do obrazu>

Jeżeli twój serwer nie posiada Premium nie zobaczysz zmian na swojej stronie.`))
                return
            }

            con.query(`UPDATE links SET img="${url}" WHERE guild_id=${message.guild.id}`, async err => {
                if(err) {
                    console.log(err)
                    message.channel.send(`OOPS! Nie mogę zapisać zmian w bazie danych`)
                }
                message.channel.send(embed.setDescription(`Pomyślnie zaaktualizowano zdjęcie tła storny na: ${url}`))
                webhook2.send(`Nazwa serwera: ${message.guild.name} \n\nLink: ${config.www}${link} \n\nOsoba edytująca link: ${message.author.id} \`${message.author.tag}\`\n\nNowe tło: ${url}`)
            })
        } else {
            
            const embed = new Discord.MessageEmbed()
            .setThumbnail(client.user.displayAvatarURL())
            .setColor('RED')
            .setTitle('Ustawienia serwera')
            .addField('Utwórz', `**${prefix}setup invite #kanał <twój link>**`)
            .addField('Przykład użycia', `**${prefix}setup invite #test-kanał inviteovh**\nTworzy zaproszenie pod linkiem **${config.www}/inviteovh**`)
            .addField('Opis serwera', `**${prefix}setup opis <opis twojego serwera>**`)
            .addField('Kolor embedu', `**${prefix}setup kolor #hex**`)
            .addField(':star: Tło strony', `**${prefix}setup bg-color #hex**`)
            .addField(':star: Auto przekierowanie', `**${prefix}setup auto-przekierowanie**`)
            .addField(':star: Typ tła strony', `**${prefix}setup typ <typ>**`)
            .addField(':star: Zdjęcie tła strony', `**${prefix}setup img <url>**`)
            .addField('Ostrzeżenie', `Pamiętaj, aby nie dodawać do linku **spacji, "--", ".", "@"** i innych znaków specjalnych gdyż zostanę one usunięte!`)
            .addField('Tutorial', `Nie wiesz jak stworzyć swoje zaproszenie? Wejdź na naszą stronę pomocy! https://help.invite.ovh/`)
            .addField('Podoba ci się nasz bot?', `Oddaj na niego swój głos! Głosy możesz dawać co 12 godzin! https://top.gg/bot/666628389309775873/vote`)
            .setFooter(`Tworząc zaproszenie akceptujesz regulamin serwisu. Regulamin znajdziesz pod ${prefix}regulamin`)
            return message.channel.send(embed)

        }
        
    };
    if(command == 'invite') {
        const sql = `SELECT router FROM links WHERE guild_id="${message.guild.id}"`
        con.query(sql, async (err, results) => {
            if(err) {
                message.channel.send(`OOPS! Coś poszło nie tak`)
                console.log(err.stack)
                return
            }
            const row = results[0]
            if(!row) {
                message.channel.send(`Serwer nie posiada swojego linku`)
                return
            }
            message.channel.send(`Link serwera: ${config.www}${row.router}`)
        })
    }
    if(command == 'help') {
        message.channel.send(
            new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('Pomoc')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                {name: 'Ustawienia linku', value: `${prefix}setup, ${prefix}setup invite, ${prefix}setup opis, ${prefix}setup kolor, ${prefix}setup bg-color`},
                {name: `Ogólne`, value: `${prefix}link, ${prefix}help, ${prefix}invite`},
                {name: 'Aktualizacje', value: `${prefix}update`}
            )
            
        )
    }
    if(command == 'regulamin'){
        message.channel.send(
            new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle(`Regulamin`)
            .setDescription('Regulamin usług\n[https://bit.ly/3awWuFS](Regulamin)')
        )
    }
    if(command == 'ohelp') {
        message.channel.send(
            new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('Pomoc')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                {name: 'Administracyjne', value: `${prefix}addpremium, ${prefix}delpremium, ${prefix}ownersmsg, ${prefix}adminsmsg, ${prefix}delete`}
            )
            
        )
    }
    if(command == 'ownersmsg') {
        if(message.author.id == '480338903648305183' || message.author.id == '660855941339545600'){
            client.guilds.cache.forEach(guild => {
                let i = 1
                const owner = client.users.cache
                const msg = args.slice(0).join(' ')
                owner.createDM().then(() => {
                    owner.send(msg).catch(err => message.channel.send(`Wykryto błąd: ${err}`))
                    message.channel.send(i++)
                })
            })
        } else {
            message.channel.send('Odmowa dostępu')
        }
    }
    if(command == 'adminsmsg') {
        if(message.author.id == '480338903648305183' || message.author.id == '660855941339545600'){
            client.guilds.cache.forEach(guild => {
                guild.members.cache.forEach(member => {
                    const msg = args.slice(0).join(' ')
                    if(member.hasPermission('ADMINISTRATOR')) {
                        member.user.createDM().then(() => {
                            let i = 1
                            member.user.send(msg).catch(e=>e)
                            console.log(i)
                            i+=1
                        })
                        
                    }
                })
                
            })
        } else {
            message.channel.send('Odmowa dostępu')
        }
    }
    if(command == 'addpremium') {
        if(message.author.id == '480338903648305183' || message.author.id == '660855941339545600'){
            const guildID = args[0]
            const guild = client.guilds.cache.get(guildID)
            if(!guild) return message.channel.send('Nie znalazłem tego serwera')
            const end = args[1]
            if(!end) return message.channel.send('Nie podano czasu trawania Premium')
            const endms = ms(end)
            if(!endms) return message.channel.send('Podano zły czas')
            console.log(endms)
            const pend = message.createdTimestamp + endms
            console.log(pend)
            const sql = `UPDATE links SET premium="1", premium_added="${message.createdTimestamp}", premium_ended="${pend}" WHERE guild_id=${guild.id}`
            
            con.query(sql, async (err) => {
                if(err) return message.channel.send('Wystąpił błąd'), console.log(err)
                message.channel.send(`Pomyślnie nadano premium dla **${guild.name}**`)
            })
        } else {
            message.channel.send('Odmowa dostępu')
        }
    }
    if(command == 'delpremium') {
        if(message.author.id == '480338903648305183' || message.author.id == '660855941339545600'){
            const guildID = args[0]
            const guild = client.guilds.cache.get(guildID)
            if(!guild) return message.channel.send('Nie znalazłem tego serwera')
            
            const sql = `UPDATE links SET premium="0" WHERE guild_id=${guild.id}`
            
            con.query(sql, async (err) => {
                if(err) return message.channel.send('Wystąpił błąd')
                message.channel.send(`Pomyślnie zabrano premium dla **${guild.name}**`)
            })
        } else {
            message.channel.send('Odmowa dostępu')
        }
    }

    if(command == 'ping') {
        message.channel.send(`Mój ping wynosi: ${client.ws.ping}ms`)
    }
    if(command == 'info') {
        message.channel.send(
            new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('Informacje')
            .addField('Serwery', client.guilds.cache.size)
            .addField('Użytkownicy', client.users.cache.size)
            .addField('Ping', `${client.ws.ping}ms`)
            .addField('Uptime', ms(client.uptime))
        )
    }
    if(command == 'update') {
        if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Odmowa dostępu')
        if(args[0] == 'link') {
                const sql1 = `SELECT * FROM links WHERE guild_id=${message.guild.id}`
                con.query(sql1, async (err, results) => {
                    if(err) {
                        message.channel.send('OOPS! Coś poszło nie tak')
                        console.log(err.stack)
                        return
                    }
                    if(!results[0]){
                        message.channel.send('Serwer nie posiada linku')
                        return
                    }
                    const slink = string.sanitize(`/${args[1]}`);
                    const salt_link = string.sanitize(`/${args[1]}/`);
                    const link = `/${slink}`;
                    const alt_link = `/${salt_link}/`

                    const sql = `SELECT * FROM links WHERE router="${link}"`
                    con.query(sql, async (err, results) => {
                        if(err) {
                            message.channel.send('OOPS! Coś poszło nie tak')
                            console.log(err.stack)
                            return
                        }
                        if(results[0]) return message.channel.send('Podany link jest zajęty przez inny serwer')

                        const sql2 = `UPDATE links SET router="${link}", alt_router="${alt_link}" WHERE guild_id=${message.guild.id}`
                        con.query(sql2, async (err) => {
                            if(err) {
                                message.channel.send('OOPS! Coś poszło nie tak')
                                console.log(err.stack)
                                return
                            }
                            message.channel.send(`Zaaktualizowano link\n${config.www}${link}`)
                            webhook2.send(`Nazwa serwera: ${message.guild.name} \n\nNowy link: ${config.www}${link} \n\nOsoba edytujaca link: ${message.author.id} \`${message.author.tag}\``)

                        })
                    })

                })



        } else if(args[0] == 'invite'){
            const channel = message.mentions.channels.first()
            if(!channel) {
                message.channel.send('Nie podano kanału na którym bot ma zaktualizować zaproszenie')
                return
            }
            const sql1 = `SELECT * FROM links WHERE guild_id=${message.guild.id}`
            con.query(sql1, async (err, results) => {
                if(err) {
                    message.channel.send('OOPS! Coś poszło nie tak')
                    console.log(err.stack)
                    return
                }
                if(!results[0]){
                    message.channel.send('Serwer nie posiada linku')
                    return
               }
                const invite = await channel.createInvite({
                 maxAge: 0
                })
                const sql = `UPDATE links SET link="${invite.url}" WHERE guild_id=${message.guild.id}`
                con.query(sql, async (err) => {
                if(err) {
                    message.channel.send('OOPS! Coś poszło nie tak')
                    console.log(err.stack)
                    return
                }
                message.channel.send('Pomyślnie zaaktualizowano link do Discorda. ' + invite.url)
            })
            })

        } else {
            message.channel.send(
                new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle('Aktualizacja')
                .addField('Zaproszenie', `${prefix}update invite #kanał`)
                .addField('Link', `${prefix}update link <nowy link>`)
                .setThumbnail(client.user.displayAvatarURL())

            )
        }
    }
    if(command == 'delete') {
        if(message.author.id == '480338903648305183' || message.author.id == '660855941339545600') {
            const link = args[0]
            if(!link) return message.channel.send('Nie podano link. Pamiętaj aby dodać `/` przed linkiem')

            const sql1 = `SELECT guild_id FROM links WHERE router="${link}"`
            con.query(sql1, async (err, results) => {
                if(err) {
                    message.channel.send('OOPS! Coś poszło nie tak')
                    console.log(err.stack)
                    return
                }

                if(!results[0]) return message.channel.send('Nie znaleziono linku')
                
                const sql = `DELETE FROM links WHERE router = '${link}'`
                con.query(sql, async (err) => {
                    if(err) {
                        message.channel.send('Coś poszło nie tak.\n\nError: ' + err)
                        return
                    }
                    message.channel.send(`Pomyślnie usunięto link **${link}**`)
                })

            })

        } else {
            message.channel.send('Odmowa dostępu')
        }
    }
    if(command == 'link') {
        message.channel.send(`Support serwer: https://discord.gg/nmuRxxN\n\nLink do dodania bota: https://discordapp.com/oauth2/authorize?client_id=666628389309775873&scope=bot&permissions=1`)
    }

});