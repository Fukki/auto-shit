const path = require("path");
const fs = require("fs");
module.exports = function autoShit(mod) {
	const cmd = mod.command || mod.require.command;
	let data = [], itemCd = {brooch: 0, rootbeer: 0};
	let config = getConfig();
	mod.game.initialize(['me']);
	
	mod.hook('S_LOGIN', 12, e => {
		data.gameId = e.gameId;
		data.job = (e.templateId - 10101) % 100;
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
		data.usedRootbeer = false;
		data.usedBrooch = false;
		data.invUpdate = false;
		data.inbuff = false;
		data.rootbeer = null;
		data.brooch = null;
	});
	
	mod.hook('S_ABNORMALITY_BEGIN', 3, e => {
		let info = config.list[data.job];
		if(config.enabled && info && e.target === data.gameId && e.id === info.buffid) {
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
		if(config.enabled && info && e.target === data.gameId && e.id === info.buffid) {
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
		if (!data.invUpdate) {
			data.invUpdate = true;
            data.brooch = e.items.find(item => item.slot === 20);
            data.rootbeer = e.items.find(item => config.rootbeer.includes(item.id));
			data.invUpdate = false;
		}
	});
	
	mod.hook('C_START_SKILL', 'raw', () => {checkShit();});
	mod.hook('C_START_INSTANCE_SKILL', 'raw', () => {checkShit();});
	
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
		if (mod.game.me.inBattleground) return;
		let info = config.list[data.job];
		if (info) {
			let now = Date.now();
			if (data.brooch && now > itemCd.brooch)
				switch (info.brooch.toLowerCase()) {
					case 'once':
						useItem(data.brooch);
						data.usedBrooch = true;
						break;
					case 'inbuff':
						useItem(data.brooch);
						break;
				}
			if (data.rootbeer && now > itemCd.rootbeer)
				switch (info.rootbeer.toLowerCase()) {
					case 'once':
						useItem(data.rootbeer);
						data.usedRootbeer = true;
						break;
					case 'inbuff':
						useItem(data.rootbeer);
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
						buffid: 100811,
						active: 'nextskill',
						brooch: 'once',
						rootbeer: 'inbuff'
					},
					3: {
						buffid: 401705,
						active: 'instance',
						brooch: 'once',
						rootbeer: 'once'
					},
					4: {
						buffid: 500150,
						active: 'nextskill',
						brooch: 'once',
						rootbeer: 'inbuff'
					},
					10: {
						buffid: 10153210,
						active: 'instance',
						brooch: 'once',
						rootbeer: 'inbuff'
					},
					12: {
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