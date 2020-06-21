module.exports = member => {
 let guild = member.guild;
  member.send('Sunucudan Ayrıldı!');
  guild.defaultChannel.send(` ${member.user.username} Sunucudan Ayrıldı !`);
};