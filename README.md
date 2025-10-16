# Simple Seemless World Code Loader

Enables you to store world code in a code block without making any modifications at all

**DISCLAIMER: This system is specifically designed for running in a game called Bloxd.io. If you are looking for projects to use for real-life production environment, this is not the right place**

## Usage

The code loader enables you to store ur world code in code block\(s\) in a completely seemless manner without making any changes to your \(old\) world code.

To do so, simply copy and paste your world code into a code block. Then, follow the same instructions used for press-to-execute boards to find the coordinates of the code block you've placed.

> Remember to round coordinates down. E.g. a coordinate at 11.5 is rounded down to 11, a coordinate at -11.5 is rounded down to -12

Then, copy the world code for the code loader(you can find them in Releases), and modify the `CODEBLOCK_LOCATIONS` array so that it only includes coordinates of the block you've placed.

You can find where this array is declared at the start of the world code for the code loader:
```js
//modify this section to include the coordinates for all the code blocks you wanna load, in the sequence they need to be loaded
const CODEBLOCK_LOCATIONS = [
	[0,0,0],
	[-1,0,0],
];
```

If you find it difficult to find the exact coordinates of a code block, remove your world code from that code block \(remember to keep a backup before doing that!!\) and paste in:
```js
console.log(thisPos);
```
and the coordinates of that code block will be printed out.

Then, simply paste the modified world code for the code loader into your lobby's world code, and your (old) world code should be automatically loaded for you in less than a second.

Now, if you have made some modifications to that code block, and you wish to reload the modified version into world code, you need to place down another code block, and paste in the following:

```js
reload_code_1bf5e8c0_a705_4403_b4ff_8c8bff30f1ba()
```

Then, simply click on the code block and your world code would be reloaded.

## Troubleshooting

As you migrate your world code into a code block, you might face some problems. Here are a few common ones and how to fix them.

### Swear Filter

The swear filter in bloxd.io is extremely annoying, especially because they exist in code blocks but not world code. Right now, there does not exist a single automated solution that can solve all instances of this problem, as the innerworking of the swear filter is complicated and subject to changes. If your code is triggering the swear filter, the only way to reliably solve this problem is to mannually modify your code and try to avoid combination of characters the filter deems as swears through trial and erorr. A few automated tools might help but they may not always work.

The tools listed below are written by me. They were created long ago before the introduction of world code and are no longer maintained, but they may still offer some help.

This includes:

a formatter for code blocks that is designed to help you avoid commonly known letter combinations that can trigger the swear filter.

[here](https://sulfrox.github.io/BoardFormatter/block-edition.html)

and

a dedicated anti-filter tool designed for more complicated scenaios, but uses some assumptions that are now proven to be false and may therefore fail under situations the first tool succeeds in.

[here](https://sulfrox.github.io/BoardFormatter/anti-filter.html)

A more systematic solution may be introduced later, depending on the demand for it.

### World Code Too Long

If your world code is too long to be stuffed into one single code block, it is possible to split it into multiple. This is very easy and straight forward.

All you have to do is to split your world code at any line break that you'd prefer, and paste the resulting code into 2 different code blocks. Then, simply specify the coordinates of these 2 different code blocks in the `CODEBLOCK_LOCATIONS` array in the sequence of the code snippets.

```js
const CODEBLOCK_LOCATIONS = [
	[0,0,0],    //coordinates of the first code block
	[-1,0,0],   //coordinates of the second code block
];
```

## Behaviour

The code loader is supposed to simulate the exact behaviour of bloxd's native world code initialization, thus making the transition from normal world code usage  seemless. Any inconsistency between the behaviour of the code loader and the native bloxd world code loading would be considered a bug, pls report it either in github issues or on discord.

## Performance

To garuantee that all possible world code that can need loading function correctly, the code loader listens on every single event listener that exists in the game when it's initialized. This could bring some performance issues into the lobby, and trigger frequent rate limiter activation even when no user space code is active at all. To mitigate this issue, the user may choose to remove some callbacks from the `CALLBACKS` array.

```js
const CALLBACKS = ["tick","onClose","onPlayerJoin","onPlayerLeave","onPlayerJump","onRespawnRequest","playerCommand","onPlayerChat","onPlayerChangeBlock","onPlayerDropItem","onPlayerPickedUpItem","onPlayerSelectInventorySlot","onBlockStand","onPlayerAttemptCraft","onPlayerCraft","onPlayerAttemptOpenChest","onPlayerOpenedChest","onPlayerMoveItemOutOfInventory","onPlayerMoveInvenItem","onPlayerMoveItemIntoIdxs","onPlayerSwapInvenSlots","onPlayerMoveInvenItemWithAmt","onPlayerAttemptAltAction","onPlayerAltAction","onPlayerClick","onClientOptionUpdated","onMobSettingUpdated","onInventoryUpdated","onChestUpdated","onWorldChangeBlock","onCreateBloxdMeshEntity","onEntityCollision","onPlayerAttemptSpawnMob","onWorldAttemptSpawnMob","onPlayerSpawnMob","onWorldSpawnMob","onWorldAttemptDespawnMob","onMobDespawned","onPlayerAttack","onPlayerDamagingOtherPlayer","onPlayerDamagingMob","onMobDamagingPlayer","onMobDamagingOtherMob","onAttemptKillPlayer","onPlayerKilledOtherPlayer","onMobKilledPlayer","onPlayerKilledMob","onMobKilledOtherMob","onPlayerPotionEffect","onPlayerDamagingMeshEntity","onPlayerBreakMeshEntity","onPlayerUsedThrowable","onPlayerThrowableHitTerrain","onTouchscreenActionButton","onTaskClaimed","onChunkLoaded","onPlayerRequestChunk","onItemDropCreated","onPlayerStartChargingItem","onPlayerFinishChargingItem","doPeriodicSave"];
```

Specifically, I recommend removing `"onInventoryUpdated"`, `"onChunkLoaded"`, and `"onPlayerRequestChunk"` from the callback list if you are concerned about performance, as almost no feature relies on them, and almost all feature that relies on them are bad designes. For the default values, however, I have decided to keep them in the `CALLBACKS` array to garuantee maximum compatibility.

## Security

Storing your world code in a code block prevents an amateur attacker from stealing your world code by simply opening the F8 mannual, which should be sufficient for most custom game designers/world lobby owners as the majority of their attackers are mostly kids. However, it is worth noting that a dedicated attacker with a custom client will still most likely be able to retrieve the contents of the code block. Therefore, this system is not suitable for highly security-sensitive scenarios.

## License

This system is licensed under the MIT license.