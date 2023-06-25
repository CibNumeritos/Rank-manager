// Este archivo fue escrito por CibNumeritos#1094, cualquier uso, modificación o intento de lucro sin autorización del mismo sera penalizado. 
// This file was written by CibNumeritos#1094, any use, modification or profit intent whitout their autorization will be penalized. 
import { world, EquipmentSlot, system, EntityDamageCause, ItemStack, Player, MolangVariableMap } from '@minecraft/server';
import { ActionFormData, FormCancelationReason, MessageFormData, ModalFormData, ActionFormResponse, FormResponse, MessageFormResponse, ModalFormResponse } from "@minecraft/server-ui";
function delay(ticks) {
    return new Promise((resolve, reject) => {
        system.runTimeout(() => {
            resolve()
        }, ticks)
    })
}
// const banMessage = "Estas baneado de este servidor. L"
// const kickButtowski = (player, esokick) => {
//     player.dimension.runCommand(`kick ${player.name} "${esokick}"`)
// }
// system.events.beforeWatchdogTerminate.subscribe((arg) => arg.cancel = true)
// world.afterEvents.playerSpawn.subscribe(arg => {
//     if (arg.player.scoreboardIdentity.getScore(world.scoreboard.getObjective("isBanned")) == 1) {
//         kickButtowski(arg.player, banMessage)
//     }
// })
// system.runInterval(() => {
//     for (const player of world.getPlayers({ "scoreOptions": [{ "objective": "isBanned", "minScore": 1, "maxScore": 1 }] })) {
//         kickButtowski(player, banMessage)
//     };
//     for (const player of world.getPlayers()) {
//         if (player.location.y >= 219) {
//             return;
//         }
//         player.setSpawn(player.location, player.dimension)
//         let ranks = searchRanks(player)
//         if (!ranks) {
//             system.run(() => {
//                 player.addTag(player.hasTag("seeker") ? "rank:{§cCazador}" : "rank:{§bJugador}");
//             });
//             ranks = player.hasTag("seeker") ? `§cCazador` : `§bJugador`
//         };
//         player.nameTag = `§r§7[§r${ranks}§7]§r ${player.name}`
//     }
// }, 2)
// async function revive(player) {
//     return new Promise((resolve, reject) => {
//         const health = player.getComponent('minecraft:health');
//         system.runInterval(() => {
//             if (health.current > 0) {
//                 resolve();
//             };
//         });
//     });
// };
// world.afterEvents.entityHurt.subscribe(arg => {
//     const { damagingEntity, cause } = arg.damageSource;
//     const { hurtEntity } = arg;
//     if (!damagingEntity?.hasTag("seeker") || damagingEntity?.typeId != "minecraft:player" || hurtEntity.typeId != 'minecraft:player') {
//         return;
//     };
//     const seeker = damagingEntity, player = hurtEntity;
//     const seekerInventory = seeker.getComponent("minecraft:inventory");
//     const seekerMainhandItem = seekerInventory.container.getItem(seeker.selectedSlot);
//     if (seekerMainhandItem.typeId != "minecraft:stick" || !seekerMainhandItem.nameTag != 'Palo pa tasajiar') {
//         return;
//     };
//     world.sendMessage({
//         "translate": "death.attack.player",
//         "with": [
//             player.nameTag,
//             seeker.nameTag
//         ]
//     })
//     player.applyDamage(9999, { "cause": EntityDamageCause.void })
//     world.sendMessage(`§c¡${player.nameTag} ha sido encontrad@!`)
// })
// world.afterEvents.entityDie.subscribe(async (arg) => {
//     if (arg.deadEntity.typeId == 'minecraft:player') {
//         for (const player of world.getPlayers()) {
//             player.onScreenDisplay.setActionBar(`§c¡${arg.deadEntity.nameTag} ha sido eliminad@!`)
//             player.playSound("respawn_anchor.deplete", { "pitch": 1.5, "volume": 100 })
//         }
//         const player = arg.deadEntity
//         await revive(player);
//         player.runCommand('gamemode spectator @s')
//         let i = 10;
//         let id = system.runInterval(() => {
//             player.onScreenDisplay.setActionBar(i == 0 ? `§aReapareciendo...` : `§aReaparecerás en ${i} segundos`)
//             i--
//             i >= 0 ? player.playSound('random.orb', { pitch: 0.5 }) : ""
//         }, 20)
//         await delay(20 * (i + 1))
//         system.clearRun(id)
//         let yPos = 1;
//         let spawnPos = world.getDefaultSpawnPosition()
//         for (let y = 319; y > 0; y--) {
//             if (world.getDimension('minecraft:overworld').getBlock({ x: spawnPos.x, y: y, z: spawnPos.z }).typeId != "minecraft:air") {
//                 yPos += y;
//                 break;
//             }
//         };
//         player.teleport({ x: spawnPos.x, y: yPos, z: spawnPos.z }, { "dimension": player.dimension })
//         console.warn({ ...world.getDefaultSpawnPosition() })
//         world.sendMessage(JSON.stringify({ x: spawnPos.x, y: yPos, z: spawnPos.z }))
//         player.playSound('random.levelup', { pitch: 0.5 })
//         player.runCommand('gamemode s @s')
//     }
// })
/**
 * 
 * @param {Player} player 
 * @param {boolean} returnParsed 
 * @returns {string | RegExpMatchArray | undefined}
 */
function searchRanks(player, returnParsed = true) {
    /**@type {RegExpMatchArray} */
    let ranks = player.getTags().toString()?.match(/(?<=rank:{).*?(})/g);
    if (!ranks) {
        return undefined
    }
    // console.warn(ranks.map(obj => {console.warn(JSON.parse(obj).); return "negro"}))
    return returnParsed ? (ranks.map(obj => JSON.parse(obj).ds).join(', ')) : ranks;
}
/**
 * @template {ActionFormData | MessageFormData | ModalFormData} Form
 * @template {FormResponse | ActionFormResponse | ModalFormResponse | MessageFormResponse} formReponse
 * @param {Player} player 
 * @param {Form} form 
 * @param {(response: formReponse) => void} callback 
 */
function openForm(player, form, callback) {
    system.run(async () => {
        while (true) {
            let response = await form.show(player);
            if (response?.cancelationReason !== FormCancelationReason.userBusy) {
                try {
                    callback(response)
                } catch (error) {
                    console.warn("FORM ERROR", error, error.stack)
                }
                break;
            }
        };
    })
}
function sendPlayerAddRankForm(player, selectedPlayer, errorMsg = undefined) {
    const ranksForm = new ModalFormData()
    system.run(() => {
        if (errorMsg != undefined) {
            ranksForm.title("§cError - Add new rank")
        } else {
            ranksForm.title("Add new rank")
        }
        ranksForm.textField(errorMsg == 0 || errorMsg == 2 ? '§cRank display name' : 'Rank display name', "Max. 32 characters.")
        ranksForm.textField(errorMsg == 1 || errorMsg == 2 ? '§cRank identifier' : 'Rank identifier', "Max. 16 characters.")
        ranksForm.textField('Rank optional tag.\n(Add several tags using semicolons between)', "Max. 100 characters.")
    })
    openForm(player, ranksForm, (response) => {
        if (response.canceled) {
            return;
        };
        let errorLevel = -1;
        /**@type {string}*/
        const rankDisplay = response.formValues[0]
        /**@type {string}*/
        const rankIdentifier = response.formValues[1]
        if (rankDisplay.length > 32) errorLevel++
        if (rankIdentifier.length > 16) errorLevel++
        if (rankDisplay.length > 32 || rankIdentifier.length > 16) errorLevel++
        if (errorLevel > -1) return sendPlayerAddRankForm(player, selectedPlayer, errorLevel)
        const rankTags = response.formValues[2]
        const createdRank = {
            "id": rankIdentifier,
            "ds": rankDisplay
        }
        selectedPlayer.addTag(`rank:{${JSON.stringify(createdRank)}}.`)
        player.sendMessage(`The rank ${createdRank.ds} was succesfully added to ${selectedPlayer.name}`)
    })
}
function sendEditPlayerRanksForm(player, selectedPlayer) {
    const ranksForm = new ActionFormData()
    const ranks = searchRanks(selectedPlayer, false)
    system.run(() => {
        ranksForm.title("Edit " + selectedPlayer.name + " ranks")
        if (!ranks) {
            ranksForm.button("Add a first rank")
            return ranksForm.body(`${selectedPlayer.name} does not have any rank. You can add a new rank`)
        }
        for (const rank of ranks) {
            try {
                const rankInfo = JSON.parse(rank)
                ranksForm.button(rankInfo?.ds)
            } catch (error) {
                console.warn("INVALID RANK FORMAT:", error, error.stack)
            }
        }
    })
    openForm(player, ranksForm, (response) => {
        if (response.canceled) {
            return;
        };
        const selectedRank = !ranks ? undefined : JSON.parse(ranks[response.selection]);
        if (!selectedRank) return sendPlayerAddRankForm(player, selectedPlayer)
    });
};

function sendPlayerActionSelectionForm(player, selectedPlayer) {
    const ranksForm = new MessageFormData()
    system.run(() => {
        ranksForm.button1("Edit/remove a rank")
        ranksForm.button2("Add a new rank")
        ranksForm.title("Player: " + selectedPlayer.name)
        ranksForm.body("Select the action you want to perform on this player.")
    })
    openForm(player, ranksForm, (response) => {
        if (response.canceled) {
            return;
        };
        console.warn(response.selection)
        if (response.selection == 0) {
            sendEditPlayerRanksForm(player, selectedPlayer)
        }
    });
}
/**
 * 
 * @param {Player} player 
 */
function sendManagePlayersRanksForm(player) {
    const ranksForm = new ActionFormData()
    system.run(() => {
        for (const _player of world.getPlayers()) {
            ranksForm.button(_player.name)
        }
        ranksForm.title("Player rank manager")
    })
    openForm(player, ranksForm, (response) => {
        if (response.canceled) {
            return;
        }
        const selectedPlayer = world.getPlayers()[response.selection]
        sendPlayerActionSelectionForm(player, selectedPlayer)
    })
};
function sendMainRanksForm(player) {
    const ranksForm = new ActionFormData()
    system.run(() => {
        ranksForm.button("Manage players ranks")
        ranksForm.button("Configure default rank")
        ranksForm.button("Configure moderators")
        ranksForm.title("Teseract's rank manager")
    })
    openForm(player, ranksForm, (response) => {
        if (response.canceled) {
            return;
        }
        if (response.selection == 0) {
            sendManagePlayersRanksForm(player);
        } else { }
    })
};
world.beforeEvents.chatSend.subscribe(async (arg) => {
    arg.cancel = true;
    const { sender, message } = arg;
    if (message.startsWith("!ranks")) {
        sendMainRanksForm(sender);
    } else {
        let ranks = searchRanks(sender)
        world.sendMessage(`§7[§r${ranks}§7]§7 ${sender.name} §8>>§r ${message}`);
    }
})
/**
 * @template {ActionFormData | MessageFormData | ModalFormData} Form
 * @param {Player} player
 * @param {Form} form
 * @param {number} timeout
 * @returns {Promise<Awaited<ReturnType<Form["show"]>>>}
 */
export async function forceShow(player, form, timeout = Infinity) {
    const startTick = system.currentTick;
    while ((system.currentTick - startTick) < timeout) {
        let response
        system.run(async () => {
            response = await form.show(player);
        })
        if (response?.cancelationReason !== FormCancelationReason.userBusy) {
            return response;
        }
    };
    throw new Error(`Timed out after ${timeout} ticks`);
};
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        let ranks = searchRanks(player)
        if (!ranks) {
            system.run(() => {
                // player.addTag(player.hasTag("seeker") ? "rank:{§cCazador}" : "rank:{§bJugador}");
            });
            ranks = player.hasTag("seeker") ? `§cCazador` : `§bJugador`
        };
        player.nameTag = `§r§7[§r${ranks}§7]§r ${player.name}`
    }
}, 2)