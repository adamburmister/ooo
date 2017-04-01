# OOO Bot

This is a simple Slack command to mark your user profile as Out Of Office (commonly referred to as "OOO").

## Slack Command

### `/ooo`
#### Setting yourself as OOO

Mark yourself as OOO. This will append " (OOO)" to your last name.

For instance, you can use the command `/ooo` to mark yourself as OOO (Out Of Office), updating your user profile to be "Your Name (OOO)".

### `/ooo ${location}`
#### Setting yourself as OOO somewhere specific

You can also leave a more detailed description of your Out Of Office location.

For instance, you can use the command `/ooo WFH` to mark yourself as WFH (Working From Home), updating your user profile to be "Your Name (WFH)".

There's nothing magic about the location "WFH", you can use anything. `/ooo Cafe` will update your user profile to be "Your Name (Cafe)".

### `/ooo back`
#### Marking yourself as back in the office

`/ooo back` (or it's aliases "clear" or "reset") resets your user profile to it's original state, stripping the OOO location from your last name field.

For instance, you can use the command `/ooo back` to mark yourself as back in the office, updating your user profile from "Your Name (OOO)" to "Your Name".

## Author

Adam Burmister, adam@burmister.com
