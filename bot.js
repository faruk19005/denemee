const express = require('express');
const app = express();
const http = require('http');
    app.get("/", (request, response) => {
    console.log(`Yeniden Aktif...`);
    response.sendStatus(200);
    });
    app.listen(process.env.PORT);
    setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
    }, 210000);
//Bu Bölümleri Değiştirme
// ________________________________________________________________
const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const db = require('quick.db');
const Jimp = require('jimp');          fs
const stripIndents = require("common-tags") 

require('./util/eventLoader')(client);

var prefix = ayarlar.prefix;

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(aliases => {
      client.aliases.set(aliases, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

  client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.elevation = message => {
  if(!message.guild) {
  return; }
  let permLevel = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permLevel = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permLevel = 3;
  if (message.author.id === ayarlar.sahip) permLevel = 4;
  return permLevel
  };

///////////////////////////

let roleDefender = {};
client.on("roleDelete", async (role) => {
  const entry = await role.guild.fetchAuditLogs({type: 'ROLE_DELETE'}).then(audit => audit.entries.first());
  let yetkili = entry.executor;
  let cezaliRolu = "";
  let logKanali = "";
  await role.guild.member(yetkili).setRoles([cezaliRolu]);
  let yeniRol = await role.guild.createRole({ name: role.name, color: role.color, hoist: role.hoist, position: role.position, permissions: role.permissions, mentionable: role.mentionable });
  role.guild.channels.get(logKanali).send(new Discord.RichEmbed().setTimestamp().setDescription(`${yetkili} kişisi bir rol sildi ve cezalıya atıldı!\nRolü tekrar açtım ve üyelerine vermeye başladım!`));
  let mesaj = await role.guild.channels.get(logKanali).send(new Discord.RichEmbed().setDescription(`${role.name} adlı rol verilmeye başlanıyor!`));
  setTimeout(() => {
    let veri = roleDefender[role.id];
    let index = 0;
    setInterval(() => {
      veri = roleDefender[role.id];
      if (index >= veri.Üyeler.length){
        delete roleDefender[role.id];
        clearInterval(this);
      };
      let kisi = role.guild.members.get(veri.Üyeler[index]);
      try { kisi.addRole(yeniRol, "Koruma meydana geldi"); } catch(err) { };
      mesaj.edit(new Discord.RichEmbed().setDescription(`${kisi} adlı üyeye ${yeniRol} rolü verildi!`));
      index++;
    }, 2000);
  }, 5000);
});
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  oldMember.roles.forEach(async role => {
    if (newMember.roles.some(r => r.id == role.id)) return;
    if (!roleDefender[role.id]) {
      roleDefender[role.id] = {
        Rol: role,
        Üyeler: [newMember.id],
        Silindi: false
      };
    } else {
      roleDefender[role.id].Üyeler.push(newMember.id);
    };
  });
});




////////////




client.login(ayarlar.token);