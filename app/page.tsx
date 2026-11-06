"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// 1. CONFIGURATION & INITIALIZATION
// ============================================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const PAYSTACK_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
  "pk_live_4f604b2d9d9689f50eba439e704600844f7dfd01";

const ADSENSE_CLIENT_ID = "ca-pub-9204985294084444";
const ADMIN_MASTER_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "2026";

const TOTAL_NODES = 1000000;
const NODES_PER_SECTOR = 100;
const TOTAL_SECTORS = TOTAL_NODES / NODES_PER_SECTOR; // 10,000 Sectors
const NODE_PRICE = 100; // ₦100 per Golden Node
const REFERRAL_REWARD_AMOUNT = 50; // ₦50 credited once referred user plays with Main Wallet

const LIVE_TICKER_MESSAGES = [
  "💎 0901***552 unlocked ₦10,000 Mega Vault on Node #314!",
  "💎 0803***119 unlocked ₦5,000 Super Vault on Node #500,012!",
  "💎 0706***884 unlocked ₦3,000 Gold Vault on Node #14,820!",
  "💎 0814***902 unlocked ₦1,000 Cash Vault on Node #204,115!",
  "💎 0905***337 earned ₦50 Referral Play Bonus from an active player!",
  "💎 0809***441 unlocked ₦10,000 Mega Vault on Node #882,009!",
];

// ============================================================================
// 2. ALL 250 NIGERIAN ROASTS, JOKES & HUSTLE QUOTES FOR EMPTY (₦0) NODES
// ============================================================================
const EMPTY_NODE_ROASTS_AND_QUOTES: string[] = [
  // 1 - 25
  "Otilo! 😂 Your ₦100 don enter voicemail. Try the node beside am, your village people just dozed off!",
  "Nothing dey inside this vault o! 🤣 Even NEPA get light pass your luck right now. Tap another one sharp!",
  "Chai! So close! The ₦10,000 inside this box just comot go buy shawarma 2 minutes ago. Check the next node!",
  "Sapa 1 – You 0. 😭 No gree for Sapa o! The next Golden Node fit carry ₦5,000.",
  "Wait first... you use left hand tap this node ABI? 😂 Switch to right hand and tap the next one make alert enter!",
  "Eyah! Na only cobweb and breeze full inside this node 🕸️. Dust your hand tap another box jare!",
  "Breakfast don served! 💔 This node just give you hot pap without sugar. No dull, run another node!",
  "Who you offend for your compound? 😭 This box empty pass January 25th pocket. Try another sector!",
  "Even ordinary Garri no dey inside this vault! 🤣 Your ₦10,000 dey hide for another node, go find am!",
  "Hustle Quote: 'He who taps only one node and gives up leaves the ₦10,000 vault for the next man behind him!' 💪",
  "No cap, this node clean pass washed plate! 😂 Check the node below am, e get why!",
  "Omo! The billing wey dey wait for you outside plenty, no let one empty node stop your shine. Tap again! 🔥",
  "Your hand almost touch the ₦3,000 vault! E shift go the next node—pursue am sharp! 🏃‍♂️💨",
  "Street Wisdom: 'Fortune favors the bold—nobody ever won the mega vault by looking at the screen!' ⚡",
  "Ah! Even rat enter this node, e go faint because of hunger 😂. Jump go another sector sharp!",
  "Your village people dey hold meeting on top your matter, scatter their table with the next tap! 🔥",
  "Na breeze full inside this box o! 😂 If you listen well, you go hear 'Try again my guy!'",
  "This node dry pass harmattan lip! 👄 Put Vaseline for your thumb make you tap the winning node!",
  "You sure say you bathe with sponge this morning? 😂 Wash hand tap the next Golden Node joor!",
  "Ochim! The money wey suppose dey here just enter Uber comot now now! 🚕 Catch am for the next box!",
  "Quote: 'Success na turn by turn—if this node empty, the next node fit carry your urgent 2k!' 💰",
  "See as you open eye dey look phone 😂. No worry, alert go soon choke you for the next tap!",
  "Even cockroach nogree stay inside this node because of how empty e be! 🤣 Try Node beside am!",
  "Calm down boss, Rome wasn't built in one tap! 🏛️ Your ₦10,000 vault dey wait for front!",
  "Wait o, na who point this node give you? 😭 The person no wish you well at all! Pick your own lucky number!",

  // 26 - 50
  "Nothing dey here my Chief! 😂 Na only pure water nylon and old receipt remain inside this vault.",
  "If patience was a person, e go tell you make you tap the node on your right right now! 👉💎",
  "Omo, this node empty pass landlord heart when rent don due! 😭 Run go another sector!",
  "You tap am with confidence, e reply you with silence 😂. Shake body tap another one!",
  "Hustle Quote: 'No be who first tap node dey win ₦10k, na who no give up!' 🏆",
  "Abeg shift! 😂 The spirit inside this box say e dey on break, check the neighbour!",
  "Wetin concern agbero with overload? Tap another node make Paystack know say you dey online! 💳",
  "This box na pure disguise! 🤣 Outside shining gold, inside na empty drum. Check the next gold!",
  "Don't cry my gee, even Dangote lose ₦100 before e make billions! 😂 Tap again!",
  "Your network slowsmall when you tap am, somebody else don carry the blessing pass! ⚡ Tap faster!",
  "Na who send you come Sector this time? 😂 Type your birthday number for Search box make you see magic!",
  "Empty vault! 🪣 Even if you turn your phone upside down, kobo no go fall comot here. Try next!",
  "Street Quote: 'Sapa no dey hear grammar, na only steady tapping dey chase am comot!' 🔥",
  "Ah! This node just look your face laugh in vernacular 😂. Prove am wrong for the next box!",
  "You dey press phone like person wey dey calculate fuel price 🤣. Relax mind tap the winning node!",
  "Zero Naira! 😭 The money inside here travel go village for Christmas, e never return.",
  "Try use your nose tap the next node, maybe your thumb get bad luck today! 😂👃",
  "Quote: 'Every empty node you clear removes one obstacle between you and the ₦10,000 Mega Vault!' 💎",
  "E be like say you owe POS girl ₦50 change, na why this node lock up on you! 😂",
  "Nothing dey inside o! Even Google map no fit locate one naira inside this particular node! 🗺️",
  "Look your left, look your right—nobody see you lose that ₦100 😂. Quickly tap another one cover face!",
  "This node na 'Audio Money' headquarters! 🔊 Go find the main alert for the next column!",
  "Hustle Wisdom: 'A true boss treats an empty node as warm-up for the jackpot!' 🦁",
  "Omo! Even beggars for traffic go reject this node 😂. Move to the next Golden Box!",
  "Your eye don red! 🤣 Drink cold water first, then tap two nodes back-to-back!",

  // 51 - 75
  "Chai! Na ordinary 'Thank you for banking with us' dey inside this vault! 😂",
  "Who tell you say money dey hide for obvious place? 🕵️‍♂️ Search a random number between 1 and 1,000,000!",
  "This node empty pass promises of Nigerian politicians during campaign! 😭🗳️",
  "Quote: 'When life gives you an empty node, switch sectors and collect your ₦5,000!' 🚀",
  "Na wa o! The way you take tap this box, I think say you get insider info 😂. Try again!",
  "Even microscope no fit see shishi inside this box! 🔬 Move to the next diamond!",
  "Village people 1 – CEO 0. 😂 Do quick rematch for the next node make you equalize!",
  "If 'Had I Known' was a node, na this exact one you just tap so! 🤣",
  "No panic! That ₦100 wey comot na seed you sow inside the grid—harvest dey front! 🌱💰",
  "This box dry like bread wey dem leave for sun since last week Tuesday! 🍞😭",
  "Street Quote: 'Pressure ti wa, but the next node fit clear all your urgent bills!' ⚡",
  "You tap am softly like say you dey pet cat 🐱. Press the next node with authority joor!",
  "Nothing! Zero! Kobo no dey! 😂 Even the diamond icon on top the box dey shame for you!",
  "Check your phone battery—if e pass 20%, you still get power to find the ₦10,000 vault! 🔋",
  "Otilo far away! 🦅 That ₦100 don fly follow bird go Sambisa. Catch the next one!",
  "Quote: 'Smart players don't camp on one lucky number; they explore the sectors!' 🧭",
  "Abeg who wash this node? Everything inside don wipe clean! 😂🧼",
  "You almost pick the right one o! Just one inch to the left and alert for enter! 📏",
  "Sapa deyoutside dey do press-up waiting for you 😂. Tap another node lock door for am face!",
  "This vault na 419 edition—golden outside, dust inside! 🤣 Try another box!",
  "Even AI no fit explain why you leave all the winning nodes go tap this empty one! 🤖😂",
  "Hustle Quote: 'Today's empty tap is tomorrow's screenshot testimony!' 📸💵",
  "E pain me for your body o! 😭 The way you take wait make the vault load... na breeze!",
  "Try shout 'Obleeee!' before you tap the next node, e dey work magic! 🥂😂",
  "This node na ghost town! 👻 Nobody live here since 1960. Pack load go next sector!",

  // 76 - 100
  "Your hand hot, but this node cold pass mortuary! 🥶 Warm am up for the next box!",
  "Wait first, you don pay tithe this month? 😂 Because the way this node dodge you ehn!",
  "Quote: 'Fortune hides in the sector you haven't checked yet!' 🔑",
  "Na only 'Better luck next time' written in Chinese full inside here! 🉐🤣",
  "Even CBN governor open this particular node, e gobow for how dry e be! 🏦😂",
  "No dull yourself! Person wey win ₦10,000 yesterday tap empty node three times first! 💪",
  "Omo, this node just give you technical knock-out! 🥊 Stand up before referee count 10!",
  "If Sapa catch you after this tap, tell am say you dey with CEO! 😂 Tap again!",
  "Nothing dey inside! Na only echo dey come out if you shout 'Hello' inside this node! 🗣️",
  "Street Wisdom: 'Money no like fear—tap with chest and watch the vault open!' 🦍",
  "You pick this number because e fine ABI? 😂 Fine face no mean say money dey pocket!",
  "Even NEPA transformer get current pass this node! ⚡ Switch line sharp!",
  "Eyah, take heart my brother! 😂 At least you get data take see say nothing dey inside!",
  "Quote: 'One lucky tap erases twenty empty ones!' 🎯",
  "This vault empty like lecture hall on Friday afternoon! 🎓🤣",
  "Who you tell say you wan play game? Their bad eye don follow you enter this sector! 👀😂",
  "Close your left eye, count 1 to 3, then tap the middle node—thank me later! 😉",
  "Na pure mirage be this! 🏜️ You think say na water, meanwhile na dry desert sand!",
  "Even yahoo boy no fit cash out from this particular node! 😂💻",
  "Hustle Quote: 'Keep tapping until your Main Wallet looks like a phone number!' 📱💰",
  "Chai! This node just collect your ₦100 without saying thank you! 😭 Rude box!",
  "If they share luck for morning, where you dey? 😂 Wake up tap the real gold node!",
  "Nothing dey here o! Even spider don pack load comot for this node because of hunger! 🕷️",
  "Your village people think say dem don win—shock them with your next tap! ⚡",
  "Quote: 'The ₦10,000 Mega Vault doesn't hide from persistent hustlers!' 👑",

  // 101 - 125
  "Omo, this node dry pass lecturing without microphone! 🎤😭",
  "You tap am like person wey dey fear electric shock 😂. Hold am firm next time!",
  "Na only air conditioning dey blow inside this vault, zero cash! ❄️🤣",
  "Try jump go Sector #777 or Sector #2026, leave this dry land alone! 🏃‍♂️",
  "Even if you bring Juju come this node, kobo no go comot because nothing was put there! 😂🧿",
  "Street Quote: 'No gree for empty box—the grid owes you a comeback!' 🔥",
  "See as the node shine for outside like Dubai gold, inside na Mushin market! 😂",
  "Your ₦100 just do philanthropic donation to the grid! 🤝 Now go collect your return!",
  "Wait o, you eat beans before you tap this node? 😂 Because the luck justspoiled!",
  "Quote: 'Persistence turns ₦100 into ₦10,000 when you least expect it!' 💎",
  "Nothing dey inside my boss! Even thief open this box, e go drop transport money for you out of pity! 🤣",
  "This node na 'Seen without reply'! 💬💔 Move on to a node that texts back with cash!",
  "Your thumb slip ABI? 😂 Because I know say no be this empty box you plan to tap!",
  "Omo! Even fuel scarcity no scarce reach the money inside this node! ⛽😭",
  "Hustle Wisdom: 'Don't judge the whole 1-million grid by one stubborn node!' 🌍",
  "Na wa! This node just serve you cold eba without soup! 🥣😂",
  "Try refer one friend collect ₦50 Play Bonus make you use amscatter this sector! 🤝💰",
  "Even alarm clock no fit wake the money inside this node because e no exist! ⏰🤣",
  "Quote: 'Every champion has a history of missed shots before the winning buzzer!' 🏀",
  "Ah! You tap the exact node where Sapa keep hin spare key! 🗝️😭 Run o!",
  "No worry, your alert dey traffic—tap the next node clear road for am! 🚦💵",
  "This box empty like pot wey last born finish washing! 🍲😂",
  "Street Quote: 'He who fears losing ₦100 will never unlock ₦10,000!' 🦁",
  "You dey look the screen like say if you frown face, the ₦0 go turn to ₦5,000! 😠🤣",
  "Nothing dey inside o! Na only old calendar from 1998 we see inside this vault! 📅",

  // 126 - 150
  "Smile small na! 😂 Na ₦100 comot, no be kidney! Tap another node jare!",
  "Quote: 'The gold is always one inch deeper than where the quitter stopped digging!' ⛏️💎",
  "This node just do you 'April Fool' in the middle of the year! 🤡😂",
  "Even network provider go tell you 'Subscriber cannot be reached' inside this box! 📵",
  "Your luck dey load... 99%... tap one more node make e complete 100%! 📊⚡",
  "Omo, this node dry pass lecturer joke wey nobody laugh! 😭",
  "If emptiness was an Olympic sport, this node for win Gold Medal! 🥇🤣",
  "Hustle Quote: 'Stay hungry, stay foolish, and keep unlocking the grid!' 🚀",
  "Check your shoe—maybe you step on top banana peel before you open this app! 🍌😂",
  "Na only 'God dey' written on a piece of paper dey inside this vault! 🙏🤣",
  "Switch from left thumb to index finger—new technique brings new alert! ☝️💰",
  "This box na pure camouflage! 🪖 Nothing dey inside since Amalgamation of 1914!",
  "Street Wisdom: 'Big fish no dey swim for shallow water—jump go deeper sector!' 🦈",
  "Eyah! Your ₦100 just enter one-chance bus inside this node! 🚌😭",
  "Quote: 'Winners don't complain about empty vaults; they open the next one!' 🏆",
  "Even flashlight no fit see anything inside this dark empty node! 🔦😂",
  "You sure say your ex no work for this sector? Because the heartbreak here real o! 💔🤣",
  "No dull! While you dey read this roast, another guy dey eye the winning node beside you! 👀",
  "This node empty like stadium after match don finish! 🏟️😂",
  "Hustle Quote: 'Fortune rewards movement—jump 500 nodes forward and strike!' ⚡",
  "Chai! Na ordinary 'Seen 2:07 AM' full inside this box! 😂",
  "Even mosquito enter this node, e go fly comot immediately because nothing dey to suck! 🦟🤣",
  "Your ₦100 don go on national assignment! 🇳🇬 Tap the next node call am back with profit!",
  "Quote: 'The secret of the grid is simple: the more you explore, the luckier you get!' 🍀",
  "Omo! This node just give you high-five and collect your ₦100! ✋😂",

  // 151 - 175
  "Nothing dey here Chief! Na only dust and old newspaper from 2012! 📰🤣",
  "Try type your mother's birth year inside the node search bar—mother's prayer dey work! 🙏💎",
  "This vault dry like roasted corn wey dem forget on top charcoal! 🌽😭",
  "Street Quote: 'No let ₦100 loss make you miss ₦10,000 gain!' 💰",
  "You tap this node with two minds—next time tap am with full chest! Brust out! 💪😂",
  "Even Sherlock Holmes no fit find one kobo inside this particular node! 🔍🤣",
  "Village people just laugh 'Kikikiki' from inside their shrine! 😂 Scatter their laugh now!",
  "Quote: 'Luck is what happens when preparation meets the right Golden Node!' ✨",
  "Na wa o! This node clean like hospital tile! 🏥 Zero stain of naira inside!",
  "If you shake your phone well, you go hear the emptiness dey rattle inside! 📱😂",
  "Hustle Wisdom: 'Don't stop when you're tired; stop when you hit the Mega Vault!' 🔥",
  "This node na 'Promise and Fail' ambassador! 😭 Move to the next box sharp!",
  "Even landlord go forgive your rent if e see how empty this node be! 🏠🤣",
  "Your hand dey shake? 😂 Drink Zobo steady your nerve before the next tap!",
  "Quote: 'In a grid of one million nodes, hesitation is the only real loss!' ⏱️",
  "Otilo! The money inside here just take flight go London without visa! ✈️😂",
  "Nothing dey inside o! Even bucket of water no fit make this dry node wet! 🪣🤣",
  "Try tap a corner node—corner stone na there builders dey hide treasure! 🧱💎",
  "Street Quote: 'Man no die, man no rotten—tap another node make level change!' 🚀",
  "This box just look your Main Wallet and shout 'Next customer please!' 😂",
  "Even magician wave wand on top this node, na empty rabbit go jump out! 🎩🐇🤣",
  "Hustle Quote: 'Risk ₦100 with a billionaire mindset!' 💼💰",
  "Chai! You miss the cash node by just one hair strand! 💇‍♂️ Check the neighbour!",
  "This vault empty like student hostel during ASUU strike! 🎒😭",
  "No let this node intimidate you—you be CEO, show am who get the phone! 👑😂",

  // 176 - 200
  "Quote: 'Every master of the grid once opened a dozen empty boxes!' 🎖️",
  "Nothing dey here my guy! Na only whistling wind dey pass through this node! 🌬️🤣",
  "You tap am like say you dey press doorbell for rich man house! 🔔😂 Press am hard!",
  "Even calculator go show 'Syntax Error' if e try count the money inside here! 🧮😭",
  "Street Wisdom: 'When Sector A is dry, smart hustlers relocate to Sector B!' 🚁",
  "Omo! This node just give you 'Moral Support' instead of cash! 🤝😂",
  "Your village people dey use binocular watch your screen—blind them with the next win! 🔭⚡",
  "Quote: 'Small keys open big vaults—your next ₦100 could unlock ₦10,000!' 🗝️💰",
  "This box dry pass Garri Ijebu without groundnut! 🥜😭",
  "Even Google Assistant go tell you 'Sorry, I can't find any money here'! 🗣️😂",
  "Hustle Quote: 'Action cures fear—tap the next Golden Node and claim your sector!' 🦁",
  "Na only 'To Whom It May Concern' letter dey inside this vault! 📜🤣",
  "Try tap the node right under this one—gravity dey pull the money go down! ⬇️💎",
  "This node empty like fuel tank when gauge don pass red line! ⛽😂",
  "Street Quote: 'No be by muscle, na by grace and steady tapping!' 🙌",
  "Ah! Even pickpocket dip hand inside this node, e go bring out empty hand cry! 😭🤣",
  "Quote: 'Your breakthrough node is hiding in plain sight!' 👀✨",
  "You almost catch am! The alert just dodge your thumb like Ronaldinho! ⚽😂",
  "Nothing dey inside o! Na only 'We move' sticker dem gum for the wall of this vault! 🚀",
  "Hustle Wisdom: 'A true hustler turns frustration into focus on the next tap!' 🎯",
  "This node na pure comedy! 😂 Even Basketmouth no funny reach this empty vault!",
  "Check whether your phone dey on Airplane Mode, maybe na why the blessing fly pass! ✈️🤣",
  "Quote: 'Don't let a ₦0 node talk you out of a ₦10,000 destiny!' 💎",
  "Omo, this box empty pass bachelor fridge on Monday morning! 冷蔵庫😭",
  "Tap the next node fast before the person for Lagos tap am collect your money! 🏃‍♂️💨",

  // 201 - 225
  "Street Quote: 'If e easy, everybody for don buy Benz—keep tapping!' 🚗💨",
  "Nothing dey here boss! Even ant no see crumb carry inside this node! 🐜😂",
  "You use style tap am from corner, the node use style give you zero from center! 🤣",
  "Quote: 'Greatness is found on the other side of persistence!' 🌟",
  "This vault dry like harmattan breeze for Jos! 🏔️🥶",
  "Even pastor pray for this particular node, e go tell you say 'My son, move to the next one'! 😂🙏",
  "Hustle Quote: 'Your next tap knows nothing about your last empty node!' 🔄💰",
  "Chai! Na only 'Compliments of the Season' card remain inside here! 🎄🤣",
  "Try enter a random 6-digit number in the Go box—fortune loves surprise! 🎲💎",
  "This node empty like ATM machine on Friday evening! 🏧😭",
  "Street Wisdom: 'No folding, no bending—we tap until the vault opens!' 🔥",
  "Omo! The ₦100 just vanish like magician coin! 🪙😂 Go catch am for the next box!",
  "Quote: 'Success is 1% inspiration and 99% refusing to quit after an empty node!' 💪",
  "Even detective bring sniffer dog come here, the dog go sneeze comot! 🐕🤣",
  "Nothing dey inside o! Na only cobweb wey spider weave since 2015! 🕸️😂",
  "Hustle Quote: 'Play with strategy, tap with boldness, cash out with pride!' 🏦",
  "You look that diamond icon think say e dey smile with you ABI? 😂 Na trap!",
  "This box dry pass bone wey dog don chew three times! 🦴😭",
  "Quote: 'Every empty node is just clearing the bush on your road to gold!' 🌴✨",
  "Even NEPA bill get value pass wetin dey inside this particular node! 📄🤣",
  "Street Quote: 'Eye wey cry go still see alert—tap again my gee!' 💵",
  "Otilo! Your ₦100 don go buy gala for traffic! 🌭😂 Pursue am sharp!",
  "This node na 'Ghost Mode'—you tap am, e disappear your hope! 👻🤣",
  "Hustle Wisdom: 'The grid rewards the fearless—never back down from an empty box!' 🛡️",
  "Nothing dey here o! Even echo dey fear to sound inside this empty vault! 🔇😂",

  // 226 - 250
  "Quote: 'Winners focus on the prize vault; quitters focus on the empty node!' 🏆",
  "Chai! This node just give you warm handshake and tell you 'Safe journey'! 🤝😭",
  "Even if you pour anointing oil on top this node, na still ₦0 dey inside! 🍾😂",
  "Try tap an odd number node next—even numbers dey do shakara today! 🔢💎",
  "Street Quote: 'Sapa must bow—whether by force or by fire, alert go enter!' 🔥💰",
  "This box empty like classroom when rain dey fall on Monday morning! 🌧️🤣",
  "You tap am with joy, e answer you with 'Insha Allah next time'! 😂",
  "Quote: 'A champion is simply a player who tapped one more time after failing!' 👑",
  "Omo! Even breeze wey blow comot from this node dry my eye! 💨😭",
  "Nothing dey inside my brother! Dust your agbada and tap the next Golden Node! 👘😂",
  "Hustle Quote: 'Your lucky node is waiting on this grid—go claim your territory!' 🌍💎",
  "Even shadow no gree stay inside this node because nothing dey there! 👤🤣",
  "This vault dry like suya wey dem forget for wire till next morning! 🥩😭",
  "Street Wisdom: 'Who no risk ₦100 no fit testify about ₦10,000!' 📣💵",
  "Ah! The village drummer just beat gangan when you open this empty box! 🥁😂 Silence am!",
  "Quote: 'Patience and persistence conquer every grid!' ⚔️",
  "Na only 'Try Again Later' written with charcoal dey inside this node! ✏️🤣",
  "Even Google Translate no fit interpret the level of emptiness inside here! 🌐😂",
  "Hustle Quote: 'Don't watch the clock; do what it does—keep moving across the nodes!' ⏰🚀",
  "Chai! Your ₦100 just do bungee jump enter abyss! 🪂😭 Catch the next rope!",
  "This node empty pass wallet of man wey just finish traditional wedding! 💍🤣",
  "Street Quote: 'No retreat, no surrender—the Mega Vault belongs to the relentless!' 🦁🔥",
  "Nothing dey here Chief! Even bacterium no survive inside this dry vault! 🦠😂",
  "Quote: 'One golden tap can change your whole week—keep unlocking!' 🌟💰",
  "Final Boss Roast #250: Otilo! 😂 Since you don read reach here, the next node you tap get special anointing—go unlock am now! ⚡💎"
];

// ============================================================================
// 3. EXACT 12-TIER PRIZE DISTRIBUTION ENGINE (1,000,000 NODES BIJECTION)
// ============================================================================
// 1. 15,000 nodes = ₦70      (0 .. 14,999)
// 2.    500 nodes = ₦3,000   (15,000 .. 15,499)
// 3.     80 nodes = ₦5,000   (15,500 .. 15,579)
// 4.    100 nodes = ₦10,000  (15,580 .. 15,679)
// 5.  2,500 nodes = ₦1,000   (15,680 .. 18,179)
// 6. 30,000 nodes = ₦100     (18,180 .. 48,179)
// 7. 45,000 nodes = ₦50      (48,180 .. 93,179)
// 8. 45,000 nodes = ₦60      (93,180 .. 138,179)
// 9. 20,000 nodes = ₦30      (138,180 .. 158,179)
// 10. 15,000 nodes = ₦20     (158,180 .. 173,179)
// 11. 15,000 nodes = ₦10     (173,180 .. 188,179)
// 12.  5,000 nodes = ₦25     (188,180 .. 193,179)
// Remaining 806,820 nodes = ₦0 (193,180 .. 999,999)
function getExact12TierNodePrize(nodeId: number): number {
  if (nodeId < 1 || nodeId > TOTAL_NODES) return 0;
  const x = BigInt(nodeId - 1);
  const r1 = (x * BigInt(699693) + BigInt(314159)) % BigInt(1000000);
  const high = r1 / BigInt(1000);
  const low = r1 % BigInt(1000);
  const swapped = low * BigInt(1000) + high;
  const perm = Number(
    (swapped * BigInt(847297) + BigInt(271828)) % BigInt(1000000)
  );

  if (perm < 15000) return 70; // 1. 15,000 nodes = ₦70
  if (perm < 15500) return 3000; // 2. 500 nodes = ₦3,000
  if (perm < 15580) return 5000; // 3. 80 nodes = ₦5,000
  if (perm < 15680) return 10000; // 4. 100 nodes = ₦10,000
  if (perm < 18180) return 1000; // 5. 2,500 nodes = ₦1,000
  if (perm < 48180) return 100; // 6. 30,000 nodes = ₦100
  if (perm < 93180) return 50; // 7. 45,000 nodes = ₦50
  if (perm < 138180) return 60; // 8. 45,000 nodes = ₦60
  if (perm < 158180) return 30; // 9. 20,000 nodes = ₦30
  if (perm < 173180) return 20; // 10. 15,000 nodes = ₦20
  if (perm < 188180) return 10; // 11. 15,000 nodes = ₦10
  if (perm < 193180) return 25; // 12. 5,000 nodes = ₦25
  return 0; // Remaining 806,820 nodes = ₦0
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) {
    return "0" + digits.slice(3);
  }
  return digits;
}

// ============================================================================
// 4. GOOGLE ADSENSE BANNER COMPONENT
// ============================================================================
function AdSenseBanner({
  slotId = "9204985294",
  label = "SPONSORED ADVERTISEMENT",
}: {
  slotId?: string;
  label?: string;
}) {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {}
  }, []);

  return (
    <div className="my-3.5 p-2.5 bg-[#0a0d12] border border-zinc-800/90 rounded-xl text-center overflow-hidden shadow-inner">
      <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
        {label}
      </div>
      <div className="min-h-[65px] flex items-center justify-center bg-[#06080b] rounded-lg border border-zinc-900 px-2">
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: "60px" }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

// ============================================================================
// 5. MAIN APPLICATION COMPONENT
// ============================================================================
export default function ThePixelVestMasterApp() {
  // --- Sector & Grid Navigation State ---
  const [currentSector, setCurrentSector] = useState<number>(5001);
  const [sectorInput, setSectorInput] = useState<string>("5001");
  const [searchNodeInput, setSearchNodeInput] = useState<string>("500052");

  // --- User & Authentication State ---
  const [user, setUser] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authPhone, setAuthPhone] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authPin, setAuthPin] = useState<string>("");
  const [authReferral, setAuthReferral] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // --- Grid Live State (Sold Nodes + Admin Custom Overrides) ---
  const [soldNodesMap, setSoldNodesMap] = useState<Record<number, any>>({});
  const [nodeOverridesMap, setNodeOverridesMap] = useState<Record<number, any>>({});
  const [boardLoading, setBoardLoading] = useState<boolean>(false);

  // --- Active Node Modal & Unlock State ---
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [walletSource, setWalletSource] = useState<"main" | "bonus">("main");
  const [unlockLoading, setUnlockLoading] = useState<boolean>(false);
  const [rewardResult, setRewardResult] = useState<{
    nodeId: number;
    amount: number;
    brandName: string;
    logoUrl?: string;
    roastIndex: number;
  } | null>(null);

  // --- Wallet Deposit (Paystack) & Withdrawal Modal State ---
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [walletTab, setWalletTab] = useState<"fund" | "withdraw" | "referrals">(
    "fund"
  );
  const [fundAmount, setFundAmount] = useState<string>("500");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [withdrawPinInput, setWithdrawPinInput] = useState<string>("");
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);

  // --- Admin Studio & Node Editor State ---
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>("");
  const [editNodeId, setEditNodeId] = useState<string>("500001");
  const [editBrandName, setEditBrandName] = useState<string>("");
  const [editLogoUrl, setEditLogoUrl] = useState<string>("");
  const [editCustomPrize, setEditCustomPrize] = useState<string>("");
  const [adminSaving, setAdminSaving] = useState<boolean>(false);

  // --- PWA APK Install & Legal Policy Modals ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  // --- Live Ticker & Toast Feedback ---
  const [tickerIndex, setTickerIndex] = useState<number>(0);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (
    msg: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Rotate Top Payout Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_TICKER_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Device Fingerprint, Paystack, Service Worker, Referral & Session
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Generate or Restore Anti-Scam Device Fingerprint
    let storedDevice = localStorage.getItem("pixelvest_device_lock");
    if (!storedDevice) {
      storedDevice =
        "DEV_" +
        Math.random().toString(36).substring(2, 12) +
        "_" +
        Date.now().toString(36);
      localStorage.setItem("pixelvest_device_lock", storedDevice);
    }
    setDeviceId(storedDevice);

    // 2. Inject Paystack Inline Script
    if (!document.getElementById("paystack-inline-js")) {
      const script = document.createElement("script");
      script.id = "paystack-inline-js";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // 3. Register PWA Service Worker for APK-style installation
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    // 4. Capture Referral Parameter (?ref=080...)
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    if (refParam) {
      const cleanRef = normalizePhone(refParam);
      setAuthReferral(cleanRef);
      localStorage.setItem("pixelvest_saved_ref", cleanRef);
    } else {
      const savedRef = localStorage.getItem("pixelvest_saved_ref");
      if (savedRef) setAuthReferral(savedRef);
    }

    // 5. Restore Local Overrides Cache + User Session
    const localOverrides = localStorage.getItem("pixelvest_node_overrides");
    if (localOverrides) {
      try {
        setNodeOverridesMap(JSON.parse(localOverrides));
      } catch (e) {}
    }

    const savedPhone = localStorage.getItem("pixelvest_active_phone");
    if (savedPhone) {
      fetchUserSession(savedPhone);
    }

    fetchSectorBoardData(5001);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  // ============================================================================
  // 6. SUPABASE DATA SYNC & FAULT-TOLERANT USER HELPERS
  // ============================================================================
  const getMainBalance = (u: any): number => {
    if (!u) return 0;
    return Number(u.wallet_balance ?? u.balance ?? 0);
  };

  const getBonusBalance = (u: any): number => {
    if (!u) return 0;
    return Number(u.bonus_balance ?? u.play_bonus ?? 0);
  };

  const fetchUserSession = async (phone: string) => {
    const cleanPhone = normalizePhone(phone);
    if (!supabase) {
      const cached = localStorage.getItem(`pv_user_${cleanPhone}`);
      if (cached) setUser(JSON.parse(cached));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (data && !error) {
        setUser(data);
        localStorage.setItem("pixelvest_active_phone", cleanPhone);
        localStorage.setItem(`pv_user_${cleanPhone}`, JSON.stringify(data));
      } else {
        const cached = localStorage.getItem(`pv_user_${cleanPhone}`);
        if (cached) setUser(JSON.parse(cached));
      }
    } catch (e) {
      const cached = localStorage.getItem(`pv_user_${cleanPhone}`);
      if (cached) setUser(JSON.parse(cached));
    }
  };

  const updateUserRecord = async (
    phone: string,
    updates: Record<string, any>
  ) => {
    const cleanPhone = normalizePhone(phone);
    const mergedUser = { ...(user || {}), ...updates };
    if (user && normalizePhone(user.phone) === cleanPhone) {
      setUser(mergedUser);
      localStorage.setItem(`pv_user_${cleanPhone}`, JSON.stringify(mergedUser));
    }

    if (!supabase) return true;

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("phone", cleanPhone);

    if (error) {
      const fallbackUpdates: Record<string, any> = {};
      if (updates.wallet_balance !== undefined) {
        fallbackUpdates.wallet_balance = updates.wallet_balance;
      }
      if (updates.bonus_balance !== undefined) {
        fallbackUpdates.bonus_balance = updates.bonus_balance;
      }
      await supabase
        .from("users")
        .update(fallbackUpdates)
        .eq("phone", cleanPhone);
    }
    return true;
  };

  const fetchSectorBoardData = async (sector: number) => {
    setBoardLoading(true);
    const startNode = (sector - 1) * NODES_PER_SECTOR + 1;
    const endNode = sector * NODES_PER_SECTOR;

    if (!supabase) {
      setBoardLoading(false);
      return;
    }

    try {
      const { data: soldRows } = await supabase
        .from("grid_nodes")
        .select("*")
        .gte("node_id", startNode)
        .lte("node_id", endNode);

      if (soldRows) {
        setSoldNodesMap((prev) => {
          const next = { ...prev };
          soldRows.forEach((row: any) => {
            next[Number(row.node_id)] = row;
          });
          return next;
        });
      }

      const { data: overrideRows } = await supabase
        .from("node_overrides")
        .select("*")
        .gte("node_id", startNode)
        .lte("node_id", endNode);

      if (overrideRows) {
        setNodeOverridesMap((prev) => {
          const next = { ...prev };
          overrideRows.forEach((row: any) => {
            next[Number(row.node_id)] = row;
          });
          localStorage.setItem("pixelvest_node_overrides", JSON.stringify(next));
          return next;
        });
      }
    } catch (err) {
      console.error("Sector fetch error:", err);
    } finally {
      setBoardLoading(false);
    }
  };

  // ============================================================================
  // 7. FAULT-TOLERANT REGISTRATION & LOGIN (WITH ANTI-SCAM REFERRAL LOCKS)
  // ============================================================================
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = normalizePhone(authPhone);
    const cleanPassword = authPassword.trim();

    if (cleanPhone.length < 10) {
      showToast(
        "Please enter a valid 11-digit phone number (e.g. 08012345678).",
        "error"
      );
      return;
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      showToast("Password must be at least 4 characters.", "error");
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === "login") {
        if (supabase) {
          const { data: dbUser } = await supabase
            .from("users")
            .select("*")
            .eq("phone", cleanPhone)
            .maybeSingle();

          if (dbUser) {
            if (String(dbUser.password) !== cleanPassword) {
              showToast("Incorrect password! Please try again.", "error");
              setAuthLoading(false);
              return;
            }
            setUser(dbUser);
            localStorage.setItem("pixelvest_active_phone", cleanPhone);
            localStorage.setItem(`pv_user_${cleanPhone}`, JSON.stringify(dbUser));
            setShowAuthModal(false);
            showToast(
              `Welcome back, ${dbUser.full_name || cleanPhone}!`,
              "success"
            );
            setAuthLoading(false);
            return;
          }
        }

        const cachedStr = localStorage.getItem(`pv_user_${cleanPhone}`);
        if (cachedStr) {
          const cachedUser = JSON.parse(cachedStr);
          if (String(cachedUser.password) === cleanPassword) {
            setUser(cachedUser);
            localStorage.setItem("pixelvest_active_phone", cleanPhone);
            setShowAuthModal(false);
            showToast(
              `Welcome back, ${cachedUser.full_name || cleanPhone}!`,
              "success"
            );
            setAuthLoading(false);
            return;
          } else {
            showToast("Incorrect password!", "error");
            setAuthLoading(false);
            return;
          }
        }

        showToast("Account not found. Please switch to Register.", "error");
        setAuthMode("register");
      } else {
        // --- REGISTRATION MODE ---
        if (!authName.trim()) {
          showToast("Please enter your Full Name.", "error");
          setAuthLoading(false);
          return;
        }
        if (!authPin.trim() || authPin.trim().length !== 4) {
          showToast("Please enter a 4-digit Withdrawal PIN.", "error");
          setAuthLoading(false);
          return;
        }

        if (supabase) {
          const { data: existing } = await supabase
            .from("users")
            .select("phone")
            .eq("phone", cleanPhone)
            .maybeSingle();

          if (existing) {
            showToast(
              "This phone number is already registered. Please Login.",
              "error"
            );
            setAuthMode("login");
            setAuthLoading(false);
            return;
          }
        }

        // --- ANTI-SCAM REFERRAL VALIDATION ---
        let validReferrer: string | null = null;
        const candidateRef = normalizePhone(authReferral);
        const deviceCreatorPhone = localStorage.getItem(
          "pixelvest_first_account_on_device"
        );

        if (candidateRef) {
          if (candidateRef === cleanPhone) {
            showToast(
              "Anti-Cheat Notice: You cannot refer your own phone number!",
              "error"
            );
            validReferrer = null;
          } else if (deviceCreatorPhone && candidateRef === deviceCreatorPhone) {
            showToast(
              "Anti-Cheat Notice: Self-referral on the same phone/device is blocked.",
              "error"
            );
            validReferrer = null;
          } else {
            validReferrer = candidateRef;
          }
        }

        if (!deviceCreatorPhone) {
          localStorage.setItem("pixelvest_first_account_on_device", cleanPhone);
        }

        const fullUserPayload: Record<string, any> = {
          phone: cleanPhone,
          full_name: authName.trim(),
          password: cleanPassword,
          withdrawal_pin: authPin.trim(),
          wallet_balance: 0,
          bonus_balance: 0,
          referred_by: validReferrer,
          referral_rewarded: false,
          device_id: deviceId,
        };

        let finalCreatedUser = fullUserPayload;

        if (supabase) {
          const { data: inserted, error: err1 } = await supabase
            .from("users")
            .insert([fullUserPayload])
            .select()
            .maybeSingle();

          if (!err1 && inserted) {
            finalCreatedUser = inserted;
          } else {
            const minimalPayload: Record<string, any> = {
              phone: cleanPhone,
              full_name: authName.trim(),
              password: cleanPassword,
              withdrawal_pin: authPin.trim(),
              wallet_balance: 0,
              bonus_balance: 0,
            };
            const { data: insertedMin, error: err2 } = await supabase
              .from("users")
              .insert([minimalPayload])
              .select()
              .maybeSingle();

            if (!err2 && insertedMin) {
              finalCreatedUser = { ...fullUserPayload, ...insertedMin };
            } else {
              const { data: insertedBase } = await supabase
                .from("users")
                .insert([{ phone: cleanPhone, password: cleanPassword }])
                .select()
                .maybeSingle();
              if (insertedBase) {
                finalCreatedUser = { ...fullUserPayload, ...insertedBase };
              }
            }
          }
        }

        setUser(finalCreatedUser);
        localStorage.setItem("pixelvest_active_phone", cleanPhone);
        localStorage.setItem(
          `pv_user_${cleanPhone}`,
          JSON.stringify(finalCreatedUser)
        );
        setShowAuthModal(false);
        showToast(
          "Account created successfully! Welcome to The Pixel Vest.",
          "success"
        );
      }
    } catch (err) {
      console.error("Auth error:", err);
      showToast("Connection error. Please try again.", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  // ============================================================================
  // 8. UNLOCK NODE + EXACT 12-TIER PRIZES + ANTI-SCAM ₦50 REFERRAL + 250 ROASTS
  // ============================================================================
  const handleUnlockNode = async () => {
    if (!selectedNode) return;
    if (!user) {
      setSelectedNode(null);
      setShowAuthModal(true);
      return;
    }

    const mainBal = getMainBalance(user);
    const bonusBal = getBonusBalance(user);

    if (walletSource === "main" && mainBal < NODE_PRICE) {
      showToast(
        "Insufficient Main Wallet balance (₦100 needed). Fund via Paystack first!",
        "error"
      );
      setSelectedNode(null);
      setWalletTab("fund");
      setShowWalletModal(true);
      return;
    }

    if (walletSource === "bonus" && bonusBal < NODE_PRICE) {
      showToast(
        "Insufficient Play Bonus balance (₦100 needed). Switch to Main Wallet!",
        "error"
      );
      return;
    }

    if (soldNodesMap[selectedNode]?.is_sold) {
      showToast("This Node has already been unlocked!", "error");
      return;
    }

    setUnlockLoading(true);

    try {
      // 1. Determine Prize: Admin Custom Override takes priority over 12-Tier Distribution
      const customOverride = nodeOverridesMap[selectedNode];
      const hasCustomPrize =
        customOverride &&
        customOverride.custom_prize !== undefined &&
        customOverride.custom_prize !== null &&
        customOverride.custom_prize !== "";

      const prizeWon = hasCustomPrize
        ? Number(customOverride.custom_prize)
        : getExact12TierNodePrize(selectedNode);

      // 2. Calculate Updated Wallets (Winnings ALWAYS go to withdrawable Main Wallet)
      const updatedMain =
        walletSource === "main"
          ? mainBal - NODE_PRICE + prizeWon
          : mainBal + prizeWon;
      const updatedBonus =
        walletSource === "bonus" ? bonusBal - NODE_PRICE : bonusBal;

      // 3. Anti-Scam Referral Check
      const referrerPhone = user.referred_by
        ? normalizePhone(String(user.referred_by))
        : null;
      const cleanUserPhone = normalizePhone(String(user.phone));
      const alreadyRewarded =
        Boolean(user.referral_rewarded) ||
        localStorage.getItem(`pv_ref_paid_${cleanUserPhone}`) === "true";

      let shouldRewardReferrer = false;
      if (
        referrerPhone &&
        referrerPhone !== cleanUserPhone &&
        walletSource === "main" &&
        !alreadyRewarded
      ) {
        shouldRewardReferrer = true;
      }

      // 4. Update Current Player Wallet
      await updateUserRecord(cleanUserPhone, {
        wallet_balance: updatedMain,
        bonus_balance: updatedBonus,
        referral_rewarded: alreadyRewarded || shouldRewardReferrer,
      });

      if (shouldRewardReferrer && referrerPhone) {
        localStorage.setItem(`pv_ref_paid_${cleanUserPhone}`, "true");
        if (supabase) {
          const { data: refUser } = await supabase
            .from("users")
            .select("*")
            .eq("phone", referrerPhone)
            .maybeSingle();

          if (refUser && refUser.device_id !== deviceId) {
            const newRefBonus =
              Number(refUser.bonus_balance ?? 0) + REFERRAL_REWARD_AMOUNT;
            await supabase
              .from("users")
              .update({ bonus_balance: newRefBonus })
              .eq("phone", referrerPhone);
          }
        }
      }

      // 5. Mark Node as Sold in `grid_nodes`
      const soldRecord = {
        node_id: selectedNode,
        owner_phone: cleanUserPhone,
        owner_name: user.full_name || cleanUserPhone,
        brand_name: customOverride?.brand_name || null,
        logo_url: customOverride?.logo_url || null,
        is_sold: true,
        prize_won: prizeWon,
        unlocked_at: new Date().toISOString(),
      };

      setSoldNodesMap((prev) => ({
        ...prev,
        [selectedNode]: soldRecord,
      }));

      if (supabase) {
        await supabase.from("grid_nodes").upsert([soldRecord]);
      }

      const unlockedId = selectedNode;
      const randomRoastIdx =
        (unlockedId + Math.floor(Math.random() * 250)) %
        EMPTY_NODE_ROASTS_AND_QUOTES.length;

      setSelectedNode(null);
      setRewardResult({
        nodeId: unlockedId,
        amount: prizeWon,
        brandName: customOverride?.brand_name || `Golden Node #${unlockedId}`,
        logoUrl: customOverride?.logo_url,
        roastIndex: randomRoastIdx,
      });
    } catch (err) {
      console.error("Unlock node error:", err);
      showToast("Error unlocking node. Please try again.", "error");
    } finally {
      setUnlockLoading(false);
    }
  };

  // ============================================================================
  // 9. PAYSTACK LIVE WALLET DEPOSIT & BANK CASH OUT
  // ============================================================================
  const handleFundWithPaystack = () => {
    if (!user) {
      setShowWalletModal(false);
      setShowAuthModal(true);
      return;
    }

    const amountNaira = Number(fundAmount);
    if (isNaN(amountNaira) || amountNaira < 100) {
      showToast("Minimum deposit is ₦100.", "error");
      return;
    }

    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) {
      showToast(
        "Paystack gateway is initializing. Tap again in 2 seconds.",
        "info"
      );
      return;
    }

    const cleanPhone = normalizePhone(user.phone);
    const txRef = `PV_${cleanPhone}_${Date.now()}`;

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: `${cleanPhone}@thepixelvest.com.ng`,
      amount: Math.round(amountNaira * 100),
      currency: "NGN",
      ref: txRef,
      metadata: {
        custom_fields: [
          {
            display_name: "Player Phone",
            variable_name: "player_phone",
            value: cleanPhone,
          },
        ],
      },
      callback: function (response: any) {
        const currentMain = getMainBalance(user);
        const newMain = currentMain + amountNaira;

        updateUserRecord(cleanPhone, { wallet_balance: newMain }).then(() => {
          if (supabase) {
            supabase.from("transactions").insert([
              {
                user_phone: cleanPhone,
                type: "deposit",
                amount: amountNaira,
                status: "completed",
                reference: response.reference,
              },
            ]);
          }
          setShowWalletModal(false);
          showToast(
            `₦${amountNaira.toLocaleString()} credited to your Main Wallet!`,
            "success"
          );
        });
      },
      onClose: function () {
        showToast("Payment window closed.", "info");
      },
    });

    handler.openIframe();
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amt = Number(withdrawAmount);
    const mainBal = getMainBalance(user);

    if (isNaN(amt) || amt < 500) {
      showToast("Minimum withdrawal from Main Wallet is ₦500.", "error");
      return;
    }
    if (amt > mainBal) {
      showToast(
        "Insufficient Main Wallet balance. (Note: Play Bonus is for playing nodes only).",
        "error"
      );
      return;
    }
    if (
      user.withdrawal_pin &&
      String(user.withdrawal_pin) !== withdrawPinInput.trim()
    ) {
      showToast("Incorrect 4-Digit Withdrawal PIN!", "error");
      return;
    }

    setWithdrawLoading(true);
    try {
      const cleanPhone = normalizePhone(user.phone);
      const newMain = mainBal - amt;
      await updateUserRecord(cleanPhone, { wallet_balance: newMain });

      if (supabase) {
        await supabase.from("withdrawals").insert([
          {
            user_phone: cleanPhone,
            amount: amt,
            bank_name: bankName.trim(),
            account_number: accountNumber.trim(),
            account_name: accountName.trim(),
            status: "pending",
          },
        ]);
      }

      setShowWalletModal(false);
      setWithdrawAmount("");
      setWithdrawPinInput("");
      showToast(
        `₦${amt.toLocaleString()} Cash Out submitted! Processing to ${bankName}.`,
        "success"
      );
    } catch (err) {
      showToast("Could not submit withdrawal. Try again.", "error");
    } finally {
      setWithdrawLoading(false);
    }
  };

  // ============================================================================
  // 10. ADMIN NODE EDITOR (CHANGE NODE NAME, UPLOAD/LINK PICTURE & GIFT AMOUNT)
  // ============================================================================
  const handleAdminLoadNode = (nodeIdStr: string) => {
    setEditNodeId(nodeIdStr);
    const idNum = parseInt(nodeIdStr, 10);
    if (isNaN(idNum) || idNum < 1 || idNum > TOTAL_NODES) return;

    const existing = nodeOverridesMap[idNum];
    const defaultGift = getExact12TierNodePrize(idNum);
    setEditBrandName(existing?.brand_name || "");
    setEditLogoUrl(existing?.logo_url || "");
    setEditCustomPrize(
      existing?.custom_prize !== undefined && existing?.custom_prize !== null
        ? String(existing.custom_prize)
        : String(defaultGift)
    );
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 160;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/webp", 0.85);
        setEditLogoUrl(compressedDataUrl);
        showToast("Picture uploaded and optimized for Node!", "success");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNodeOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    const idNum = parseInt(editNodeId, 10);
    if (isNaN(idNum) || idNum < 1 || idNum > TOTAL_NODES) {
      showToast("Enter a valid Node ID between 1 and 1,000,000.", "error");
      return;
    }

    setAdminSaving(true);
    const prizeNum =
      editCustomPrize.trim() === ""
        ? getExact12TierNodePrize(idNum)
        : Number(editCustomPrize);

    const payload = {
      node_id: idNum,
      brand_name: editBrandName.trim() || null,
      logo_url: editLogoUrl.trim() || null,
      custom_prize: isNaN(prizeNum) ? 0 : prizeNum,
      updated_at: new Date().toISOString(),
    };

    try {
      const updatedMap = {
        ...nodeOverridesMap,
        [idNum]: payload,
      };
      setNodeOverridesMap(updatedMap);
      localStorage.setItem(
        "pixelvest_node_overrides",
        JSON.stringify(updatedMap)
      );

      if (supabase) {
        await supabase.from("node_overrides").upsert([payload]);
      }

      const targetSector = Math.ceil(idNum / NODES_PER_SECTOR);
      setCurrentSector(targetSector);
      setSectorInput(String(targetSector));

      showToast(
        `Node #${idNum} updated! Gift: ₦${payload.custom_prize.toLocaleString()}`,
        "success"
      );
    } catch (err) {
      showToast("Saved locally. Check Supabase `node_overrides` table.", "info");
    } finally {
      setAdminSaving(false);
    }
  };

  // ============================================================================
  // 11. NAVIGATION & SECTOR COMPUTATIONS
  // ============================================================================
  const changeSector = (newSec: number) => {
    const clamped = Math.max(1, Math.min(TOTAL_SECTORS, newSec));
    setCurrentSector(clamped);
    setSectorInput(String(clamped));
    fetchSectorBoardData(clamped);
  };

  const handleJumpToNode = () => {
    const cleanNum = parseInt(searchNodeInput.replace(/,/g, ""), 10);
    if (isNaN(cleanNum) || cleanNum < 1 || cleanNum > TOTAL_NODES) {
      showToast("Enter a Node number between 1 and 1,000,000", "error");
      return;
    }
    const targetSec = Math.ceil(cleanNum / NODES_PER_SECTOR);
    changeSector(targetSec);
    setSelectedNode(cleanNum);
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        showToast("Installing The Pixel Vest APK App...", "success");
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const copyReferralLink = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const cleanPhone = normalizePhone(user.phone);
    const url = `https://thepixelvest.com.ng/?ref=${cleanPhone}`;
    navigator.clipboard.writeText(url);
    showToast(
      "Referral Link Copied! You earn ₦50 when your friend funds & plays!",
      "success"
    );
  };

  const sectorNodes = useMemo(() => {
    const start = (currentSector - 1) * NODES_PER_SECTOR + 1;
    return Array.from({ length: NODES_PER_SECTOR }, (_, i) => start + i);
  }, [currentSector]);

  const startNodeNum = (currentSector - 1) * NODES_PER_SECTOR + 1;
  const endNodeNum = currentSector * NODES_PER_SECTOR;

  // ============================================================================
  // 12. RENDER EXACT UI MATCHING SCREENSHOT (`thepixelvestlive.vercel.app`)
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 select-none">
      {/* Floating Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-2xl border max-w-xs w-[92%] text-center transition-all ${
            toast.type === "error"
              ? "bg-rose-950/95 border-rose-500 text-rose-200"
              : toast.type === "success"
              ? "bg-emerald-500 border-emerald-300 text-black"
              : "bg-zinc-900 border-amber-400 text-amber-300"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Centered Mobile-First Board Container */}
      <div className="max-w-md mx-auto px-3.5 pt-3">
        {/* 1. TOP GREEN PAYOUT TICKER BAR */}
        <div className="w-full bg-[#071f14] border border-emerald-500/40 rounded-xl px-3 py-2.5 mb-3 text-center shadow-md">
          <p className="text-amber-400 font-bold text-xs sm:text-sm leading-snug">
            {LIVE_TICKER_MESSAGES[tickerIndex]}
          </p>
        </div>

        {/* 2. HEADER ROW: LOGO + ▲ THE PIXEL VEST + APK INSTALL BUTTON */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <img
              src="/icon.png"
              alt="Logo"
              className="w-7 h-7 rounded-md object-contain bg-amber-500/10 border border-amber-400/40 p-0.5"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-400 flex items-center gap-1.5">
              <span className="text-amber-400 text-lg">▲</span> THE PIXEL VEST
            </h1>
          </div>

          <button
            onClick={handleInstallApp}
            className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg shrink-0 transition"
          >
            📲 Install App
          </button>
        </div>

        {/* 3. SUBTITLE */}
        <p className="text-zinc-400 text-xs sm:text-sm mb-3 leading-snug">
          1,000,000 Nodes • ₦22,000,000 Prize Vault • Tap a Golden Node (₦100)
        </p>

        {/* 4. TWO WALLET BALANCES SIDE-BY-SIDE (MAIN WALLET & PLAY BONUS) */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div className="bg-[#081c15] border border-emerald-500/40 rounded-xl p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              MAIN WALLET
            </p>
            <p className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">
              ₦{getMainBalance(user).toLocaleString()}
            </p>
          </div>

          <div className="bg-[#1f1608] border border-amber-500/40 rounded-xl p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-200/80">
              PLAY BONUS
            </p>
            <p className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">
              ₦{getBonusBalance(user).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 5. ACTION BUTTONS (+ FUND / CASH OUT, REFER, LOGOUT / LOGIN) */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            onClick={() => {
              if (!user) {
                setShowAuthModal(true);
              } else {
                setWalletTab("fund");
                setShowWalletModal(true);
              }
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2.5 px-4 rounded-xl text-xs sm:text-sm transition shadow-md"
          >
            + FUND / CASH OUT
          </button>

          <button
            onClick={copyReferralLink}
            className="bg-[#1f1608] hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition"
          >
            Refer (+₦50)
          </button>

          {user ? (
            <button
              onClick={() => {
                localStorage.removeItem("pixelvest_active_phone");
                setUser(null);
                showToast("Logged out.", "info");
              }}
              className="bg-[#2a1215] hover:bg-[#3b181c] text-rose-300 border border-rose-500/30 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
              className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition"
            >
              Login
            </button>
          )}
        </div>

        <hr className="border-zinc-800/80 my-3" />

        {/* 6. AVAILABLE & SOLD NODE LEGEND */}
        <div className="space-y-1.5 mb-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-amber-300 to-amber-600 inline-block border border-amber-200" />
            <span className="text-white font-semibold">
              Available Node (₦100)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-zinc-900 border border-zinc-700 inline-block" />
            <span className="text-zinc-400">
              Sold Node (Darkened • Logo Still Visible)
            </span>
          </div>
        </div>

        {/* 7. NODE SEARCH INPUT + GO + REFRESH LIVE BOARD */}
        <div className="flex items-center gap-2 mb-2.5">
          <input
            type="number"
            min={1}
            max={1000000}
            value={searchNodeInput}
            onChange={(e) => setSearchNodeInput(e.target.value)}
            placeholder="500052"
            className="flex-1 bg-[#111318] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleJumpToNode}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-2 rounded-xl text-sm transition"
          >
            Go
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            onClick={() => fetchSectorBoardData(currentSector)}
            className="bg-[#111318] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition"
          >
            ↻ {boardLoading ? "Refreshing..." : "Refresh Live Board"}
          </button>

          {isAdminUnlocked && (
            <button
              onClick={() => setShowAdminModal(true)}
              className="bg-amber-500 text-black font-black text-xs px-3 py-2 rounded-xl"
            >
              ⚙️ Edit Nodes
            </button>
          )}
        </div>

        {/* 8. TOP GOOGLE ADSENSE BANNER SPACE */}
        <AdSenseBanner slotId="9204985294" label="SPONSORED BANNER AD" />

        {/* 9. SECTOR INDICATOR & PAGINATION CONTROLS */}
        <div className="mb-3">
          <p className="text-xs sm:text-sm text-zinc-400 mb-2">
            <span className="text-amber-400 font-bold">
              Viewing Sector #{currentSector.toLocaleString()} of{" "}
              {TOTAL_SECTORS.toLocaleString()}
            </span>{" "}
            • Nodes #{startNodeNum.toLocaleString()} – #
            {endNodeNum.toLocaleString()}
          </p>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => changeSector(currentSector - 1)}
              disabled={currentSector <= 1}
              className="bg-[#111318] hover:bg-zinc-800 disabled:opacity-40 border border-zinc-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs leading-tight text-center min-w-[78px]"
            >
              ← Prev
              <br />
              100
            </button>

            <div className="flex items-center gap-1.5 flex-1 justify-center">
              <input
                type="number"
                min={1}
                max={TOTAL_SECTORS}
                value={sectorInput}
                onChange={(e) => setSectorInput(e.target.value)}
                className="w-20 bg-[#111318] border border-zinc-700 rounded-xl px-2 py-2 text-center text-xs font-bold text-white"
              />
              <button
                onClick={() => {
                  const s = parseInt(sectorInput, 10);
                  if (!isNaN(s)) changeSector(s);
                }}
                className="bg-[#1f1608] border border-amber-500/40 text-amber-400 font-bold px-3 py-2 rounded-xl text-xs"
              >
                Sector
              </button>
            </div>

            <button
              onClick={() => changeSector(currentSector + 1)}
              disabled={currentSector >= TOTAL_SECTORS}
              className="bg-[#111318] hover:bg-zinc-800 disabled:opacity-40 border border-zinc-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs leading-tight text-center min-w-[78px]"
            >
              Next 100
              <br />→
            </button>
          </div>
        </div>

        {/* 10. EXACT 3-COLUMN GOLDEN DIAMOND GRID */}
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          {sectorNodes.map((nodeId) => {
            const soldInfo = soldNodesMap[nodeId];
            const isSold = Boolean(soldInfo?.is_sold);
            const override = nodeOverridesMap[nodeId];
            const displayBrand = override?.brand_name || soldInfo?.brand_name;
            const displayLogo = override?.logo_url || soldInfo?.logo_url;

            return (
              <button
                key={nodeId}
                onClick={() => setSelectedNode(nodeId)}
                className={`relative aspect-square rounded-2xl p-2.5 flex flex-col justify-between items-center text-left transition transform active:scale-95 ${
                  isSold
                    ? "bg-[#111317] border border-zinc-800 opacity-80"
                    : "bg-gradient-to-b from-[#fcd34d] via-[#f59e0b] to-[#d97706] border border-amber-200 shadow-md shadow-amber-500/10"
                }`}
              >
                {/* Top-Left Node Number (#500001) */}
                <div className="w-full flex justify-between items-start gap-1">
                  <span
                    className={`text-[11px] font-black tracking-tight ${
                      isSold ? "text-zinc-400" : "text-black"
                    }`}
                  >
                    #{nodeId}
                  </span>
                  {displayBrand && (
                    <span
                      className={`text-[8px] font-extrabold px-1 py-0.5 rounded truncate max-w-[52px] ${
                        isSold
                          ? "bg-zinc-800 text-amber-300"
                          : "bg-black/25 text-white"
                      }`}
                    >
                      {displayBrand}
                    </span>
                  )}
                </div>

                {/* Center Custom Picture OR Diamond Icon (💎) */}
                <div className="my-auto flex items-center justify-center">
                  {displayLogo ? (
                    <img
                      src={displayLogo}
                      alt={displayBrand || `Node #${nodeId}`}
                      className="w-10 h-10 rounded-lg object-contain bg-white/95 p-0.5 shadow-md"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl select-none drop-shadow">
                      💎
                    </span>
                  )}
                </div>

                {/* Bottom Price (₦100) or SOLD Tag */}
                <div className="w-full text-center">
                  <span
                    className={`text-xs font-extrabold ${
                      isSold ? "text-zinc-500" : "text-black"
                    }`}
                  >
                    {isSold ? "SOLD" : "₦100"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 11. BOTTOM GOOGLE ADSENSE BANNER SPACE */}
        <AdSenseBanner slotId="9204985295" label="SPONSORED PARTNER AD" />

        {/* 12. SEO & GOOGLE ADSENSE RICH CONTENT SECTION */}
        <section className="mt-6 bg-[#0b0d10] border border-zinc-800/80 rounded-2xl p-4 text-xs text-zinc-400 space-y-2 leading-relaxed">
          <h2 className="text-sm font-bold text-white">
            The Pixel Vest — Nigeria&apos;s 1,000,000 Digital Node Grid
          </h2>
          <p>
            Unlock exclusive digital nodes for ₦100, display custom brand logos,
            and discover instant cash vault bounties ranging from ₦10 up to
            ₦10,000 across 10,000 sectors.
          </p>
          <p>
            <strong className="text-amber-400">Anti-Cheat Referral Bonus:</strong>{" "}
            Invite friends with your unique referral link and receive{" "}
            <strong>₦50 Play Bonus</strong> as soon as your referred friend funds
            their Main Wallet and unlocks their first node!
          </p>
        </section>

        {/* 13. INDEPENDENT STUDIO FOOTER (NO O.G. AFRICA) + ADMIN STUDIO BUTTON */}
        <footer className="mt-8 pt-6 border-t border-zinc-900 text-center text-xs text-zinc-500 space-y-2">
          <p className="font-semibold text-zinc-400">
            © {new Date().getFullYear()} The Pixel Vest • Powered by PixelVest
            Digital Studios Ltd
          </p>
          <p>
            Support:{" "}
            <a
              href="mailto:adminpixelvest@gmail.com"
              className="text-emerald-400 underline"
            >
              adminpixelvest@gmail.com
            </a>
          </p>
          <div className="flex justify-center items-center gap-4 pt-1 text-[11px] text-zinc-400">
            <button
              onClick={() => setLegalModal("terms")}
              className="hover:text-white underline"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setLegalModal("privacy")}
              className="hover:text-white underline"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => {
                handleAdminLoadNode(String(selectedNode || startNodeNum));
                setShowAdminModal(true);
              }}
              className="text-zinc-600 hover:text-amber-400 underline"
            >
              Admin Studio
            </button>
          </div>
        </footer>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: UNLOCK NODE MODAL (+ DIRECT ADMIN EDIT BUTTON IF UNLOCKED) */}
      {/* ==================================================================== */}
      {selectedNode !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-700 rounded-2xl max-w-sm w-full p-5 text-center space-y-4">
            {(() => {
              const soldInfo = soldNodesMap[selectedNode];
              const isSold = Boolean(soldInfo?.is_sold);
              const override = nodeOverridesMap[selectedNode];
              const displayBrand =
                override?.brand_name ||
                soldInfo?.brand_name ||
                "Golden Vault Node";
              const displayLogo = override?.logo_url || soldInfo?.logo_url;

              return (
                <>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center overflow-hidden">
                    {displayLogo ? (
                      <img
                        src={displayLogo}
                        alt={displayBrand}
                        className="w-14 h-14 object-contain rounded-xl bg-white p-1"
                      />
                    ) : (
                      <span className="text-3xl">💎</span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">
                      Node #{selectedNode.toLocaleString()}
                    </h3>
                    <p className="text-xs text-amber-400 font-bold mt-0.5">
                      {displayBrand}
                    </p>
                  </div>

                  {isSold ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 space-y-1">
                      <p className="font-bold text-rose-400">
                        Node Already Unlocked
                      </p>
                      <p>Claimed by: {soldInfo?.owner_name || "Player"}</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-400">
                        Tap below to unlock Node #{selectedNode} for{" "}
                        <strong>₦100</strong> and reveal its instant cash gift!
                      </p>

                      {/* Choose Wallet to Pay From */}
                      <div className="grid grid-cols-2 gap-2 text-left">
                        <button
                          type="button"
                          onClick={() => setWalletSource("main")}
                          className={`p-2.5 rounded-xl border text-xs ${
                            walletSource === "main"
                              ? "bg-emerald-500/20 border-emerald-400 text-white"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400"
                          }`}
                        >
                          <p className="font-bold">MAIN WALLET</p>
                          <p className="text-emerald-400 font-black">
                            ₦{getMainBalance(user).toLocaleString()}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setWalletSource("bonus")}
                          className={`p-2.5 rounded-xl border text-xs ${
                            walletSource === "bonus"
                              ? "bg-amber-500/20 border-amber-400 text-white"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400"
                          }`}
                        >
                          <p className="font-bold">PLAY BONUS</p>
                          <p className="text-amber-400 font-black">
                            ₦{getBonusBalance(user).toLocaleString()}
                          </p>
                        </button>
                      </div>

                      <button
                        onClick={handleUnlockNode}
                        disabled={unlockLoading}
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black py-3 rounded-xl text-sm shadow-lg"
                      >
                        {unlockLoading
                          ? "Unlocking Vault..."
                          : "UNLOCK NODE NOW (₦100)"}
                      </button>
                    </>
                  )}

                  {isAdminUnlocked && (
                    <button
                      onClick={() => {
                        const target = String(selectedNode);
                        setSelectedNode(null);
                        handleAdminLoadNode(target);
                        setShowAdminModal(true);
                      }}
                      className="w-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold py-2 rounded-xl text-xs"
                    >
                      ⚙️ Admin: Edit This Node (#{selectedNode})
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedNode(null)}
                    className="w-full bg-zinc-800 text-zinc-300 font-bold py-2.5 rounded-xl text-xs"
                  >
                    Close
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: REWARD RESULT POPUP (WITH ALL 250 NIGERIAN ROASTS & QUOTES) */}
      {/* ==================================================================== */}
      {rewardResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-amber-400/50 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            {rewardResult.logoUrl ? (
              <img
                src={rewardResult.logoUrl}
                alt={rewardResult.brandName}
                className="w-16 h-16 mx-auto rounded-xl object-contain bg-white p-1"
              />
            ) : (
              <div className="text-5xl">
                {rewardResult.amount > 0 ? "🎉" : "😂"}
              </div>
            )}

            <h3 className="text-xl font-black text-amber-400">
              {rewardResult.amount > 0
                ? `Node #${rewardResult.nodeId} Jackpot!`
                : `Node #${rewardResult.nodeId} Empty!`}
            </h3>
            <p className="text-xs text-zinc-400">{rewardResult.brandName}</p>

            {rewardResult.amount > 0 ? (
              <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-4">
                <p className="text-xs text-emerald-300 uppercase font-bold">
                  Instant Gift Added to Main Wallet!
                </p>
                <p className="text-3xl font-black text-emerald-400 mt-1">
                  +₦{rewardResult.amount.toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="bg-[#1a1215] border border-rose-500/40 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-extrabold text-rose-400">
                  <span>⚡ Naija Street Cruise</span>
                  <span>
                    Roast #{rewardResult.roastIndex + 1} of{" "}
                    {EMPTY_NODE_ROASTS_AND_QUOTES.length}
                  </span>
                </div>
                <p className="text-sm font-bold text-amber-200 leading-relaxed">
                  &ldquo;
                  {EMPTY_NODE_ROASTS_AND_QUOTES[rewardResult.roastIndex]}
                  &rdquo;
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setRewardResult((prev) =>
                      prev
                        ? {
                            ...prev,
                            roastIndex:
                              (prev.roastIndex + 1) %
                              EMPTY_NODE_ROASTS_AND_QUOTES.length,
                          }
                        : null
                    )
                  }
                  className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg font-bold transition"
                >
                  Next Roast / Quote 😂 →
                </button>
              </div>
            )}

            <button
              onClick={() => setRewardResult(null)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-sm transition"
            >
              {rewardResult.amount > 0
                ? "Claim & Continue Playing"
                : "No Gree! Tap Another Node 🔥"}
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: LOGIN & REGISTRATION MODAL                                  */}
      {/* ==================================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-700 rounded-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-white">
                {authMode === "login"
                  ? "Login to The Pixel Vest"
                  : "Create Player Account"}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-zinc-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`py-2 rounded-lg text-xs font-bold ${
                  authMode === "login"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`py-2 rounded-lg text-xs font-bold ${
                  authMode === "register"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08012345678"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              {authMode === "register" && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              {authMode === "register" && (
                <>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">
                      4-Digit Withdrawal PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="1234"
                      value={authPin}
                      onChange={(e) => setAuthPin(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">
                      Referrer Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="Friend's phone number"
                      value={authReferral}
                      onChange={(e) => setAuthReferral(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-sm"
              >
                {authLoading
                  ? "Connecting..."
                  : authMode === "login"
                  ? "LOGIN NOW"
                  : "CREATE ACCOUNT"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: WALLET (PAYSTACK DEPOSIT, BANK CASH OUT & REFERRAL CENTER)  */}
      {/* ==================================================================== */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-700 rounded-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-white">
                Wallet & Referral Center
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-zinc-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-zinc-900 p-1 rounded-xl">
              <button
                onClick={() => setWalletTab("fund")}
                className={`py-2 rounded-lg text-[11px] font-bold ${
                  walletTab === "fund"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400"
                }`}
              >
                Fund Wallet
              </button>
              <button
                onClick={() => setWalletTab("withdraw")}
                className={`py-2 rounded-lg text-[11px] font-bold ${
                  walletTab === "withdraw"
                    ? "bg-amber-400 text-black"
                    : "text-zinc-400"
                }`}
              >
                Cash Out
              </button>
              <button
                onClick={() => setWalletTab("referrals")}
                className={`py-2 rounded-lg text-[11px] font-bold ${
                  walletTab === "referrals"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400"
                }`}
              >
                Refer (+₦50)
              </button>
            </div>

            {walletTab === "fund" && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">
                  Instant Main Wallet deposit via Paystack (Card, Bank Transfer,
                  or USSD).
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {["200", "500", "1000", "5000"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFundAmount(preset)}
                      className={`py-2 rounded-lg text-xs font-bold border ${
                        fundAmount === preset
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      ₦{preset}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={100}
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  placeholder="Enter amount (₦)"
                />
                <button
                  onClick={handleFundWithPaystack}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-sm"
                >
                  PAY ₦{Number(fundAmount || 0).toLocaleString()} WITH PAYSTACK
                </button>
              </div>
            )}

            {walletTab === "withdraw" && (
              <form onSubmit={handleWithdrawSubmit} className="space-y-2.5">
                <div className="bg-zinc-900 p-2.5 rounded-xl text-[11px] text-zinc-400">
                  Withdrawable Main Wallet:{" "}
                  <strong className="text-emerald-400">
                    ₦{getMainBalance(user).toLocaleString()}
                  </strong>
                </div>
                <input
                  type="number"
                  required
                  placeholder="Amount to Withdraw (Min ₦500)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Bank Name (e.g. OPay, PalmPay, Stanbic, GTBank)"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="10-Digit Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Account Holder Name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="Your 4-Digit Withdrawal PIN"
                  value={withdrawPinInput}
                  onChange={(e) => setWithdrawPinInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black py-3 rounded-xl text-xs"
                >
                  {withdrawLoading
                    ? "Submitting..."
                    : "SUBMIT CASH OUT REQUEST"}
                </button>
              </form>
            )}

            {walletTab === "referrals" && (
              <div className="space-y-3 text-xs text-zinc-300">
                <div className="bg-[#1f1608] border border-amber-500/40 rounded-xl p-3">
                  <p className="text-amber-300 font-bold">
                    Your Play Bonus Balance: ₦
                    {getBonusBalance(user).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Earn <strong>₦50</strong> into your Play Bonus wallet every
                    time a friend registers with your link, funds their Main
                    Wallet, and unlocks their first node! (Self-referrals are
                    automatically blocked).
                  </p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 break-all font-mono text-[11px] text-emerald-400">
                  https://thepixelvest.com.ng/?ref=
                  {user ? normalizePhone(user.phone) : "YOUR_PHONE"}
                </div>
                <button
                  onClick={copyReferralLink}
                  className="w-full bg-emerald-500 text-black font-black py-3 rounded-xl text-xs"
                >
                  COPY MY REFERRAL LINK
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: ADMIN NODE EDITOR STUDIO (EDIT NAME, PICTURE & GIFT AMOUNT) */}
      {/* ==================================================================== */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-amber-500/50 rounded-2xl max-w-md w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-amber-400">
                ⚙️ Admin Node Editor Studio
              </h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-zinc-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {!isAdminUnlocked ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">
                  Enter your Admin Master Passcode to edit node names, upload
                  node pictures, and customize gift amounts (Default PIN:{" "}
                  <code className="text-amber-400">2026</code>):
                </p>
                <input
                  type="password"
                  placeholder="Enter Admin PIN"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
                <button
                  onClick={() => {
                    if (adminPinInput.trim() === ADMIN_MASTER_PIN) {
                      setIsAdminUnlocked(true);
                      handleAdminLoadNode(editNodeId);
                      showToast("Admin Studio Unlocked!", "success");
                    } else {
                      showToast("Invalid Admin PIN", "error");
                    }
                  }}
                  className="w-full bg-amber-400 text-black font-black py-3 rounded-xl text-sm"
                >
                  UNLOCK ADMIN STUDIO
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveNodeOverride} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    1. Select Node Number (1 – 1,000,000)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      max={1000000}
                      required
                      value={editNodeId}
                      onChange={(e) => handleAdminLoadNode(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                    <span className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-xs text-amber-400 flex items-center">
                      Default: ₦
                      {getExact12TierNodePrize(
                        Number(editNodeId) || 1
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    2. Node Name / Brand Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apple VIP Vault, MTN Gold, CEO Ogu"
                    value={editBrandName}
                    onChange={(e) => setEditBrandName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    3. Node Picture (Upload from Phone/PC or Paste Image Link)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-black mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Or paste image URL (https://...)"
                    value={editLogoUrl}
                    onChange={(e) => setEditLogoUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  {editLogoUrl && (
                    <div className="mt-2 flex items-center gap-3 bg-zinc-900 p-2 rounded-xl">
                      <img
                        src={editLogoUrl}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-contain bg-white p-0.5"
                      />
                      <button
                        type="button"
                        onClick={() => setEditLogoUrl("")}
                        className="text-xs text-rose-400 underline"
                      >
                        Remove Picture
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    4. Gift Amount Inside This Node (₦)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    placeholder="e.g. 5000, 1000, 100, 0"
                    value={editCustomPrize}
                    onChange={(e) => setEditCustomPrize(e.target.value)}
                    className="w-full bg-zinc-900 border border-amber-500/50 rounded-xl px-3 py-2 text-sm font-black text-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminSaving}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-sm shadow-lg"
                >
                  {adminSaving
                    ? "Saving Node..."
                    : `SAVE CHANGES TO NODE #${editNodeId}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 6: APK INSTALL GUIDE MODAL                                     */}
      {/* ==================================================================== */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-700 rounded-2xl max-w-sm w-full p-5 space-y-3 text-xs text-zinc-300">
            <h3 className="text-base font-black text-white">
              📲 Install The Pixel Vest App
            </h3>
            <p>Install the standalone app directly to your phone:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Android (Chrome):</strong> Tap the{" "}
                <strong>3 dots (⋮)</strong> at the top right and tap{" "}
                <strong>&quot;Install App&quot;</strong>.
              </li>
              <li>
                <strong>iPhone (Safari):</strong> Tap{" "}
                <strong>Share (↑)</strong> at the bottom and select{" "}
                <strong>&quot;Add to Home Screen&quot;</strong>.
              </li>
            </ul>
            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full bg-emerald-500 text-black font-black py-2.5 rounded-xl text-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 7: GOOGLE ADSENSE TERMS & PRIVACY POLICY MODAL                 */}
      {/* ==================================================================== */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-700 rounded-2xl max-w-md w-full p-5 space-y-3 text-xs text-zinc-300 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-white">
                {legalModal === "terms" ? "Terms of Service" : "Privacy Policy"}
              </h3>
              <button
                onClick={() => setLegalModal(null)}
                className="text-zinc-400 font-bold"
              >
                ✕
              </button>
            </div>
            {legalModal === "terms" ? (
              <p className="leading-relaxed">
                The Pixel Vest is operated by PixelVest Digital Studios Ltd.
                Participants must be 18+. Each digital node unlocks for ₦100.
                Referral bonuses (₦50) are credited to Play Bonus once a
                referred user funds their Main Wallet and unlocks their first
                node. Self-referrals and multi-account abuse are strictly
                prohibited.
              </p>
            ) : (
              <p className="leading-relaxed">
                PixelVest Digital Studios Ltd protects your data. We use
                Paystack for encrypted payment processing and Google AdSense to
                serve relevant advertisements. Contact adminpixelvest@gmail.com
                for support.
              </p>
            )}
            <button
              onClick={() => setLegalModal(null)}
              className="w-full bg-zinc-800 text-white font-bold py-2.5 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}