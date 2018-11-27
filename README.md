[![Build Status](https://travis-ci.com/osrs-tracker/osrs-tracker.svg?branch=master)](https://travis-ci.com/osrs-tracker/osrs-tracker)
# OSRS Tracker
Track Old School RuneScape XP gains, GE prices, news, hiscores and more!  

<a href='https://play.google.com/store/apps/details?id=com.toxsickproductions.geptv2'>
  <img width="180px" alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png'/></a>

### API

You can find the OSRS Tracker API here https://github.com/osrs-tracker/osrs-tracker-api.

### Cron

You can find the OSRS Tracker Cron here https://github.com/osrs-tracker/osrs-tracker-cron.

The OSRS Tracker Cron performs tasks at certain times to update the OSRS Tracker database.
  - It updates all items that are tradable on the Grand Exchange every hour.
  - It adds a new XP Datapoint at UTC 00:00 for all players.
