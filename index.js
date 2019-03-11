const path = require("path");
const fs = require("fs");
module.exports = function autoShit(mod) {
	const cmd = mod.command || mod.require.command;
	let data = [], itemCd = {brooch: 0, rootbeer: 0};
	let config = getConfig();
	mod.game.initialize(['me']);
	
	cmd.add('shit', (arg1, arg2, arg3) => {
		if(arg1 && arg1.length > 0) arg1 = arg1.toLowerCase();
		if(arg2 && arg2.length > 0) arg2 = arg2.toLowerCase();
		if(arg3 && arg3.length > 0) arg3 = arg3.toLowerCase();
		switch (arg1) {
			case 'on':
				arg3 = config.list[data.job];
				if (arg3) {
					config.enabled = true;
					msg(`Auto-Shit: enabled.`);
				} else {
					msg(`Auto-Shit: you not have any shit to enabled.`);
				}
				break;
			case 'off':
				arg3 = config.list[data.job];
				if (arg3) {
					config.enabled = false;
					msg(`Auto-Shit: disabled.`);
				} else {
					msg(`Auto-Shit: you not have any shit to disabled.`);
				}
				break;
			case 'set':
				arg3 = arg3.match(/#(\d*)@/) || -1;
				arg3 = Number(arg3[1]) || -1;
				if (arg3 < 0) {
					msg(`Auto-Shit: please put item link.`);
					break;
				}
				switch (arg2) {
					case 'b':
					case 'brooch':
						msg(`Auto-Shit: brooch id set to ${arg3}.`);
						config.list[data.job].broochinfo = arg3;
						data.broochinfo = {id: arg3, amount: 1}
						jsonSave('config.json', config);
						break;
					case 'r':
					case 'root':
					case 'beer':
					case 'rootbeer':
						msg(`Auto-Shit: rootbeer id set to ${arg3}.`);
						config.list[data.job].rootbeerinfo = arg3;
						data.rootbeerinfo = {id: arg3}
						jsonSave('config.json', config);
						break;
				}
				break;
			case 'reload':
			case 'load':
				config = getConfig();
				msg(`Auto-Shit: config has been reloaded.`);
				arg3 = config.list[data.job];
				if (arg3 && arg3.broochinfo > 0)
					data.broochinfo = {id: arg3.broochinfo}
				else
					data.broochinfo = null;
				if (arg3 && arg3.rootbeerinfo > 0)
					data.rootbeerinfo = {id: arg3.rootbeerinfo}
				else
					data.rootbeerinfo = null;
				break;
			case 'info':
			case 'check':
			case 'debug':
				arg3 = data.brooch ? data.brooch.id : -1;
				if (arg3 < 0) arg3 = data.broochinfo ? data.broochinfo.id : -1;
				msg(`Brooch Id: ${arg3}`);
				msg(`Rootbeer Id: ${data.rootbeer ? data.rootbeer.id : -1}`);
				break;
			default:
				msg(`Auto-Shit: wrong commands :v`);
				break;
		}
	});
	
	mod.hook('S_LOGIN', 12, e => {
		data.gameId = e.gameId;
		data.job = (e.templateId - 10101) % 100;
		let info = config.list[data.job];
		if (info && info.broochinfo > 0)
			data.broochinfo = {id: info.broochinfo, amount: 1}
		else
			data.broochinfo = null;
		if (info && info.rootbeerinfo > 0)
			data.rootbeerinfo = {id: info.rootbeerinfo}
		else
			data.rootbeerinfo = null;
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
		itemCd = {brooch: 0, rootbeer: 0};
		data.invUpdate = false;
		data.usedRootbeer = false;
		data.usedBrooch = false;
		data.inbuff = false;
		data.rootbeer = null;
		data.brooch = null;
	});
	
	mod.hook('S_LOAD_TOPO', 'raw', () => {
		data.invUpdate = false;
		data.usedRootbeer = false;
		data.usedBrooch = false;
		data.inbuff = false;
	});
	
	mod.hook('S_ABNORMALITY_BEGIN', 3, e => {
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
	
	mod.hook('S_ABNORMALITY_END', 1, e => {
		let info = config.list[data.job];
		if(info && e.target === data.gameId && e.id === info.buffid) {
			data.usedRootbeer = false;
			data.usedBrooch = false;
			data.inbuff = false;
		}
	});
	
	mod.hook('S_START_COOLTIME_ITEM', 1, e => {
 		if(!config.enabled) return;
 		if((data.brooch && e.item === data.brooch.id) || (data.broochinfo && e.item === data.broochinfo.id)) itemCd.brooch = Date.now() + e.cooldown * 1000;
 		else if(data.rootbeer && e.item === data.rootbeer.id) itemCd.rootbeer = Date.now() + e.cooldown * 1000;
 	});
	
	mod.hook('S_INVEN', mod.majorPatchVersion > 79 ? 18 : 17, e => {
		if (!data.invUpdate) {
			data.invUpdate = true;
			if (data.broochinfo)
				data.brooch = e.items.find(item => item.id === data.broochinfo.id);
			else
				data.brooch = e.items.find(item => item.slot === 20);
			if (data.rootbeerinfo)
				data.invTmp = e.items.filter(item => item.id === data.rootbeerinfo.id);
			else
				data.invTmp = e.items.filter(item => config.rootbeer.includes(item.id))
			if (data.invTmp.length > 0)
				data.rootbeer = {
					id: data.invTmp[0].id, 
					amount: data.invTmp.reduce(
						function (a, b) {
							return a + b.amount;
						}, 0)
				}
			data.invUpdate = false;
		}
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
	
	function startShit() {
		if (!config.enabled || !data.inbuff || mod.game.me.inBattleground) return;
		let info = config.list[data.job];
		if (info) {
			let now = Date.now();
			if (data.usedBrooch && (data.brooch || data.broochinfo))
				switch (info.brooch.toLowerCase()) {
					case 'once':
						if (now > itemCd.brooch)
							useItem(data.brooch || data.broochinfo);
						data.usedBrooch = false;
						break;
					case 'inbuff':
						if (now > itemCd.brooch)
							useItem(data.brooch || data.broochinfo);
						break;
				}
			if (data.usedRootbeer && data.rootbeer)
				switch (info.rootbeer.toLowerCase()) {
					case 'once':
						if (now > itemCd.rootbeer)
							useItem(data.rootbeer);
						data.usedRootbeer = false;
						break;
					case 'inbuff':
						if (now > itemCd.rootbeer)
							useItem(data.rootbeer);
						break;
				}
		}
	}
	
	function useItem(d) {
		if (d && d.amount > 0)
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
						buffid: 602108,
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
						buffid: 10152342,
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
	
	function msg(s) {cmd.message(s);}
}