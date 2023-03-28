const { Event } = require('../../../structures');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      enabled: true,
      name: 'guildMemberAdd',
    });
  }

  async run(member) {
  
    const savedUserRoles = this.client.plugins.roles.userroles.get(
      `${member.guild.id}_${member.id}`,
      "roles"
    );

    const autoRolesList = this.client.plugins.roles.getAutoRolesList(member.guild);
  
    if (savedUserRoles && savedUserRoles.length > 0) {
      for (const roleID of savedUserRoles) {
        const role = member.guild.roles.cache.get(roleID);
        if (role) {
          member.roles.add(role).catch(() => {});
        }
      }
    }
  
    if (autoRolesList && autoRolesList.length > 0) {
      for (const roleID of autoRolesList) {
        const role = member.guild.roles.cache.get(roleID);
        if (role) {
          member.roles.add(role).catch(() => {});
        }
      }
    }
  }  
};
