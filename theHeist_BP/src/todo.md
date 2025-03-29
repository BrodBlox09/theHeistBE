## To-do
### Items
- [x] add Call the authorities item {name:'§oCall the authorities§r', lore:['Drop to restart level']}
- [x] add Use Keycard item {name:'§oUse Keycard§r', lore:['Can trigger any Keycard reader', 'for which you own a matching card']}
- [x] add NV Goggles item {name:'§oNV Goggles§r', lore:['Drop to regain items']}
	- [x] create armor model
	- [x] create attachable
- [x] make enchanted textures for all gamebands
### Map
- [ ] reset level on restart (doors, levers (elevator), etc)
- [ ] redo the level 1 map to match the original
- [x] add texts to interactable blocks through armor stands or other entities
- [ ] rotate lvl 1 cameras to match the original
- [x] fix camera FOV angle to match the original
- [x] add ticking sound whenever player is caught by the security system
- [x] add paintings and itemframe items <!-- Found the underlying cause and fixed it, apparently paintings are entities that get killed on level load. Now the paintings need to be placed -->
- [ ] fix the differences in the start van (missing models, missing driver, outside is different, command block textures are different, lighting is different)
- [x] recharging is faster in java <!-- This was actually a Java bug, I think they might have put an extra 0 somewhere or forgot a decimal place so instead of 1.0 it was 10 -->
- [x] when recharging, other gamebands are taken away
- [ ] there should be a blindness effect in between cutscene scenes
- [ ] Add elevator recharge station to level -1
### UI
- [ ] edit inventory UI
- [ ] Create background panorama
### Other
- [ ] somehow make reach shorter to match the original
- [ ] use the original models and textures for the gamebands (animated stuff  and laser thingy is missing), computers, drawers, signs, chairs, recharge stations, etc
### Backend
- [ ] Bring each level definition to their own seperate file <!-- Close! Need to do 3 more (1-1, 0-1, and 0-2) -->
- [ ] Rewrite levels so that they have a level ID and a level name so that the level name is NOT used to ID the level in the code
- [ ] Remove the bi-digit numbering scheme that levels currently have
- [ ] Rewrite the data management system (DataManager-rewrite branch)
- [ ] Separate the functionality of each gameband into seperate files <!-- Almost, still need to do Hacking and Recharge -->
- [x] Rewrite objective system to rely on IDs to update each objective's status? <!-- We sure this is done? -->
## Level -5
### World
- [ ] Port level -5's build to Bedrock and replace blocks that have special models/textures