var Botkit = require('botkit');
var UserProfileUpdater = require('./profile_updater');
var WebClient = require('@slack/client').WebClient;

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
  console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
  process.exit(1);
}

var DEFAULT_OOO_LOCATION = "OOO";

var controller = Botkit.slackbot({
  debug: true,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  json_file_store: './db',
  scopes: [
    'commands', 
    'users.profile:read',
    'users.profile:write'
  ],
});

var token = process.env.SLACK_API_TOKEN || '';
var web = new WebClient(token);

controller.setupWebserver(process.env.PORT, function (err, webserver) {
  controller.createWebhookEndpoints(controller.webserver);
  controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

controller.on('slash_command', function (bot, message) {
  switch (message.command) {
    case "/ooo": // handle the `/ooo` slash command
      if (message.token !== process.env.VERIFICATION_TOKEN) return; //just ignore it.

      // Deal with the clear case
      var isClearing = false;
      if (message.text === "clear" || message.text === "reset" || message.text === "back") {
        isClearing = true;
      }

      // Parse the location from the message
      var location = message.text || DEFAULT_OOO_LOCATION;

      // Get the authed User's profile
      web.users.profile.get({}, function(err, remoteUserData) {
        controller.storage.users.get(message.user_id, function(err, storedUserData) {
          // If we haven't seen this user before we should save their profile as a backup
          if (err || !storedUserData || !storedUserData.profile) {
            storedUserData = Object.assign({id: message.user_id}, { 
              profile: remoteUserData.profile, 
              location: location 
            });
            controller.storage.users.save(storedUserData);
            console.log('No stored user data', storedUserData);
          }

          // Deal with the Help case      
          if (message.text === "help") {
            bot.replyPrivate(message,
              "I can update your displayed user name in Slack to include your Out Of Office status.\n" +
              "For instance typing `/ooo` would set your display name to \"" + storedUserData.profile.real_name + " (OOO)\".\n" +
              "You can also include a location, like `/ooo Cafe`, which would set your display name to \"" + 
              storedUserData.profile.real_name + " (Cafe)\".\n"
            );
            return;
          }
          
          // Otherwise this is a location update
          UserProfileUpdater(
            web,
            message.user_id, 
            { 
              location: location,
              isClearing: isClearing,
              user: storedUserData 
            }
          ).then(function(updatedProfile) {
            var reply;
            if (isClearing) {
              reply = "Welcome back! You're no longer marked as OOO, " + updatedProfile.real_name;
              // clear our stored status for the user
              controller.storage.users.delete(message.user_id);
            } else {
              reply = "You've been marked as OOO: " + updatedProfile.real_name;
            }

            bot.replyPrivate(message, reply);
          });
        });
      });

      break;
    default:
      bot.replyPublic(message, "I'm afraid I don't know how to " + message.command + " yet.");
  }  
});
