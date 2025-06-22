## To-do
### Map
- [x] reset level on restart (doors, levers (elevator), etc)
- [ ] redo the level 1 map to match the original
- [ ] rotate lvl 1 cameras to match the original
- [x] fix camera FOV angle to match the original
- [ ] there should be a blindness effect in between cutscene scenes
### UI
- [ ] edit inventory UI
- [ ] Create background panorama
### Other
- [ ] somehow make reach shorter to match the original
- [ ] use the original models and textures for the gamebands (animated stuff  and laser thingy is missing)
- [ ] Make the computers have animated screens
### Backend
- [ ] Separate the functionality of each gameband into separate files <!-- Almost, still need to do Hacking and Recharge -->
- [ ] Make it so that voice lines are only played once, but the text is still sent to the chat
- [ ] Reorganize functionality from gameband to GamebandManager
- [ ] Reorganize functionality from alarm to AlarmManager
- [ ] Reorganize functionality from lvl_loader to LevelLoader
- [ ] Make one primary loop in index and remove the multiple loops currently in use
## Level -6
### World
- [x] Port level -6's build to Bedrock and replace blocks that have special models/textures
- [ ] Add level -6 definition file and add block functionality
### Backend
- [ ] Implement timer for levels
- [ ] Allow for one-time cutscenes before levels