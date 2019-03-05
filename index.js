const path = require("path");
const fs = require("fs");
module.exports = function autoShit(mod) {
	const cmd = mod.command || mod.require.command;
	let data = [], itemCd = {brooch: 0, rootbeer: 0};
	let config = getConfig();
	mod.game.initialize(['me']);
	
	cmd.add('shit', arg1 => {
		if(arg1 && arg1.length > 0) arg1 = arg1.toLowerCase();
		let info = config.list[data.job];
		switch (arg1) {
			case 'on':
				if (info) {
					config.enabled = true;
					cmd.message(`Auto-Shit: enabled.`);
				} else {
					cmd.message(`Auto-Shit: you not have any shit to enabled.`);
				}
				break;
			case 'off':
				if (info) {
					config.enabled = false;
					cmd.message(`Auto-Shit: disabled.`);
				} else {
					cmd.message(`Auto-Shit: you not have any shit to disabled.`);
				}
				break;
			case 'reload':
			case 'load':
				config = getConfig();
				cmd.message(`Auto-Shit: config has been reloaded.`);
				break;
			case 'check':
			case 'debug':
				cmd.message(`Brooch Id: ${data.brooch.id || data.broochinfo.id}`);
				cmd.message(`Rootbeer Id: ${data.rootbeer || data.rootbeerinfo}`);
				break;
			default:
				cmd.message(`Auto-Shit: wrong commands :v`);
				break;
		}
	});
	
	mod.hook('S_LOGIN', 12, e => {
		data.gameId = e.gameId;
		data.job = (e.templateId - 10101) % 100;
		resetShit();
	});
	
	mod.hook('C_PLAYER_LOCATION', 5, e => {
		data.loc = e.loc;
		data.w = e.w;
	});
	
	mod.hook('S_SPAWN_ME', 3, e => {
		data.loc = e.loc;
		data.w = e.w;
	});
	
	mod.hook('S_RETURN_TO_LOBBY', 'raw', () => {
		resetShit();
	});
	
	mod.hook('S_ABNORMALITY_BEGIN', 3, {order: Number.NEGATIVE_INFINITY}, e => {
		let info = config.list[data.job];
		if(info && e.target === data.gameId && e.id === info.buffid) {
			data.usedRootbeer = true;
			data.usedBrooch = true;
			data.inbuff = true;
			switch (info.active.toLowerCase()) {
				case 'instance':
					startShit();
					break;
			}
		}
	});
	
	mod.hook('S_ABNORMALITY_END', 1, {order: Number.NEGATIVE_INFINITY}, e => {
		let info = config.list[data.job];
		if(info && e.target === data.gameId && e.id === info.buffid) {
			data.usedRootbeer = false;
			data.usedBrooch = false;
			data.inbuff = false;
		}
	});
	
	mod.hook('S_START_COOLTIME_ITEM', 1, {order: Number.NEGATIVE_INFINITY}, e => {
 		if(!config.enabled) return;
 		if(data.brooch && e.item === data.brooch.id) itemCd.brooch = Date.now() + e.cooldown * 1000;
 		else if(data.rootbeer && e.item === data.rootbeer.id) itemCd.rootbeer = Date.now() + e.cooldown * 1000;
 	});
	
	mod.hook('S_INVEN', mod.majorPatchVersion > 79 ? 18 : 17, e => {
		data.brooch = e.items.find(item => item.slot === 20);
		data.rootbeer = e.items.find(item => config.rootbeer.includes(item.id));
	});
	
	mod.hook('C_START_SKILL', 'raw', () => {checkShit();});
	mod.hook('C_START_TARGETED_SKILL', 'raw', () => {checkShit();});
	mod.hook('C_START_INSTANCE_SKILL', 'raw', () => {checkShit();});
	mod.hook('C_START_INSTANCE_SKILL_EX', 'raw', () => {checkShit();});
	mod.hook('C_START_COMBO_INSTANT_SKILL', 'raw', () => {checkShit();});
	mod.hook('C_PRESS_SKILL', 'raw', () => {checkShit();});
	
	function checkShit() {
		if (data.inbuff) {
			let info = config.list[data.job];
			if (info)
				switch (info.active.toLowerCase()) {
					case 'nextskill':
						startShit();
						break;
				}
		}
	}
	
	function resetShit() {
		let info = config.list[data.job];
		if (info && info.broochinfo > 0)
			data.broochinfo = {id: info.broochinfo}
		else
			data.broochinfo = null;
		if (info && info.rootbeerinfo > 0)
			data.rootbeerinfo = {id: info.rootbeerinfo}
		else
			data.rootbeerinfo = null;
		itemCd = {brooch: 0, rootbeer: 0};
		data.usedRootbeer = false;
		data.usedBrooch = false;
		data.inbuff = false;
		data.rootbeer = null;
		data.brooch = null;
	}
	
	function startShit() {
		if (!config.enabled || !data.inbuff || mod.game.me.inBattleground) return;
		let info = config.list[data.job];
		if (info) {
			let now = Date.now();
			if (data.usedBrooch && data.brooch && now > itemCd.brooch)
				switch (info.brooch.toLowerCase()) {
					case 'once':
						useItem(data.brooch || data.broochinfo);
						data.usedBrooch = true;
						break;
					case 'inbuff':
						useItem(data.brooch || data.broochinfo);
						break;
				}
			if (data.usedRootbeer && data.rootbeer && now > itemCd.rootbeer)
				switch (info.rootbeer.toLowerCase()) {
					case 'once':
						useItem(data.rootbeer || data.rootbeerinfo);
						data.usedRootbeer = true;
						break;
					case 'inbuff':
						useItem(data.rootbeer || data.rootbeerinfo);
						break;
				}
		}
	}
	
	function useItem(d) {
		if (!d) return;
		mod.send('C_USE_ITEM', 3, {
			gameId: data.gameId,
			id: d.id,
			dbid: 0,
			target: 0,
			amount: 1,
			dest: {x: 0, y: 0, z: 0},
			loc: data.loc,
			w: data.w,
			unk1: 0,
			unk2: 0,
			unk3: 0,
			unk4: true
		});
	}

	function jsonRequire(d) {
		delete require.cache[require.resolve(d)];
		return require(d);
	}
	
	function getConfig() {
		let d = {};
		try {
			d = jsonRequire('./config.json');
		} catch (e) {
			d = {
				enabled: true,
				rootbeer: [80081],
				list: {
					0: {
						rootbeerinfo: 80081,
						broochinfo: 0,
						buffid: 100811,
						active: 'nextskill',
						brooch: 'once',
						rootbeer: 'inbuff'
					},
					1: {
						rootbeerinfo: 80081,
						broochinfo: 0,
						buffid: 200701,
						active: 'nextskill',
						brooch: 'once',
						rootbeer: 'inbuff'
					},
					2: {
						rootbeerinfo: 80081,
						broochinfo: 0,
						buffid: 300805, //300850, 300805, 301801
						active: 'nextskill',
						brooch: 'once',
						rootbeer: 'inbuff'
					},
					3: {
						rootbeerinfo: 80081,
						broochinfo: 0,
						buffid: 401705,
						active: 'instance',
						brooch: 'once',
						rootbeer: 'once'
					},
					4: {
						rootbeerinfo: 80081,
						broochinfo: 0,
						buffid: 500150,
						active: 'nextskill',
						brooch: 'once',
						rootbeer: 'inbuff'
					},
					5: {
						rootbeerinfo: 80081,
						broochinfo: 0,
						buffid: 602107, //602107, 602108, 602101
						active: 'nextskill',
						brooch: 'once',
						rootbeer: 'inbuff'
					},
					8: {
						rootbeerinfo: 80081,
						broochinfo: 0,
						buffid: 10151010,
						active: 'nextskill',
						brooch: 'once',
						rootbeer: 'inbuff'
					},
					9: {
						rootbeerinfo: 80081,
						broochinfo: 0,
						buffid: 10152342, //10152342, 10152340, 10152345
						active: 'nextskill',
						brooch: 'once',
						rootbeer: 'inbuff'
					},
					10: {
						rootbeerinfo: 80081,
						broochinfo: 0,
						buffid: 10153210,
						active: 'instance',
						brooch: 'once',
						rootbeer: 'inbuff'
					},
					11: {
						rootbeerinfo: 80081,
						broochinfo: 0,
						buffid: 10154480,
						active: 'nextskill',
						brooch: 'once',
						rootbeer: 'inbuff'
					},
					12: {
						rootbeerinfo: 80081,
						broochinfo: 0,
						buffid: 10155130,
						active: 'nextskill',
						brooch: 'once',
						rootbeer: 'inbuff'
					}
				}
			}
			jsonSave('config.json', d);
		}
		return d;
	}
	
	function jsonSave(name, data) {fs.writeFile(path.join(__dirname, name), JSON.stringify(data, null, 4), err => {});}
}