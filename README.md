# YouTube Membership Discord Bot

This is a Discord bot that allows a YouTube channel that supports Channel Memberships to sync their members to Discord.
This bot will allow the Discord server to set up Linked Roles to track whether a user is an active member, their current streak, and the total amount of months that they have been a member.

## Setup
Firstly, you will need a website that you can forward traffic to this application (I personally use nginx, but some other reverse proxy will work fine so long as it can turn an https connection into an http connection - preferably on localhost). Secondly, you will need to create a Bot on Discord [(link)](https://discord.com/developers/applications). Secondly, you will need to create a project on the Google Cloud Console (the UI for the console SUCKS, so good luck with that). You will need to enable the YouTube Data API for your application, and set up the oauth consent screen appropriately.

Blah blah blah, I couldn't be bothered to document the rest of this and you should be able to figure most of it out on your own. Feel free to submit a pull request to improve the documentation though.

## Important note!
YouTube requires a form to be filled out in order to access the necessary API endpoint to access membership data. You can find a link to the [YouTube API Documentation here](https://developers.google.com/youtube/v3/docs/members/list) which will have a link to the form to fill out. Alternatively, have your YouTube contact enable your application to be able to access it.
