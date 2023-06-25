// Este archivo fue escrito por CibNumeritos#1094, cualquier uso, modificación o intento de lucro sin autorización del mismo sera penalizado. 
// This file was written by CibNumeritos#1094, any use, modification or profit intent whitout their autorization will be penalized. 
import { world, EquipmentSlot, system, EntityDamageCause, ItemStack, Player, MolangVariableMap, DynamicPropertiesDefinition } from '@minecraft/server';
import { ActionFormData, FormCancelationReason, MessageFormData, ModalFormData, ActionFormResponse, FormResponse, MessageFormResponse, ModalFormResponse } from "@minecraft/server-ui";
function delay(ticks) {
    return new Promise((resolve, reject) => {
        system.runTimeout(() => {
            resolve()
        }, ticks)
    })
}
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
            sendPlayerActionSelectionForm(player, selectedPlayer)
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
            sendPlayerActionSelectionForm(player, selectedPlayer)
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
            sendManagePlayersRanksForm(player);
            return;
        };
        console.warn(response.selection)
        if (response.selection == 0) {
            sendEditPlayerRanksForm(player, selectedPlayer)
        } else {
            sendPlayerAddRankForm(player, selectedPlayer)
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
            sendMainRanksForm(sender);
            return;
        }
        const selectedPlayer = world.getPlayers()[response.selection]
        sendPlayerActionSelectionForm(player, selectedPlayer)
    })
};
function configDefaultRank(player, errorMsg = undefined) {
    const ranksForm = new ModalFormData()
    system.run(() => {
        if (errorMsg != undefined) {
            ranksForm.title("§cError - Set default rank")
        } else {
            ranksForm.title("Set default rank")
        }
        ranksForm.textField(errorMsg == 0 || errorMsg == 2 ? '§cRank display name' : 'Rank display name', "Max. 32 characters.")
        ranksForm.textField(errorMsg == 1 || errorMsg == 2 ? '§cRank identifier' : 'Rank identifier', "Max. 16 characters.")
        ranksForm.textField('Optional default tags.\n(Added when a player joins for first time, separated by ";")', "Max. 100 characters.")
    })
    openForm(player, ranksForm, (response) => {
        if (response.canceled) {
            sendPlayerActionSelectionForm(player, selectedPlayer)
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
        world.setDynamicProperty('tsranks::default', `rank:{${JSON.stringify(createdRank)}}`)
        player.sendMessage(`§aThe rank §l${createdRank.ds}§r§a was succesfully set as default rank`)
        player.playSound('random.orb')
        for (const tag of rankTags.split(";")) {
            system.run(() => {
                player.addTag(tag)
            })
        }
    })
}
function sendMainRanksForm(player) {
    const ranksForm = new ActionFormData()
    system.run(() => {
        ranksForm.button("Manage players ranks")
        ranksForm.button("Configure default rank")
        // ranksForm.button("View all created ranks")
        // ranksForm.button("Configure moderators")
        ranksForm.title("Teseract's rank manager")
    })
    openForm(player, ranksForm, (response) => {
        if (response.canceled) {
            return;
        }
        switch (response.selection) {
            case 0: {
                sendManagePlayersRanksForm(player);
            } break;
            case 1: {
                configDefaultRank(player);
            } break;
        }
    })
};
world.afterEvents.worldInitialize.subscribe((arg) => {
    const def = new DynamicPropertiesDefinition()
        .defineString('tsranks::default')
    arg.propertyRegistry.registerWorldDynamicProperties(def)
})
world.beforeEvents.chatSend.subscribe(async (arg) => {
    arg.cancel = true;
    const { sender, message } = arg;
    if (message.startsWith("!ranks") && sender.hasTag('RankModerator')) {
        sendMainRanksForm(sender);
    } else {
        let ranks = searchRanks(sender)
        world.sendMessage(`§7[§r${ranks ?? '§8User§r'}§7]§r ${sender.name}§8:§r ${message}`);
    }
})
system.runInterval(() => {
    system.run(() => {
        for (const player of world.getPlayers()) {
            let ranks = searchRanks(player);
            if (!ranks) {
                player.addTag(world.getDynamicProperty('tsranks::default'));
                ranks = searchRanks(player);
            };
            const health = player.getComponent('minecraft:health');
            player.nameTag = `§r§7[§r${ranks}§7]§r ${player.name}\n${Math.floor(health.current)}/${Math.floor(health.value)}`;
        };
    });
}, 5);