# Cursed Souls: Giovanni's Orchestra

> You find yourself lying on the ground, like a nameless body in the morgue, who is unknown to death, nor known to life. Weeping and whispers echo in your mind. One of the voices is calling to you: come here, ashen one.

## Goal

Cursed Souls: Giovanni's Orchestra is a roguelike game written in JavaScript with [rot.js](https://github.com/ondras/rot.js). The dungeon has 4 levels: 1 aboveground and 3 underground. Your goal is simple:

* Find the downstairs.
* Bump into the downstairs to summon the level boss.
* Beat the boss and then go downstairs.

So why bother killing grunts along the way? That's a good question.

## Key-bindings

Normal mode:

* Move: arrow keys, hjkl
* Pick up: Space
* Wait: z, .
* Help: ?

Examine mode, aim mode:

* Enter: x, Space
* Use orb (aim mode only): Space
* Lock next target: o, n, PgDn
* Lock previous target: i, p, PgUp
* Move cursor: arrow keys, hjkl
* Exit: Esc

When pressing Space in normal mode, your character will try to pick up the orb. If that fails for some reason, enter aim mode instead.

## Power Orbs

There are 4 types of power orbs:

* Fire: melee, damage 1
* Ice: range 2, freeze the target for 2 turns
* Slime: range 2, teleport yourself
* Lump: range 2, damage 1

A frozen target can do nothing (including attack passively). It is also immune to ice orbs.

Orbs can be found on the ground or dropped by the enemy. Bosses always drop 1 lump orb. As for the grunts, the drop rate depends on how they are killed:

* Base attack: 20%
* Fire: 100%
* Lump: 60%
* Base/lump vs. frozen: 60%
* Fire vs. frozen: 100%

Orbs do not stack on the dungeon floor. If two orbs appear in the same place, the newer orb will replace the older one.

## Power Stack

Power orbs are stored in the power stack. Your stack can contain at most 6 orbs.

When pressing Space in aim mode, the last orb will be used.

When taking X damages from the enemy, the stack will pop X powers, following the `last in, first out` rule. If you take more damages than your remaining powers, you will die.

## Enemy

Enemies' abilities are hinted in the descriptions. You can tell their challenge ratings by the loot.

* Easy: slime
* Normal: fire, ice
* Hard: lump

## Behind The Scene

After playing [HyperRogue](https://store.steampowered.com/app/342610/HyperRogue/), I asked myself: how to give PC different abilities, and keep the key-bindings as simple as possible? My answer has two points:

* Use a stack to store abilities.
* Use contextual key-bindings.

Starting from this idea, I spent 10 days to design the paper prototype for Cursed Souls.

And one more thing: HyperRogue is truly fascinating! Do not be intimidated by the mathematics, you can find detailed guides in the Steam community. If you can read Chinese, here is an [introduction](https://trow.cc/board/showtopic=30027) written by me.

