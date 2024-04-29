## To-do
### Items
- [x] add Call the authorities item {name:'§oCall the authorities§r', lore:['Drop to restart level']}
- [x] add Use Keycard item {name:'§oUse Keycard§r', lore:['Can trigger any Keycard reader', 'for which you own a matching card']}
- [x] add NV Goggles item {name:'§oNV Goggles§r', lore:['Drop to regain items']}
	- [x] create armor model
	- [x] create attachable
- [ ] make enchanted textures for all gamebands
### Map
- [ ] reset level on restart (doors, levers (elevator), etc)
- [ ] redo the level 1 map to match the original
- [x] add texts to interactable blocks through armor stands or other entities
- [ ] rotate lvl 1 cameras to match the original
- [x] fix camera FOV angle to match the original
- [ ] add ticking sound whenever player is caught by the security system
- [ ] add paintings and itemframe items <!-- What does this mean? Where are the paintings and itemframes supposed to be that are missing? -->
- [ ] fix the differences in the start van (missing models, missing driver, outside is different, command block textures are different, lighting is different)
- [x] recharging is faster in java <!-- This was actually a Java bug, I think they might have put an extra 0 somewhere or forgot a decimal place so instead of 1.0 it was 10 -->
- [x] when recharging, other gamebands are taken away
- [ ] there should be a blindness effect in between cutscene scenes
### Camera / Sensor
- [x] Add functionality to sensor mode
- [x] Fix camera sight (wall checks don't match Java, e.g. 2 high glass isn't seen through when it should be)
### UI
- [ ] edit inventory ui
### Other
- [ ] somehow make reach shorter to match the original
- [ ] use the original models and textures for the gamebands (animated stuff  and laser thingy is missing), computers, drawers, signs, chairs, recharge stations, etc
### Backend
- [ ] Rewrite the data management system (DataManager-rewrite branch)
- [ ] Separate the functionality of each gameband into seperate files
- [ ] Rewrite objective system to rely on IDs to update each objective's status?