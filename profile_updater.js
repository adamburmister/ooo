
/**
 * @param {@slack/client} web
 * @param {string} userId
 * @param {object} oooConfig
 * @param {string} oooConfig.location
 * @param {bool} oooConfig.isClearing
 * @param {object} oooConfig.user
 * @param {object} oooConfig.user.profile
 */
module.exports = function(web, userId, oooConfig) {
  return new Promise(function (resolve, reject) {
    var lastName;

    console.log('oooConfig', oooConfig);

    try {
      if (oooConfig.isClearing) {
        lastName = oooConfig.user.profile.last_name;
      } else {
        lastName = oooConfig.user.profile.last_name + " (" + oooConfig.location + ")";
      }
    } catch(e) {
      console.error(e);
      return reject('There was an error');
    }

    // Update their last name (+ OOO status) in their user profile
    web.users.profile.set({
      name: "last_name",
      value: lastName
    }, function(err, updatedUser) {
      if (err) {
        console.error('Error setting user profile');
        return reject("There was a problem updating your OOO status.");
      }

      // TODO: Overlay a status icon on the User Avatar and call setPhoto
      // to update it before resolving

      return resolve(updatedUser.profile);
    });
  });
};