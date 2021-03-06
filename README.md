﻿# Cursed Souls: Giovanni's Orchestra

![image](https://github.com/Bozar/cursedSouls/blob/master/img/youDie.png)

## Goal

> You find yourself lying on the ground, like a nameless body in the morgue, who is unknown to death, nor known to life. Weeping and whispers echo in your mind. One of the voices is calling to you: come here, ashen one.

Play the game [on-line](https://bozar.github.io/cursedSouls/).

Cursed Souls: Giovanni's Orchestra is a roguelike game written in JavaScript with [rot.js](https://github.com/ondras/rot.js). The dungeon has 3 levels: 1 aboveground and 2 underground. Your goal is simple:

* Find the downstairs.
* Stand on the downstairs and press `Space` to summon the boss.
* Beat the boss.
* Stand on the downstairs again and press `Space` to go to the next level.

So why bother killing grunts along the way? That's a good question.

## Key-bindings

Normal Mode:

* Move: `Arrow keys`, `hjkl`.
* Fast move: `Shift` + Movement keys.
* Pick up an orb or interact with the downstairs: `Space`.
* Wait 1 turn: `z`, `.(period)`.
* View achievements: `a`.
* Help: `?`.

Examine Mode, Aim Mode:

* Enter the Examine Mode: `x`.
* Enter the Aim Mode: `Space`.
* Use the last orb (Aim Mode only): `Space`.
* Lock the next target: `PgDn`, `n`, `o`.
* Lock the previous target: `PgUp`, `p`, `i`.
* Move the cursor: `Arrow keys`, `hjkl`.
* Exit to the Normal Mode: `Esc`.

When pressing `Space` in the Normal Mode, your character will try to do actions in this order:

* Interact with the downstairs.
* Pick up the orb under your feet.
* Enter the Aim Mode to use the last orb.

If all these actions fail for some reason, you remain in the Normal Mode and still have 1 turn to go.

## Pick Up Power Orbs

There are 4 types of power orbs lying on the ground: (F)ire, (I)ce, (S)lime and (L)ump. As mentioned above, you can pick up an orb by standing on it and pressing `Space`.

Power orbs are stored in the power stack. Your stack can hold at most 6 orbs.

## Lose Power Orbs

You cannot remove orbs from the stack yourself, but when you take X points of damage, the stack will pop X power orbs, which follows the `last-in, first-out` rule.

Your Hit-Point equals to the number of orbs in the stack. You can survive at 0 HP, but you will die when you suffer more damage than your remaining HP.

## Use Power Orbs

You can bump into enemies in a straight line or use power orbs to do special attacks.

* Bump: Melee, damage 1.
* Fire: Range 1, damage 1.
* Ice: Protect yourself with at most 2 layers of the Icy Armor.
* Slime: Range 2. Teleport yourself.
* Lump: Range 2, damage 1.

Follow these steps to use an orb.

* Be sure that you are not standing on the downstairs and you cannot pick up an orb, either because you are not standing on one or your power stack is full.
* Press `Space` to enter the Aim Mode. You can only use the last orb in the stack.
* Move the cursor (`X`) to a specific position:
  * Fire/Lump: an enemy inside the attack range;
  * Slime: an empty floor inside the attack range;
  * Ice: yourself.
* Press `Space` again to use the orb.

## Drop Power Orbs

Enemies have a chance to drop 1 orb when killed. Bosses (the enemy who has a bounty achievement) always drop 1 Lump Orb. As for the grunts, the drop rate depends on how they are killed:

* Bump: 20%.
* Bump with the Icy Armor: 60%.
* Fire: 100%.
* Lump: 60%.

You cannot press `Space` to use the Icy Armor, but if it is the last 'orb' in the inventory, the drop rate from your bump attack is raised to 60%.

Orbs do not stack on the dungeon floor. If two orbs appear in the same place, the newer orb will replace the older one. If the orb drops on the downstairs, it will disappear.

## Combat

Enemies' abilities are hinted in the descriptions. You can tell their challenge ratings by the loot.

* Easy: Slime.
* Normal: Fire, Ice.
* Hard: Lump.

Enemies' key information is described in one line: `[Name][The Dropping Orb][Hit Point]`.

There is no randomness in the hit chance or damage. No enemies, including the bosses, can do more than 3 points of damage in 1 turn.

The PC's actions take exactly 1 turn. But this rule dose not apply to some enemies.

In addition to deal damage, some enemies have special abilities.

* Summon allies (Level 1): Add one or more enemies to the dungeon under certain circumstances.
* Curse & Bomb (Level 2): See below.

After the boss fight, at most 4 orbs on the ground will reappear on the next dungeon level, which are selected in this order: Lump, Fire, Ice, Slime.

## Curse

Some enemies can curse the PC. You can have at most 3 curses, and you can remove them in 3 ways.

* Remove 1 curse by killing 1 enemy.
* Remove 1 curse when at the start of the boss fight if you have 3 curses.
* Remove all curses when entering a new dungeon level.

You cannot use cursed orbs, nor can you pick up orbs from the ground and put them into cursed slots.

The cursed orb is still counted as your HP and you will lose it when taking damage.

Your last uncursed orb is used to attack, teleport or raise the drop rate (if it is the Icy Armor.)

If your last uncursed orb is the Ice Orb, you can use it and get 2 layers of Icy Armor, one of which might be cursed and you might lose the last cursed orb in the following situation.

Before:

    1 2 3 4 5 C
    S F F F I L

After:

    1 2 3 4 5 C
    S F F F A A

## Bomb

The Bomb is a special type of enemy. You can stand on a bomb and use orb to attack it, but you cannot bump attack a bomb. The bomb explodes in 1 turn and you will be affected if you and the bomb are in the same grid.

## Survival Tips

* Read the enemies's description in the Examine Mode.
* Mind your step, and the enemy's step.
* Do NOT venture recklessly into the unexplored area.
* The Slime Orb is poor man's Icy Armor.
* Enemies might be faster or slower than you.
* It is a bad idea to chase fleeing enemies.

## Behind The Scene

### Inspiratoin: HyperRogue

After playing [HyperRogue](https://store.steampowered.com/app/342610/HyperRogue/), I asked myself: how to give PC different abilities, and keep the key-bindings as simple as possible? My answer has two points:

* Use a stack to store abilities.
* Use contextual key-bindings.

Starting from this idea, I spent 10 days to design the paper prototype for Cursed Souls.

And one more thing: HyperRogue is truly fascinating! Do not be intimidated by the mathematics, you can find detailed guides in the Steam community. If you can read Chinese, here is an [introduction](https://trow.cc/board/showtopic=30027) written by me.

### Monster AI

Here is the pseudo code about the monster AI, which is inspired from DarrenGrey's [Reddit post](https://www.reddit.com/r/roguelikedev/comments/3b4wx2/faq_friday_15_ai/csiw5bu/). In `scripts/monsterAI.js`, search `Main.system.dummyAct` and `Main.system.npcDecideNextStep` for more information.

```js
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

### Wizard Mode Key-bindings

* Switch the Wizard Mode: `~`.
* Print the seed: `=`.
* Add an orb: `1` to `6`.
* Remove an orb: `-`.
* Add a curse: `8`.
* Remove a curse: `7`.
* Print the current turn in the browser console: `\`.
* Switch the fog of war: `]`.
* Kill all enemies and teleport to the downstairs: `0`.
* Clear the local data: `C`.

After pressing `C`, all local data, including the achievement progress, will be deleted. Do this at your own risk.

It is not recommended to play the same seed repeatedly, but if you need to, there is a way. In `scripts/main.js`, search `12345`. Copy and uncomment the line, and then set the seed.

vim: set lbr:
