//modify this section to include the coordinates for all the code blocks you wanna load, in the sequence they need to be loaded
const CODEBLOCK_LOCATIONS = [
	[0,0,0],
	[-1,0,0],
];
const ERROR_MSG_STYLING = {color:"rgb(255, 157, 135)"};

//get block data function extracted from Oce's exe thing
let getCodeBlockText = ([x,y,z])=>api.getBlockData(x,y,z)?.persisted?.shared?.text??"";

//register every single callback - this might not be the desired behaviour in some cases as it leads to more frequent rate limiter triggers. You may remove some callbacks from this list if u wish to

const CALLBACKS = ["tick","onClose","onPlayerJoin","onPlayerLeave","onPlayerJump","onRespawnRequest","playerCommand","onPlayerChat","onPlayerChangeBlock","onPlayerDropItem","onPlayerPickedUpItem","onPlayerSelectInventorySlot","onBlockStand","onPlayerAttemptCraft","onPlayerCraft","onPlayerAttemptOpenChest","onPlayerOpenedChest","onPlayerMoveItemOutOfInventory","onPlayerMoveInvenItem","onPlayerMoveItemIntoIdxs","onPlayerSwapInvenSlots","onPlayerMoveInvenItemWithAmt","onPlayerAttemptAltAction","onPlayerAltAction","onPlayerClick","onClientOptionUpdated","onMobSettingUpdated","onInventoryUpdated","onChestUpdated","onWorldChangeBlock","onCreateBloxdMeshEntity","onEntityCollision","onPlayerAttemptSpawnMob","onWorldAttemptSpawnMob","onPlayerSpawnMob","onWorldSpawnMob","onWorldAttemptDespawnMob","onMobDespawned","onPlayerAttack","onPlayerDamagingOtherPlayer","onPlayerDamagingMob","onMobDamagingPlayer","onMobDamagingOtherMob","onAttemptKillPlayer","onPlayerKilledOtherPlayer","onMobKilledPlayer","onPlayerKilledMob","onMobKilledOtherMob","onPlayerPotionEffect","onPlayerDamagingMeshEntity","onPlayerBreakMeshEntity","onPlayerUsedThrowable","onPlayerThrowableHitTerrain","onTouchscreenActionButton","onTaskClaimed","onChunkLoaded","onPlayerRequestChunk","onItemDropCreated","onPlayerStartChargingItem","onPlayerFinishChargingItem","doPeriodicSave"];

//list of functions used to fill up the callback space
let func_list = {};


let pointer = 0;
let fully_loaded = false;
let to_eval = "";
let has_evalled = false;
let init_interrupted = true;

//whether the global scope/pointer need to be reset due to reloading code
let need_resetting = false;

//callbacks registered by loaded code
let registered_cbs = {};

let tickFunc = ()=>{
    if(fully_loaded) {
        func_list.tick();
	} else if(need_resetting) {
        actual_reloading();
    } else if(pointer!==CODEBLOCK_LOCATIONS.length) {
		if(api.getBlock(CODEBLOCK_LOCATIONS[pointer])!=="Unloaded") {
			let text = getCodeBlockText(CODEBLOCK_LOCATIONS[pointer]);
			to_eval+=text;
			pointer++;
		}
	} else if(!has_evalled) {
        delete(globalThis.tick);
        for(let cb of CALLBACKS) {
            delete(globalThis[cb]);
        }
        let eval_succeeded = false;
		try{
			//trying to simulate how world code init works here: if the init phase gets interrupted, you are out of luck;
			has_evalled=true;
			//indirect eval
			(0,eval)(to_eval);
            eval_succeeded = true;
		}catch(err){
			api.broadcastMessage("Error in loaded world code init: Error: "+err,ERROR_MSG_STYLING);
			init_interrupted = false;
		}
        if(eval_succeeded) {
            //register the callbacks
            let callbacks = [];
            for(let cb of CALLBACKS) {
                let fn = globalThis[cb];
                if(typeof fn === "function") {
                    registered_cbs[cb] = fn;
                    callbacks.push(cb);
                }
            }
            if(callbacks.length===0) {
                if(to_eval.length!==0)api.broadcastMessage("Code loader: Found no callbacks",ERROR_MSG_STYLING);
            } else {
                api.broadcastMessage(`Code loader: Found ${callbacks.length} callbacks: ${callbacks.join(", ")}`,{color:"rgb(46, 235, 130)"});
            }
			init_interrupted = false;
            fully_loaded = true;
            //run onPlayerJoin for all existing players
            //this will behave closer to a world code that is modified (and re-initialized) after someone has already joined
            //rather than world code that is initialized on lobby init.
            for(let pid of api.getPlayerIds()) {
                try {
                    func_list.onPlayerJoin(pid);
                } catch(err) {
                    api.broadcastMessage("World code onPlayerJoin: Error: "+err,ERROR_MSG_STYLING);
                }
            }
        }
	} else if(init_interrupted) {
        //when world code init is interrupted, it is expected for NONE of the callbacks to work
        //simulating that behaviour
        registered_cbs = {};
        //display interrupted error message
		api.broadcastMessage("World code loader init: InternalError: Interrupted",ERROR_MSG_STYLING);
    	init_interrupted = false;
	}
}

for(let cb of CALLBACKS) {
	let f = function(...param) {
        //need to check if the callbacks are fully loaded here, as the world code init is expected to fail in case the init phase gets interrupted
        if(fully_loaded && cb in registered_cbs)registered_cbs[cb](...param);
	}
	func_list[cb]=globalThis[cb]=f;
}

globalThis.tick = tickFunc;

//resets all global variables and reload code
//might not be super reliable rn, tho
//this function is intended to be called in a code block
//included a random UUID as part of the name to avoid conflict with other functions
function reload_code_1bf5e8c0_a705_4403_b4ff_8c8bff30f1ba() {
    fully_loaded = false;
    need_resetting = true;
    //actual_reloading() is called both here and in the tick callback to ensure interruption safety without compromising efficiency
    //we don't want an interruption to strike in the middle of the global scope reset and cause unexpected behaviour
    actual_reloading();
}

let actual_reloading=function() {
    for(let name of globalThis_cache.get("Object").getOwnPropertyNames(globalThis_reference_cache)) {
        delete(globalThis_reference_cache[name]);
    }
    for(let [name,value] of globalThis_cache) {
        globalThis_reference_cache[name]=value;
    }
    fully_loaded = has_evalled = false;
    init_interrupted = true;
    to_eval = "";
    pointer = 0;
    registered_cbs = {};
    need_resetting = false;
}

let globalThis_cache = new Map(Object.getOwnPropertyNames(globalThis).map(name=>[name,globalThis[name]]));
let globalThis_reference_cache = globalThis;
