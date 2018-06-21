﻿# Cursed Souls: Giovanni's Orchestra

> You find yourself lying on the ground, like a nameless body in the morgue, who is unknown to death, nor known to life. Weeping and whispers echo in your mind. One of the voices is calling to you: come here, ashen one.

## Goal

Play the game [on-line](https://bozar.github.io/cursedSouls/).

Cursed Souls: Giovanni's Orchestra is a roguelike game written in JavaScript with [rot.js](https://github.com/ondras/rot.js). The dungeon has 4 levels: 1 aboveground and 3 underground. Your goal is simple:

* Find the downstairs.
* Stand on the downstairs and press `Space` to summon the boss.
* Beat the boss.
* Stand on the downstairs and press `Space` to go to the next level.

So why bother killing grunts along the way? That's a good question.

## Key-bindings

Normal Mode:

* Move: `arrow keys`, `hjkl`.
* Pick up orbs or use the downstairs: `Space`.
* Wait: `z`, `.`.
* Help: `?`.

Examine Mode, Aim Mode:

* Enter: `x`, `Space`.
* Use orb (aim mode only): `Space`.
* Lock next target: `PgDn`, `n`, `o`.
* Lock previous target: `PgUp`, `p`, `i`.
* Move cursor: `arrow keys`, `hjkl`.
* Exit: `Esc`.

When pressing `Space` in the Normal Mode, your character will try to do actions in this order:

* Use the downstairs.
* Pick up the orb.
* Enter aim mode.

If all these actions fail for some reason, you remain in the Normal Mode and still have 1 turn to go.

## Power Orbs

There are 4 types of power orbs:

* Fire: melee, damage 1.
* Ice: grant you at most 2 layers of Icy Armor.
* Slime: range 2, teleport yourself.
* Lump: range 2, damage 1.

Orbs can be found on the ground or dropped by the enemy. Bosses always drop 1 lump orb. As for the grunts, the drop rate depends on how they are killed:

* Base attack: 20%.
* Base attack with Icy Armor: 60%.
* Fire: 100%.
* Lump: 60%.

You can bump into the nearby enemy to perform a base attack.

You cannot press `Space` to use the Icy Armor, but if it is the last 'orb' in the inventory, the drop rate from your base attack is raised to 60%.

Orbs do not stack on the dungeon floor. If two orbs appear in the same place, the newer orb will replace the older one. If the orb drops on the downstairs, it will disappear.

## Power Stack

Power orbs are stored in the power stack. Your stack can contain at most 6 orbs.

When pressing Space in aim mode, the last orb will be used.

When taking X damages from the enemy, the stack will pop X powers, following the `last in, first out` rule. If you take more damages than your remaining powers, you will die.

## Enemy

Enemies' abilities are hinted in the descriptions. You can tell their challenge ratings by the loot.

* Easy: Slime.
* Normal: Fire, Ice.
* Hard: Lump.

## Behind The Scene

After playing [HyperRogue](https://store.steampowered.com/app/342610/HyperRogue/), I asked myself: how to give PC different abilities, and keep the key-bindings as simple as possible? My answer has two points:

* Use a stack to store abilities.
* Use contextual key-bindings.

Starting from this idea, I spent 10 days to design the paper prototype for Cursed Souls.

And one more thing: HyperRogue is truly fascinating! Do not be intimidated by the mathematics, you can find detailed guides in the Steam community. If you can read Chinese, here is an [introduction](https://trow.cc/board/showtopic=30027) written by me.

Here is the pseudo code about the monster AI, which is inspired from DarrenGrey's [Reddit post](https://www.reddit.com/r/roguelikedev/comments/3b4wx2/faq_friday_15_ai/csiw5bu/). In `scripts/monsterAI.js`, search `Main.system.dummyAct` and `Main.system.npcDecideNextStep` for more information.

```
if (!pcIsInSight) {
    if (npcIsCloseToPC) {
        // Search the nearby PC.
        moveClose;
    } else {
        wait;
    }
}
// Check part of the conditions based on the attack type.
else if (pcIsWithinAttackRange
    && npcCanMoveForward        // Charge & attack.
    && pcHasEmptySlot           // Curse.
) {
    attack;
}
// All movements have a fail-safe 'wait' option.
// if (!moveAway) wait;
else {
    if (pcIsTooClose || npcIsAlone) {
        moveAway;
    } else if (pcIsWithinAttackRange) {
        moveAndKeepDistance;
    } else {
        moveClose;
    }
}
```
