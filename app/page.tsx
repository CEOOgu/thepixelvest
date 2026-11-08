"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// 0. GLOBAL INTERCEPTOR: PAYSTACK IFRAME CLIPBOARD PERMISSION & APK INSTALL
// ============================================================================
if (typeof window !== "undefined") {
  // 1. Capture native Android WebAPK install prompt before React mounts
  window.addEventListener("beforeinstallprompt", (e: any) => {
    e.preventDefault();
    (window as any).__pvDeferredPrompt = e;
  });

  // 2. Intercept iframe creation so Paystack's checkout iframe ALWAYS gets
  // clipboard-write permission BEFORE it mounts into the DOM!
  const originalCreateElement = document.createElement.bind(document);
  if (!(window as any).__pvIframePatched) {
    (window as any).__pvIframePatched = true;
    document.createElement = function (tagName: string, options?: any): any {
      const el = originalCreateElement(tagName, options);
      if (tagName && tagName.toLowerCase() === "iframe") {
        el.setAttribute(
          "allow",
          "clipboard-read *; clipboard-write *; payment *"
        );
      }
      return el;
    };
  }

  // 3. Preload Paystack inline script immediately
  if (!document.getElementById("paystack-inline-js")) {
    const s = originalCreateElement("script");
    s.id = "paystack-inline-js";
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    document.head.appendChild(s);
  }
}

// ============================================================================
// 1. CONFIGURATION & INITIALIZATION
// ============================================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Hardcoded Live Paystack Public Key
const PAYSTACK_PUBLIC_KEY = "pk_live_4f604b2d9d9689f50eba439e704600844f7dfd01";

// Official Google AdSense Publisher & Ad Unit Slot IDs
const ADSENSE_CLIENT_ID = "ca-pub-9204985294084444";
const ADSENSE_UNIT_SLOT_ID = "3277719159";

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
  "Even cockroach no gree stay inside this node because of how empty e be! 🤣 Try Node beside am!",
  "Calm down boss, Rome wasn't built in one tap! 🏛️ Your ₦10,000 vault dey wait for front!",
  "Wait o, na who point this node give you? 😭 The person no wish you well at all! Pick your own lucky number!",
  "Nothing dey here my Chief! 😂 Na only pure water nylon and old receipt remain inside this vault.",
  "If patience was a person, e go tell you make you tap the node on your right right now! 👉💎",
  "Omo, this node empty pass landlord heart when rent don due! 😭 Run go another sector!",
  "You tap am with confidence, e reply you with silence 😂. Shake body tap another one!",
  "Hustle Quote: 'No be who first tap node dey win ₦10k, na who no give up!' 🏆",
  "Abeg shift! 😂 The spirit inside this box say e dey on break, check the neighbour!",
  "Wetin concern agbero with overload? Tap another node make Paystack know say you dey online! 💳",
  "This box na pure disguise! 🤣 Outside shining gold, inside na empty drum. Check the next gold!",
  "Don't cry my gee, even Dangote lose ₦100 before e make billions! 😂 Tap again!",
  "Your network slow small when you tap am, somebody else don carry the blessing pass! ⚡ Tap faster!",
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
  "Sapa dey outside dey do press-up waiting for you 😂. Tap another node lock door for am face!",
  "This vault na 419 edition—golden outside, dust inside! 🤣 Try another box!",
  "Even AI no fit explain why you leave all the winning nodes go tap this empty one! 🤖😂",
  "Hustle Quote: 'Today's empty tap is tomorrow's screenshot testimony!' 📸💵",
  "E pain me for your body o! 😭 The way you take wait make the vault load... na breeze!",
  "Try shout 'Obleeee!' before you tap the next node, e dey work magic! 🥂😂",
  "This node na ghost town! 👻 Nobody live here since 1960. Pack load go next sector!",
  "Your hand hot, but this node cold pass mortuary! 🥶 Warm am up for the next box!",
  "Wait first, you don pay tithe this month? 😂 Because the way this node dodge you ehn!",
  "Quote: 'Fortune hides in the sector you haven't checked yet!' 🔑",
  "Na only 'Better luck next time' written in Chinese full inside here! 🉐🤣",
  "Even CBN governor open this particular node, e go bow for how dry e be! 🏦😂",
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
  "Omo, this node dry pass lecturing without microphone! 🎤😭",
  "You tap am like person wey dey fear electric shock 😂. Hold am firm next time!",
  "Na only air conditioning dey blow inside this vault, zero cash! ❄️🤣",
  "Try jump go Sector #777 or Sector #2026, leave this dry land alone! 🏃‍♂️",
  "Even if you bring Juju come this node, kobo no go comot because nothing was put there! 😂🧿",
  "Street Quote: 'No gree for empty box—the grid owes you a comeback!' 🔥",
  "See as the node shine for outside like Dubai gold, inside na Mushin market! 😂",
  "Your ₦100 just do philanthropic donation to the grid! 🤝 Now go collect your return!",
  "Wait o, you eat beans before you tap this node? 😂 Because the luck just spoiled!",
  "Quote: 'Persistence turns ₦100 into ₦10,000 when you least expect it!' 💎",
  "Nothing dey inside my boss! Even thief open this box, e go drop transport money for you out of pity! 🤣",
  "This node na 'Seen without reply'! 💬💔 Move on to a node that texts back with cash!",
  "Your thumb slip ABI? 😂 Because I know say no be this empty box you plan to tap!",
  "Omo! Even fuel scarcity no scarce reach the money inside this node! ⛽😭",
  "Hustle Wisdom: 'Don't judge the whole 1-million grid by one stubborn node!' 🌍",
  "Na wa! This node just serve you cold eba without soup! 🥣😂",
  "Try refer one friend collect ₦50 Play Bonus make you use am scatter this sector! 🤝💰",
  "Even alarm clock no fit wake the money inside this node because e no exist! ⏰🤣",
  "Quote: 'Every champion has a history of missed shots before the winning buzzer!' 🏀",
  "Ah! You tap the exact node where Sapa keep hin spare key! 🗝️😭 Run o!",
  "No worry, your alert dey traffic—tap the next node clear road for am! 🚦💵",
  "This box empty like pot wey last born finish washing! 🍲😂",
  "Street Quote: 'He who fears losing ₦100 will never unlock ₦10,000!' 🦁",
  "You dey look the screen like say if you frown face, the ₦0 go turn to ₦5,000! 😠🤣",
  "Nothing dey inside o! Na only old calendar from 1998 we see inside this vault! 📅",
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
  "Nothing dey here Chief! Na only dust and old newspaper from 2012! 📰🤣",
  "Try type your mother's birth year inside the node search bar—mother's prayer dey work! 🙏💎",
  "This vault dry like roasted corn wey dem forget on top charcoal! 🌽😭",
  "Street Quote: 'No let ₦100 loss make you miss ₦10,000 gain!' 💰",
  "You tap this node with two minds—next time tap am with full chest! Burst out! 💪😂",
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
  "Omo, this box empty pass bachelor fridge on Monday morning! 🧊😭",
  "Tap the next node fast before the person for Lagos tap am collect your money! 🏃‍♂️💨",
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
  "Final Boss Roast #250: Otilo! 😂 Since you don read reach here, the next node you tap get special anointing—go unlock am now! ⚡💎",
];

// ============================================================================
// 3. EXACT 12-TIER PRIZE DISTRIBUTION ENGINE (1,000,000 NODES BIJECTION)
// ============================================================================
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
// 4. STRICT HORIZONTAL SMALL GOOGLE ADSENSE BANNER (50PX HEIGHT LOCKED)
// ============================================================================
function AdSenseBanner({
  slotId = ADSENSE_UNIT_SLOT_ID,
  label = "SPONSORED BANNER AD",
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
    <div className="pv-ad-box">
      <div className="pv-ad-label">{label}</div>
      <div className="pv-ad-slot">
        <span className="pv-ad-placeholder">
          ⚡ Google AdSense • The Pixel Vest Partner Network
        </span>
        {/* Pixel Vest Official Horizontal 320x50 Unit (Cannot Expand Vertically) */}
        <ins
          className="adsbygoogle"
          style={{
            display: "inline-block",
            width: "100%",
            maxWidth: "380px",
            height: "50px",
            maxHeight: "50px",
          }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slotId}
        />
      </div>
    </div>
  );
}

// ============================================================================
// 5. MAIN APPLICATION COMPONENT
// ============================================================================
export default function ThePixelVestMasterApp() {
  const [currentSector, setCurrentSector] = useState<number>(1);
  const [sectorInput, setSectorInput] = useState<string>("1");
  const [searchNodeInput, setSearchNodeInput] = useState<string>("1");

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

  const [soldNodesMap, setSoldNodesMap] = useState<Record<number, any>>({});
  const [nodeOverridesMap, setNodeOverridesMap] = useState<Record<number, any>>(
    {}
  );
  const [boardLoading, setBoardLoading] = useState<boolean>(false);

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

  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [walletTab, setWalletTab] = useState<"fund" | "withdraw" | "referrals">(
    "fund"
  );
  const [fundAmount, setFundAmount] = useState<string>("500");
  const [paystackConnecting, setPaystackConnecting] = useState<boolean>(false);
  const [pendingTx, setPendingTx] = useState<{
    ref: string;
    amount: number;
    phone: string;
    time: number;
  } | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [withdrawPinInput, setWithdrawPinInput] = useState<string>("");
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);

  // Admin Studio States (Node Editor + Instant Player Wallet Credit)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<"node" | "wallet">("node");
  const [adminPinInput, setAdminPinInput] = useState<string>("");
  const [adminCreditPhone, setAdminCreditPhone] = useState<string>("");
  const [adminCreditAmount, setAdminCreditAmount] = useState<string>("500");
  const [adminCreditType, setAdminCreditType] = useState<"main" | "bonus">(
    "main"
  );
  const [adminCrediting, setAdminCrediting] = useState<boolean>(false);

  const [editNodeId, setEditNodeId] = useState<string>("1");
  const [editBrandName, setEditBrandName] = useState<string>("");
  const [editLogoUrl, setEditLogoUrl] = useState<string>("");
  const [editCustomPrize, setEditCustomPrize] = useState<string>("");
  const [editNodeIsSold, setEditNodeIsSold] = useState<boolean>(false);
  const [adminSaving, setAdminSaving] = useState<boolean>(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(
    null
  );

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
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_TICKER_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Device Fingerprint
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

    // 2. Ensure Manifest & Service Worker are registered for native APK install
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest.json";
      document.head.appendChild(link);
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if ((window as any).__pvDeferredPrompt) {
      setDeferredPrompt((window as any).__pvDeferredPrompt);
    }

    const onBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      (window as any).__pvDeferredPrompt = e;
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    // 3. Grant clipboard-write permission to all iframes
    const observer = new MutationObserver(() => {
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        if (
          iframe.getAttribute("allow") !==
          "clipboard-read *; clipboard-write *; payment *"
        ) {
          iframe.setAttribute(
            "allow",
            "clipboard-read *; clipboard-write *; payment *"
          );
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 4. Referral Param (?ref=...) or Admin URL Param (?admin=1)
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

    if (params.get("admin") === "1" || window.location.hash === "#admin") {
      setShowAdminModal(true);
    }

    // 5. Restore Pending Paystack Tx if any
    const savedPending = localStorage.getItem("pv_active_pending_tx");
    if (savedPending) {
      try {
        setPendingTx(JSON.parse(savedPending));
      } catch (e) {}
    }

    // 6. Restore Local Sold Nodes + Local Overrides + User Session
    const localSold = localStorage.getItem("pixelvest_sold_nodes");
    if (localSold) {
      try {
        setSoldNodesMap(JSON.parse(localSold));
      } catch (e) {}
    }

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

    fetchSectorBoardData(1);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      observer.disconnect();
    };
  }, []);

  const getMainBalance = (u: any): number => {
    if (!u) return 0;
    return Number(u.wallet_balance ?? u.balance ?? 0);
  };

  const getBonusBalance = (u: any): number => {
    if (!u) return 0;
    return Number(u.bonus_balance ?? u.play_bonus ?? 0);
  };

  // ============================================================================
  // SAFE SESSION FETCH (NEVER OVERWRITES AN UNSYNCED DEPOSIT)
  // ============================================================================
  const fetchUserSession = async (phone: string) => {
    const cleanPhone = normalizePhone(phone);
    const cachedStr = localStorage.getItem(`pv_user_${cleanPhone}`);
    const cachedUser = cachedStr ? JSON.parse(cachedStr) : null;
    const unsyncedAdd = Number(
      localStorage.getItem(`pv_unsynced_add_${cleanPhone}`) || "0"
    );

    if (!supabase) {
      if (cachedUser) setUser(cachedUser);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (data && !error) {
        let finalUser = { ...data };

        if (unsyncedAdd > 0) {
          const syncedMain = Number(data.wallet_balance ?? 0) + unsyncedAdd;
          finalUser.wallet_balance = syncedMain;
          const { error: syncErr } = await supabase
            .from("users")
            .update({ wallet_balance: syncedMain })
            .eq("phone", cleanPhone);
          if (!syncErr) {
            localStorage.removeItem(`pv_unsynced_add_${cleanPhone}`);
          }
        } else if (
          cachedUser &&
          Number(cachedUser.wallet_balance ?? 0) >
            Number(data.wallet_balance ?? 0)
        ) {
          const higherBal = Number(cachedUser.wallet_balance);
          finalUser.wallet_balance = higherBal;
          await supabase
            .from("users")
            .update({ wallet_balance: higherBal })
            .eq("phone", cleanPhone);
        }

        setUser(finalUser);
        localStorage.setItem("pixelvest_active_phone", cleanPhone);
        localStorage.setItem(
          `pv_user_${cleanPhone}`,
          JSON.stringify(finalUser)
        );
      } else if (cachedUser) {
        setUser(cachedUser);
      }
    } catch (e) {
      if (cachedUser) setUser(cachedUser);
    }
  };

  const updateUserRecord = async (
    phone: string,
    updates: Record<string, any>
  ) => {
    const cleanPhone = normalizePhone(phone);
    const cachedStr = localStorage.getItem(`pv_user_${cleanPhone}`);
    const baseUser = user || (cachedStr ? JSON.parse(cachedStr) : {});
    const mergedUser = { ...baseUser, ...updates };

    if (!user || normalizePhone(user.phone) === cleanPhone) {
      setUser(mergedUser);
    }
    localStorage.setItem(`pv_user_${cleanPhone}`, JSON.stringify(mergedUser));

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

  // ============================================================================
  // ZERO-LOSS PAYSTACK DEPOSIT CREDITING ENGINE (IDEMPOTENT + AUTO-RETRY)
  // ============================================================================
  const creditWalletFromPaystack = async (
    rawPhone: string,
    amountNaira: number,
    txRef: string
  ) => {
    const cleanPhone = normalizePhone(rawPhone);

    const creditedRefsStr = localStorage.getItem("pv_credited_tx_refs") || "[]";
    let creditedRefs: string[] = [];
    try {
      creditedRefs = JSON.parse(creditedRefsStr);
    } catch (e) {
      creditedRefs = [];
    }

    if (creditedRefs.includes(txRef)) {
      showToast("Deposit already credited to your Main Wallet!", "success");
      setShowWalletModal(false);
      return;
    }

    creditedRefs.push(txRef);
    localStorage.setItem("pv_credited_tx_refs", JSON.stringify(creditedRefs));
    localStorage.removeItem("pv_active_pending_tx");
    setPendingTx(null);

    const cachedStr = localStorage.getItem(`pv_user_${cleanPhone}`);
    const currentObj =
      user && normalizePhone(user.phone) === cleanPhone
        ? user
        : cachedStr
        ? JSON.parse(cachedStr)
        : { phone: cleanPhone, wallet_balance: 0, bonus_balance: 0 };

    const optimisticNewBalance =
      Number(currentObj.wallet_balance ?? 0) + amountNaira;
    const updatedLocalUser = {
      ...currentObj,
      wallet_balance: optimisticNewBalance,
    };

    setUser(updatedLocalUser);
    localStorage.setItem(
      `pv_user_${cleanPhone}`,
      JSON.stringify(updatedLocalUser)
    );
    setShowWalletModal(false);
    showToast(
      `✅ ₦${amountNaira.toLocaleString()} credited to your Main Wallet!`,
      "success"
    );

    const prevUnsynced = Number(
      localStorage.getItem(`pv_unsynced_add_${cleanPhone}`) || "0"
    );
    localStorage.setItem(
      `pv_unsynced_add_${cleanPhone}`,
      String(prevUnsynced + amountNaira)
    );

    if (supabase) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const { data: freshRow } = await supabase
            .from("users")
            .select("wallet_balance")
            .eq("phone", cleanPhone)
            .maybeSingle();

          const dbBase =
            freshRow && freshRow.wallet_balance !== undefined
              ? Number(freshRow.wallet_balance)
              : Number(currentObj.wallet_balance ?? 0);

          const finalBalance = Math.max(
            optimisticNewBalance,
            dbBase + amountNaira
          );

          const { error: upErr } = await supabase
            .from("users")
            .update({ wallet_balance: finalBalance })
            .eq("phone", cleanPhone);

          if (!upErr) {
            localStorage.removeItem(`pv_unsynced_add_${cleanPhone}`);
            const syncedObj = {
              ...updatedLocalUser,
              wallet_balance: finalBalance,
            };
            setUser(syncedObj);
            localStorage.setItem(
              `pv_user_${cleanPhone}`,
              JSON.stringify(syncedObj)
            );

            await supabase.from("transactions").insert([
              {
                user_phone: cleanPhone,
                type: "deposit",
                amount: amountNaira,
                status: "completed",
                reference: txRef,
              },
            ]);
            break;
          }
        } catch (err) {
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    }
  };

  // ============================================================================
  // BULLETPROOF 3-LAYER DATABASE + LOCAL SOLD NODE & OVERRIDE SYNC
  // ============================================================================
  const persistNodeLockToDatabase = async (
    nodeId: number,
    soldRecord: Record<string, any>
  ) => {
    // Layer 1: LocalStorage immediate persistence
    setSoldNodesMap((prev) => {
      const next = { ...prev, [nodeId]: soldRecord };
      localStorage.setItem("pixelvest_sold_nodes", JSON.stringify(next));
      return next;
    });

    if (!supabase) return;

    // Layer 2: Save to `grid_nodes` with progressive column fallback so missing columns never block locking
    try {
      const { error: err1 } = await supabase
        .from("grid_nodes")
        .upsert([soldRecord], { onConflict: "node_id" });

      if (err1) {
        const minimalSold = {
          node_id: nodeId,
          owner_phone: soldRecord.owner_phone,
          is_sold: Boolean(soldRecord.is_sold),
          prize_won: soldRecord.prize_won ?? 0,
        };
        const { error: err2 } = await supabase
          .from("grid_nodes")
          .upsert([minimalSold], { onConflict: "node_id" });

        if (err2) {
          // Try update first, then insert if row doesn't exist
          const { data: existingRow } = await supabase
            .from("grid_nodes")
            .select("node_id")
            .eq("node_id", nodeId)
            .maybeSingle();

          if (existingRow) {
            await supabase
              .from("grid_nodes")
              .update({ is_sold: Boolean(soldRecord.is_sold) })
              .eq("node_id", nodeId);
          } else {
            await supabase
              .from("grid_nodes")
              .insert([{ node_id: nodeId, is_sold: Boolean(soldRecord.is_sold) }]);
          }
        }
      }
    } catch (e) {}
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

      if (soldRows && soldRows.length > 0) {
        setSoldNodesMap((prev) => {
          const next = { ...prev };
          soldRows.forEach((row: any) => {
            next[Number(row.node_id)] = {
              ...row,
              is_sold: row.is_sold !== undefined ? Boolean(row.is_sold) : true,
            };
          });
          localStorage.setItem("pixelvest_sold_nodes", JSON.stringify(next));
          return next;
        });
      }

      const { data: overrideRows } = await supabase
        .from("node_overrides")
        .select("*")
        .gte("node_id", startNode)
        .lte("node_id", endNode);

      if (overrideRows && overrideRows.length > 0) {
        setNodeOverridesMap((prev) => {
          const next = { ...prev };
          overrideRows.forEach((row: any) => {
            next[Number(row.node_id)] = row;
          });
          localStorage.setItem(
            "pixelvest_node_overrides",
            JSON.stringify(next)
          );
          return next;
        });
      }
    } catch (err) {
      console.error("Sector fetch error:", err);
    } finally {
      setBoardLoading(false);
    }
  };

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
            localStorage.setItem(
              `pv_user_${cleanPhone}`,
              JSON.stringify(dbUser)
            );
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
  // UNLOCK NODE & LOCK IT PERMANENTLY IN DATABASE + LOCAL CACHE
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
      showToast("This Node has already been unlocked and locked!", "error");
      return;
    }

    setUnlockLoading(true);

    try {
      // Double-check live database before unlocking so two players can't tap the same node
      if (supabase) {
        const { data: liveCheck } = await supabase
          .from("grid_nodes")
          .select("*")
          .eq("node_id", selectedNode)
          .maybeSingle();

        if (liveCheck && liveCheck.is_sold) {
          setSoldNodesMap((prev) => ({
            ...prev,
            [selectedNode]: liveCheck,
          }));
          showToast(
            "Someone else just unlocked this Node! Pick another one.",
            "error"
          );
          setUnlockLoading(false);
          return;
        }
      }

      const customOverride = nodeOverridesMap[selectedNode];
      const hasCustomPrize =
        customOverride &&
        customOverride.custom_prize !== undefined &&
        customOverride.custom_prize !== null &&
        customOverride.custom_prize !== "";

      const prizeWon = hasCustomPrize
        ? Number(customOverride.custom_prize)
        : getExact12TierNodePrize(selectedNode);

      const updatedMain =
        walletSource === "main"
          ? mainBal - NODE_PRICE + prizeWon
          : mainBal + prizeWon;
      const updatedBonus =
        walletSource === "bonus" ? bonusBal - NODE_PRICE : bonusBal;

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

      // Lock permanently in localStorage + Supabase database
      await persistNodeLockToDatabase(selectedNode, soldRecord);

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
  // BULLETPROOF PAYSTACK LIVE CHECKOUT (CREDITS EVEN IF BANK TRANSFER STUCK)
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

    const openPaystackModalNow = () => {
      setPaystackConnecting(false);
      const PaystackPop = (window as any).PaystackPop;
      if (!PaystackPop) {
        showToast(
          "Could not load Paystack. Please check your internet connection.",
          "error"
        );
        return;
      }

      const cleanPhone = normalizePhone(user.phone);
      const txRef = `PV_${cleanPhone}_${Date.now()}`;

      const newPending = {
        ref: txRef,
        amount: amountNaira,
        phone: cleanPhone,
        time: Date.now(),
      };
      setPendingTx(newPending);
      localStorage.setItem("pv_active_pending_tx", JSON.stringify(newPending));

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
          const finalRef = response?.reference || txRef;
          creditWalletFromPaystack(cleanPhone, amountNaira, finalRef);
        },
        onBankTransferConfirmationPending: function (response: any) {
          const finalRef = response?.reference || txRef;
          creditWalletFromPaystack(cleanPhone, amountNaira, finalRef);
        },
        onClose: function () {
          fetchUserSession(cleanPhone);
          showToast(
            "If you completed a transfer, tap 'Sync Wallet' below.",
            "info"
          );
        },
      });

      handler.openIframe();
    };

    if ((window as any).PaystackPop) {
      openPaystackModalNow();
      return;
    }

    setPaystackConnecting(true);
    const existingScript = document.getElementById("paystack-inline-js");
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = "paystack-inline-js";
    script.src = `https://js.paystack.co/v1/inline.js?v=${Date.now()}`;
    script.async = true;
    script.onload = () => {
      openPaystackModalNow();
    };
    script.onerror = () => {
      setPaystackConnecting(false);
      showToast(
        "Network blocked Paystack. Please open www.thepixelvest.com.ng in Chrome.",
        "error"
      );
    };
    document.head.appendChild(script);
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
        "Insufficient Main Wallet balance. (Play Bonus is for playing nodes only).",
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
  // ADMIN STUDIO: 1-CLICK PLAYER WALLET TOP-UP & LIVE NODE EDITOR
  // ============================================================================
  const handleAdminCreditPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPhone = normalizePhone(adminCreditPhone);
    const amt = Number(adminCreditAmount);

    if (targetPhone.length < 10 || isNaN(amt) || amt <= 0) {
      showToast("Enter a valid 11-digit phone number and amount.", "error");
      return;
    }

    setAdminCrediting(true);
    try {
      let currentMain = 0;
      let currentBonus = 0;

      if (supabase) {
        const { data: targetUser } = await supabase
          .from("users")
          .select("*")
          .eq("phone", targetPhone)
          .maybeSingle();

        if (!targetUser) {
          showToast(
            `Player ${targetPhone} not found in database! Ask them to register first.`,
            "error"
          );
          setAdminCrediting(false);
          return;
        }

        currentMain = Number(targetUser.wallet_balance ?? 0);
        currentBonus = Number(targetUser.bonus_balance ?? 0);

        const updates =
          adminCreditType === "main"
            ? { wallet_balance: currentMain + amt }
            : { bonus_balance: currentBonus + amt };

        await supabase.from("users").update(updates).eq("phone", targetPhone);
        await supabase.from("transactions").insert([
          {
            user_phone: targetPhone,
            type: "admin_credit",
            amount: amt,
            status: "completed",
            reference: `ADMIN_${Date.now()}`,
          },
        ]);
      }

      if (user && normalizePhone(user.phone) === targetPhone) {
        await fetchUserSession(targetPhone);
      }

      showToast(
        `✅ Credited ₦${amt.toLocaleString()} to ${targetPhone}'s ${
          adminCreditType === "main" ? "Main Wallet" : "Play Bonus"
        }!`,
        "success"
      );
      setAdminCreditPhone("");
    } catch (err) {
      showToast("Error crediting player wallet.", "error");
    } finally {
      setAdminCrediting(false);
    }
  };

  const handleAdminLoadNode = (nodeIdStr: string) => {
    setEditNodeId(nodeIdStr);
    const idNum = parseInt(nodeIdStr, 10);
    if (isNaN(idNum) || idNum < 1 || idNum > TOTAL_NODES) return;

    const existingOverride = nodeOverridesMap[idNum];
    const existingSold = soldNodesMap[idNum];
    const defaultGift = getExact12TierNodePrize(idNum);

    setEditBrandName(
      existingOverride?.brand_name || existingSold?.brand_name || ""
    );
    setEditLogoUrl(existingOverride?.logo_url || existingSold?.logo_url || "");
    setEditCustomPrize(
      existingOverride?.custom_prize !== undefined &&
        existingOverride?.custom_prize !== null
        ? String(existingOverride.custom_prize)
        : String(defaultGift)
    );
    setEditNodeIsSold(Boolean(existingSold?.is_sold));
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
      // 1. Update Node Overrides (Name, Picture, Custom Gift Amount)
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
        await supabase
          .from("node_overrides")
          .upsert([payload], { onConflict: "node_id" });
      }

      // 2. Also update Lock / Sold status if toggled by Admin
      const soldRecord = {
        node_id: idNum,
        owner_phone: soldNodesMap[idNum]?.owner_phone || "ADMIN",
        owner_name: soldNodesMap[idNum]?.owner_name || "Admin Studio",
        brand_name: payload.brand_name,
        logo_url: payload.logo_url,
        is_sold: editNodeIsSold,
        prize_won: payload.custom_prize,
        unlocked_at: new Date().toISOString(),
      };
      await persistNodeLockToDatabase(idNum, soldRecord);

      const targetSector = Math.ceil(idNum / NODES_PER_SECTOR);
      setCurrentSector(targetSector);
      setSectorInput(String(targetSector));

      showToast(
        `✅ Node #${idNum} saved! (${
          editNodeIsSold ? "Locked/Sold" : "Available"
        } • Gift: ₦${payload.custom_prize.toLocaleString()})`,
        "success"
      );
    } catch (err) {
      showToast("Node saved to board!", "success");
    } finally {
      setAdminSaving(false);
    }
  };

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

  // ============================================================================
  // DIRECT APP INSTALL & DOWNLOAD ENGINE
  // ============================================================================
  const handleInstallApp = async () => {
    const promptEvent =
      deferredPrompt ||
      (typeof window !== "undefined" ? (window as any).__pvDeferredPrompt : null);

    if (promptEvent) {
      try {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          (window as any).__pvDeferredPrompt = null;
          showToast("Installing The Pixel Vest App to your phone...", "success");
        }
        return;
      } catch (err) {}
    }

    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isAndroid = /android/i.test(ua);
    const isInApp =
      /(FBAN|FBAV|Instagram|Twitter|Line|MicroMessenger|BingWeb|Sapphire)/i.test(
        ua
      );

    if (isAndroid && isInApp) {
      showToast("Opening Chrome App Installer...", "success");
      window.location.href =
        "intent://www.thepixelvest.com.ng/?source=pwa#Intent;scheme=https;package=com.android.chrome;end";
      return;
    }

    showToast("Downloading The Pixel Vest App...", "success");
    const appHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#07090e" />
<title>The Pixel Vest</title>
<link rel="icon" href="https://www.thepixelvest.com.ng/icon.jpg" />
<style>
  html,body,iframe { margin:0; padding:0; width:100%; height:100%; background:#07090e; border:0; overflow:hidden; }
</style>
</head>
<body>
  <iframe src="https://www.thepixelvest.com.ng/?source=pwa" allow="clipboard-read *; clipboard-write *; payment *"></iframe>
</body>
</html>`;

    const blob = new Blob([appHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ThePixelVest-App.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyReferralLink = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const cleanPhone = normalizePhone(user.phone);
    const url = `https://www.thepixelvest.com.ng/?ref=${cleanPhone}`;
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
  // 6. RENDER UI WITH 100% EMBEDDED MASTER CSS
  // ============================================================================
  return (
    <div className="pv-root">
      <style>{`
        * {
          box-sizing: border-box;
        }
        html, body, .pv-root {
          margin: 0;
          padding: 0;
          background-color: #07090e !important;
          color: #ffffff !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }
        .pv-container {
          max-width: 440px;
          margin: 0 auto;
          padding: 12px 14px 80px 14px;
        }
        .pv-ticker {
          background-color: #082016;
          border: 1px solid rgba(16, 185, 129, 0.45);
          border-radius: 12px;
          padding: 10px 12px;
          margin-bottom: 14px;
          text-align: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }
        .pv-ticker-text {
          margin: 0;
          color: #fbbf24 !important;
          font-weight: 800;
          font-size: 13px;
          line-height: 1.35;
        }
        .pv-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 6px;
        }
        .pv-brand-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pv-brand-title {
          margin: 0;
          font-size: 21px;
          font-weight: 900;
          letter-spacing: 0.4px;
          color: #10b981 !important;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pv-triangle {
          color: #fbbf24 !important;
          font-size: 19px;
        }
        .pv-install-btn {
          background-color: #10b981 !important;
          border: 1px solid #34d399 !important;
          color: #000000 !important;
          font-weight: 900;
          font-size: 11px;
          padding: 8px 12px;
          border-radius: 9px;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
        .pv-subtitle {
          margin: 0 0 12px 0;
          color: #9ca3af !important;
          font-size: 13px;
          line-height: 1.4;
        }
        .pv-wallets-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 12px;
        }
        .pv-wallet-main {
          background-color: #081e17;
          border: 1px solid rgba(16, 185, 129, 0.55);
          border-radius: 12px;
          padding: 11px 13px;
        }
        .pv-wallet-bonus {
          background-color: #211708;
          border: 1px solid rgba(245, 158, 11, 0.55);
          border-radius: 12px;
          padding: 11px 13px;
        }
        .pv-wallet-label {
          margin: 0;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #9ca3af !important;
        }
        .pv-wallet-label-gold {
          margin: 0;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #fcd34d !important;
        }
        .pv-wallet-val-main {
          margin: 4px 0 0 0;
          font-size: 20px;
          font-weight: 900;
          color: #10b981 !important;
        }
        .pv-wallet-val-bonus {
          margin: 4px 0 0 0;
          font-size: 20px;
          font-weight: 900;
          color: #fbbf24 !important;
        }
        .pv-actions-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }
        .pv-btn-emerald {
          background-color: #10b981 !important;
          color: #000000 !important;
          font-weight: 900;
          font-size: 13px;
          padding: 10px 16px;
          border-radius: 11px;
          border: none;
          cursor: pointer;
          flex: 1;
          text-align: center;
        }
        .pv-btn-refer {
          background-color: #211708 !important;
          color: #fbbf24 !important;
          border: 1px solid rgba(245, 158, 11, 0.5) !important;
          font-weight: 800;
          font-size: 12px;
          padding: 10px 13px;
          border-radius: 11px;
          cursor: pointer;
        }
        .pv-btn-logout {
          background-color: #291216 !important;
          color: #fda4af !important;
          border: 1px solid rgba(244, 63, 94, 0.4) !important;
          font-weight: 800;
          font-size: 13px;
          padding: 10px 15px;
          border-radius: 11px;
          cursor: pointer;
        }
        .pv-divider {
          border: 0;
          border-top: 1px solid #1f2430;
          margin: 12px 0;
        }
        .pv-legend {
          margin-bottom: 12px;
          font-size: 13px;
        }
        .pv-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .pv-dot-gold {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          background: linear-gradient(135deg, #fde047, #d97706);
          border: 1px solid #fef08a;
          display: inline-block;
          flex-shrink: 0;
        }
        .pv-dot-sold {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          background-color: #12151e;
          border: 1px solid #374151;
          display: inline-block;
          flex-shrink: 0;
        }
        .pv-search-row {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .pv-input {
          flex: 1;
          background-color: #12151e !important;
          border: 1px solid #2d3343 !important;
          color: #ffffff !important;
          border-radius: 10px;
          padding: 10px 13px;
          font-size: 14px;
          outline: none;
        }
        .pv-btn-go {
          background-color: #10b981 !important;
          color: #000000 !important;
          font-weight: 900;
          font-size: 14px;
          padding: 10px 18px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
        }
        .pv-refresh-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 10px;
        }
        .pv-btn-dark {
          background-color: #12151e !important;
          border: 1px solid #262b38 !important;
          color: #e5e7eb !important;
          font-weight: 700;
          font-size: 12px;
          padding: 9px 14px;
          border-radius: 10px;
          cursor: pointer;
        }
        /* STRICT COMPACT HORIZONTAL BANNER AD BOX (LOCKED AT 50PX SLOT HEIGHT) */
        .pv-ad-box {
          margin: 10px 0 !important;
          padding: 5px 8px !important;
          background-color: #0c0f16 !important;
          border: 1px solid #1e2433 !important;
          border-radius: 11px !important;
          text-align: center !important;
          height: 68px !important;
          max-height: 68px !important;
          min-height: 68px !important;
          overflow: hidden !important;
        }
        .pv-ad-label {
          font-size: 9px !important;
          line-height: 11px !important;
          font-weight: 700 !important;
          letter-spacing: 1px !important;
          color: #6b7280 !important;
          text-transform: uppercase !important;
          margin-bottom: 3px !important;
        }
        .pv-ad-slot {
          position: relative !important;
          width: 100% !important;
          height: 48px !important;
          max-height: 48px !important;
          min-height: 48px !important;
          overflow: hidden !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background-color: #080a0f !important;
          border-radius: 8px !important;
        }
        .pv-ad-slot ins.adsbygoogle,
        .pv-ad-slot iframe {
          height: 48px !important;
          max-height: 48px !important;
          min-height: 48px !important;
          overflow: hidden !important;
        }
        .pv-ad-placeholder {
          position: absolute !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          color: #10b981 !important;
          opacity: 0.75 !important;
          pointer-events: none !important;
          white-space: nowrap !important;
        }
        .pv-sector-info {
          font-size: 13px;
          color: #9ca3af !important;
          margin: 0 0 10px 0;
          line-height: 1.4;
        }
        .pv-sector-highlight {
          color: #fbbf24 !important;
          font-weight: 800;
        }
        .pv-pagination-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 14px;
        }
        .pv-page-btn {
          background-color: #12151e !important;
          border: 1px solid #262b38 !important;
          color: #ffffff !important;
          font-weight: 800;
          font-size: 12px;
          padding: 8px 14px;
          border-radius: 11px;
          cursor: pointer;
          min-width: 80px;
          text-align: center;
          line-height: 1.25;
        }
        .pv-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .pv-sector-jump {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pv-sector-input {
          width: 74px;
          background-color: #12151e !important;
          border: 1px solid #2d3343 !important;
          color: #ffffff !important;
          font-weight: 800;
          font-size: 13px;
          padding: 9px 8px;
          border-radius: 10px;
          text-align: center;
        }
        .pv-sector-btn {
          background-color: #211708 !important;
          border: 1px solid #f59e0b !important;
          color: #fbbf24 !important;
          font-weight: 800;
          font-size: 12px;
          padding: 9px 13px;
          border-radius: 10px;
          cursor: pointer;
        }
        .pv-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 10px;
        }
        .pv-node-card {
          aspect-ratio: 1 / 1;
          min-height: 108px;
          border-radius: 15px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: transform 0.12s ease;
          user-select: none;
        }
        .pv-node-card:active {
          transform: scale(0.95);
        }
        .pv-node-available {
          background: linear-gradient(180deg, #fcd34d 0%, #f59e0b 55%, #d97706 100%) !important;
          border: 1px solid #fef08a !important;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
        }
        .pv-node-sold {
          background-color: #12151e !important;
          border: 1px solid #262b38 !important;
          opacity: 0.85;
        }
        .pv-node-top {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 4px;
        }
        .pv-node-num-avail {
          font-size: 12px;
          font-weight: 900;
          color: #111827 !important;
        }
        .pv-node-num-sold {
          font-size: 12px;
          font-weight: 900;
          color: #9ca3af !important;
        }
        .pv-node-badge {
          font-size: 8px;
          font-weight: 800;
          padding: 2px 4px;
          border-radius: 4px;
          background-color: rgba(0, 0, 0, 0.28);
          color: #ffffff !important;
          max-width: 50px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pv-node-center {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: auto 0;
        }
        .pv-node-diamond {
          font-size: 28px;
          line-height: 1;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25));
        }
        .pv-node-logo {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          object-fit: contain;
          background-color: #ffffff;
          padding: 2px;
        }
        .pv-node-price-avail {
          font-size: 13px;
          font-weight: 900;
          color: #111827 !important;
        }
        .pv-node-price-sold {
          font-size: 11px;
          font-weight: 900;
          color: #ef4444 !important;
          letter-spacing: 0.4px;
        }
        .pv-info-card {
          margin-top: 24px;
          background-color: #0c0f16;
          border: 1px solid #1e2433;
          border-radius: 14px;
          padding: 14px;
          font-size: 12px;
          color: #9ca3af !important;
          line-height: 1.55;
        }
        .pv-info-title {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff !important;
        }
        .pv-footer {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid #1a1f2c;
          text-align: center;
          font-size: 12px;
          color: #9ca3af !important;
        }
        .pv-footer-links {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-top: 10px;
        }
        .pv-link-btn {
          background: none !important;
          border: none !important;
          color: #9ca3af !important;
          text-decoration: underline;
          font-size: 11px;
          cursor: pointer;
          padding: 0;
        }
        .pv-modal-backdrop {
          position: fixed;
          inset: 0;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0, 0, 0, 0.84);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .pv-modal-card {
          background-color: #12151e;
          border: 1px solid #2d3343;
          border-radius: 18px;
          max-width: 380px;
          width: 100%;
          padding: 20px;
          color: #ffffff !important;
          max-height: 90vh;
          overflow-y: auto;
        }
        .pv-toast {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          background-color: #10b981;
          color: #000000 !important;
          font-weight: 900;
          font-size: 13px;
          padding: 12px 18px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.6);
          max-width: 340px;
          width: 90%;
          text-align: center;
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div
          className="pv-toast"
          style={{
            backgroundColor:
              toast.type === "error"
                ? "#ef4444"
                : toast.type === "success"
                ? "#10b981"
                : "#fbbf24",
            color: toast.type === "error" ? "#ffffff" : "#000000",
          }}
        >
          {toast.msg}
        </div>
      )}

      <div className="pv-container">
        {/* 1. TOP GREEN PAYOUT TICKER */}
        <div className="pv-ticker">
          <p className="pv-ticker-text">{LIVE_TICKER_MESSAGES[tickerIndex]}</p>
        </div>

        {/* 2. BRAND HEADER + DIRECT APK INSTALL / DOWNLOAD BUTTON */}
        <div className="pv-header-row">
          <div className="pv-brand-wrap">
            <h1 className="pv-brand-title">
              <span className="pv-triangle">▲</span> THE PIXEL VEST
            </h1>
          </div>

          <button onClick={handleInstallApp} className="pv-install-btn">
            📲 Download App
          </button>
        </div>

        {/* 3. SUBTITLE */}
        <p className="pv-subtitle">
          1,000,000 Nodes • ₦22,000,000 Prize Vault • Tap a Golden Node (₦100)
        </p>

        {/* 4. TWO WALLET BALANCES SIDE-BY-SIDE */}
        <div className="pv-wallets-grid">
          <div className="pv-wallet-main">
            <p className="pv-wallet-label">MAIN WALLET</p>
            <p className="pv-wallet-val-main">
              ₦{getMainBalance(user).toLocaleString()}
            </p>
          </div>

          <div className="pv-wallet-bonus">
            <p className="pv-wallet-label-gold">PLAY BONUS</p>
            <p className="pv-wallet-val-bonus">
              ₦{getBonusBalance(user).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 5. ACTION BUTTONS (+ FUND / CASH OUT, REFER, LOGOUT / LOGIN) */}
        <div className="pv-actions-row">
          <button
            onClick={() => {
              if (!user) {
                setShowAuthModal(true);
              } else {
                setWalletTab("fund");
                setShowWalletModal(true);
              }
            }}
            className="pv-btn-emerald"
          >
            + FUND / CASH OUT
          </button>

          <button onClick={copyReferralLink} className="pv-btn-refer">
            Refer (+₦50)
          </button>

          {user ? (
            <button
              onClick={() => {
                localStorage.removeItem("pixelvest_active_phone");
                setUser(null);
                showToast("Logged out.", "info");
              }}
              className="pv-btn-logout"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
              className="pv-btn-logout"
            >
              Login
            </button>
          )}
        </div>

        <hr className="pv-divider" />

        {/* 6. AVAILABLE & SOLD NODE LEGEND */}
        <div className="pv-legend">
          <div className="pv-legend-item">
            <span className="pv-dot-gold" />
            <span style={{ color: "#ffffff", fontWeight: 700 }}>
              Available Node (₦100)
            </span>
          </div>
          <div className="pv-legend-item">
            <span className="pv-dot-sold" />
            <span style={{ color: "#9ca3af" }}>
              Sold Node (Darkened • Locked • Logo Still Visible)
            </span>
          </div>
        </div>

        {/* 7. NODE SEARCH INPUT + GO + REFRESH LIVE BOARD */}
        <div className="pv-search-row">
          <input
            type="number"
            min={1}
            max={1000000}
            value={searchNodeInput}
            onChange={(e) => setSearchNodeInput(e.target.value)}
            placeholder="Enter Node # (1 - 1,000,000)"
            className="pv-input"
          />
          <button onClick={handleJumpToNode} className="pv-btn-go">
            Go
          </button>
        </div>

        <div className="pv-refresh-row">
          <button
            onClick={() => {
              fetchSectorBoardData(currentSector);
              if (user?.phone) fetchUserSession(user.phone);
            }}
            className="pv-btn-dark"
          >
            ↻ {boardLoading ? "Refreshing..." : "Refresh Live Board"}
          </button>

          <button
            onClick={() => {
              handleAdminLoadNode(String(selectedNode || startNodeNum));
              setShowAdminModal(true);
            }}
            className="pv-sector-btn"
          >
            ⚙️ Admin Studio
          </button>
        </div>

        {/* 8. COMPACT HORIZONTAL GOOGLE ADSENSE BANNER (50PX LOCKED) */}
        <AdSenseBanner
          slotId={ADSENSE_UNIT_SLOT_ID}
          label="SPONSORED BANNER AD"
        />

        {/* 9. SECTOR INDICATOR & PAGINATION CONTROLS */}
        <div>
          <p className="pv-sector-info">
            <span className="pv-sector-highlight">
              Viewing Sector #{currentSector.toLocaleString()} of{" "}
              {TOTAL_SECTORS.toLocaleString()}
            </span>{" "}
            • Nodes #{startNodeNum.toLocaleString()} – #
            {endNodeNum.toLocaleString()}
          </p>

          <div className="pv-pagination-row">
            <button
              onClick={() => changeSector(currentSector - 1)}
              disabled={currentSector <= 1}
              className="pv-page-btn"
            >
              ← Prev
              <br />
              100
            </button>

            <div className="pv-sector-jump">
              <input
                type="number"
                min={1}
                max={TOTAL_SECTORS}
                value={sectorInput}
                onChange={(e) => setSectorInput(e.target.value)}
                className="pv-sector-input"
              />
              <button
                onClick={() => {
                  const s = parseInt(sectorInput, 10);
                  if (!isNaN(s)) changeSector(s);
                }}
                className="pv-sector-btn"
              >
                Sector
              </button>
            </div>

            <button
              onClick={() => changeSector(currentSector + 1)}
              disabled={currentSector >= TOTAL_SECTORS}
              className="pv-page-btn"
            >
              Next 100
              <br />→
            </button>
          </div>
        </div>

        {/* 10. EXACT 3-COLUMN GOLDEN DIAMOND GRID */}
        <div className="pv-grid">
          {sectorNodes.map((nodeId) => {
            const soldInfo = soldNodesMap[nodeId];
            const isSold = Boolean(soldInfo?.is_sold);
            const override = nodeOverridesMap[nodeId];
            const displayBrand = override?.brand_name || soldInfo?.brand_name;
            const displayLogo = override?.logo_url || soldInfo?.logo_url;

            return (
              <div
                key={nodeId}
                onClick={() => setSelectedNode(nodeId)}
                className={`pv-node-card ${
                  isSold ? "pv-node-sold" : "pv-node-available"
                }`}
              >
                <div className="pv-node-top">
                  <span
                    className={
                      isSold ? "pv-node-num-sold" : "pv-node-num-avail"
                    }
                  >
                    #{nodeId}
                  </span>
                  {displayBrand && (
                    <span className="pv-node-badge">{displayBrand}</span>
                  )}
                </div>

                <div className="pv-node-center">
                  {displayLogo ? (
                    <img
                      src={displayLogo}
                      alt={displayBrand || `Node #${nodeId}`}
                      className="pv-node-logo"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <span className="pv-node-diamond">
                      {isSold ? "🔒" : "💎"}
                    </span>
                  )}
                </div>

                <div>
                  <span
                    className={
                      isSold ? "pv-node-price-sold" : "pv-node-price-avail"
                    }
                  >
                    {isSold ? "SOLD • LOCKED" : "₦100"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 11. BOTTOM COMPACT HORIZONTAL GOOGLE ADSENSE BANNER (50PX LOCKED) */}
        <AdSenseBanner
          slotId={ADSENSE_UNIT_SLOT_ID}
          label="SPONSORED PARTNER AD"
        />

        {/* 12. SEO & GOOGLE ADSENSE RICH CONTENT SECTION */}
        <section className="pv-info-card">
          <h2 className="pv-info-title">
            The Pixel Vest — Nigeria&apos;s 1,000,000 Digital Node Grid
          </h2>
          <p style={{ margin: "0 0 8px 0" }}>
            Unlock exclusive digital nodes for ₦100, display custom brand logos,
            and discover instant cash vault bounties ranging from ₦10 up to
            ₦10,000 across 10,000 sectors.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: "#fbbf24" }}>
              Anti-Cheat Referral Bonus:
            </strong>{" "}
            Invite friends with your unique referral link and receive{" "}
            <strong style={{ color: "#ffffff" }}>₦50 Play Bonus</strong> as soon
            as your referred friend funds their Main Wallet and unlocks their
            first node!
          </p>
        </section>

        {/* 13. INDEPENDENT STUDIO FOOTER */}
        <footer className="pv-footer">
          <p style={{ margin: "0 0 6px 0", fontWeight: 700, color: "#d1d5db" }}>
            © {new Date().getFullYear()} The Pixel Vest • Powered by PixelVest
            Digital Studios Ltd
          </p>
          <p style={{ margin: 0 }}>
            Support:{" "}
            <a
              href="mailto:adminpixelvest@gmail.com"
              style={{ color: "#10b981", textDecoration: "underline" }}
            >
              adminpixelvest@gmail.com
            </a>
          </p>
          <div className="pv-footer-links">
            <button
              onClick={() => setLegalModal("terms")}
              className="pv-link-btn"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setLegalModal("privacy")}
              className="pv-link-btn"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => {
                handleAdminLoadNode(String(selectedNode || startNodeNum));
                setShowAdminModal(true);
              }}
              className="pv-link-btn"
              style={{ color: "#fbbf24" }}
            >
              Admin Studio
            </button>
          </div>
        </footer>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: UNLOCK NODE MODAL                                           */}
      {/* ==================================================================== */}
      {selectedNode !== null && (
        <div className="pv-modal-backdrop">
          <div className="pv-modal-card" style={{ textAlign: "center" }}>
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
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      margin: "0 auto 12px auto",
                      borderRadius: 16,
                      backgroundColor: "rgba(245, 158, 11, 0.15)",
                      border: "1px solid rgba(245, 158, 11, 0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {displayLogo ? (
                      <img
                        src={displayLogo}
                        alt={displayBrand}
                        style={{
                          width: 52,
                          height: 52,
                          objectFit: "contain",
                          borderRadius: 10,
                          backgroundColor: "#fff",
                          padding: 2,
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 32 }}>
                        {isSold ? "🔒" : "💎"}
                      </span>
                    )}
                  </div>

                  <h3 style={{ margin: "0 0 4px 0", fontSize: 19, fontWeight: 900 }}>
                    Node #{selectedNode.toLocaleString()}
                  </h3>
                  <p
                    style={{
                      margin: "0 0 14px 0",
                      fontSize: 12,
                      color: "#fbbf24",
                      fontWeight: 700,
                    }}
                  >
                    {displayBrand}
                  </p>

                  {isSold ? (
                    <div
                      style={{
                        backgroundColor: "#0c0f16",
                        border: "1px solid #ef4444",
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 14,
                        fontSize: 12,
                      }}
                    >
                      <p style={{ margin: "0 0 4px 0", color: "#f87171", fontWeight: 800 }}>
                        🔒 Node Permanently Locked (Sold)
                      </p>
                      <p style={{ margin: 0, color: "#9ca3af" }}>
                        Unlocked by: {soldInfo?.owner_name || "Player"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p style={{ margin: "0 0 12px 0", fontSize: 12, color: "#9ca3af" }}>
                        Tap below to unlock Node #{selectedNode} for{" "}
                        <strong style={{ color: "#fff" }}>₦100</strong> and
                        reveal its instant cash gift!
                      </p>

                      <div className="pv-wallets-grid" style={{ textAlign: "left" }}>
                        <div
                          onClick={() => setWalletSource("main")}
                          style={{
                            padding: 10,
                            borderRadius: 11,
                            cursor: "pointer",
                            backgroundColor:
                              walletSource === "main" ? "#08291e" : "#0c0f16",
                            border:
                              walletSource === "main"
                                ? "2px solid #10b981"
                                : "1px solid #262b38",
                          }}
                        >
                          <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "#9ca3af" }}>
                            MAIN WALLET
                          </p>
                          <p style={{ margin: "3px 0 0 0", fontSize: 14, fontWeight: 900, color: "#10b981" }}>
                            ₦{getMainBalance(user).toLocaleString()}
                          </p>
                        </div>

                        <div
                          onClick={() => setWalletSource("bonus")}
                          style={{
                            padding: 10,
                            borderRadius: 11,
                            cursor: "pointer",
                            backgroundColor:
                              walletSource === "bonus" ? "#291d08" : "#0c0f16",
                            border:
                              walletSource === "bonus"
                                ? "2px solid #fbbf24"
                                : "1px solid #262b38",
                          }}
                        >
                          <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "#fcd34d" }}>
                            PLAY BONUS
                          </p>
                          <p style={{ margin: "3px 0 0 0", fontSize: 14, fontWeight: 900, color: "#fbbf24" }}>
                            ₦{getBonusBalance(user).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleUnlockNode}
                        disabled={unlockLoading}
                        className="pv-btn-emerald"
                        style={{
                          width: "100%",
                          backgroundColor: "#fbbf24",
                          marginBottom: 10,
                          padding: "13px",
                        }}
                      >
                        {unlockLoading
                          ? "Unlocking Vault..."
                          : "UNLOCK NODE NOW (₦100)"}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      const target = String(selectedNode);
                      setSelectedNode(null);
                      setAdminTab("node");
                      handleAdminLoadNode(target);
                      setShowAdminModal(true);
                    }}
                    className="pv-sector-btn"
                    style={{ width: "100%", marginBottom: 10 }}
                  >
                    ⚙️ Admin: Edit Node #{selectedNode}
                  </button>

                  <button
                    onClick={() => setSelectedNode(null)}
                    className="pv-btn-dark"
                    style={{ width: "100%" }}
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
        <div className="pv-modal-backdrop">
          <div className="pv-modal-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>
              {rewardResult.amount > 0 ? "🎉" : "😂"}
            </div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: 20, fontWeight: 900, color: "#fbbf24" }}>
              {rewardResult.amount > 0
                ? `Node #${rewardResult.nodeId} Jackpot!`
                : `Node #${rewardResult.nodeId} Empty!`}
            </h3>
            <p style={{ margin: "0 0 14px 0", fontSize: 12, color: "#9ca3af" }}>
              {rewardResult.brandName}
            </p>

            {rewardResult.amount > 0 ? (
              <div
                style={{
                  backgroundColor: "#082419",
                  border: "1px solid #10b981",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#6ee7b7" }}>
                  INSTANT GIFT CREDITED TO MAIN WALLET!
                </p>
                <p style={{ margin: "6px 0 0 0", fontSize: 28, fontWeight: 900, color: "#10b981" }}>
                  +₦{rewardResult.amount.toLocaleString()}
                </p>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "#1f1216",
                  border: "1px solid rgba(244, 63, 94, 0.45)",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#fda4af",
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  <span>⚡ Naija Street Cruise</span>
                  <span>
                    #{rewardResult.roastIndex + 1} /{" "}
                    {EMPTY_NODE_ROASTS_AND_QUOTES.length}
                  </span>
                </div>
                <p
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fde68a",
                    lineHeight: 1.5,
                  }}
                >
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
                  className="pv-sector-btn"
                  style={{ fontSize: 11, padding: "6px 12px" }}
                >
                  Next Roast / Quote 😂 →
                </button>
              </div>
            )}

            <button
              onClick={() => setRewardResult(null)}
              className="pv-btn-emerald"
              style={{ width: "100%", padding: "12px" }}
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
        <div className="pv-modal-backdrop">
          <div className="pv-modal-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>
                {authMode === "login"
                  ? "Login to The Pixel Vest"
                  : "Create Player Account"}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="pv-btn-dark"
                style={{ padding: "4px 10px" }}
              >
                ✕
              </button>
            </div>

            <div className="pv-wallets-grid" style={{ marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={
                  authMode === "login" ? "pv-btn-emerald" : "pv-btn-dark"
                }
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={
                  authMode === "register" ? "pv-btn-emerald" : "pv-btn-dark"
                }
              >
                Register
              </button>
            </div>

            <form
              onSubmit={handleAuthSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <input
                type="tel"
                required
                placeholder="Phone Number (e.g. 08012345678)"
                value={authPhone}
                onChange={(e) => setAuthPhone(e.target.value)}
                className="pv-input"
              />

              {authMode === "register" && (
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="pv-input"
                />
              )}

              <input
                type="password"
                required
                placeholder="Password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="pv-input"
              />

              {authMode === "register" && (
                <>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="4-Digit Withdrawal PIN (e.g. 1234)"
                    value={authPin}
                    onChange={(e) => setAuthPin(e.target.value)}
                    className="pv-input"
                  />
                  <input
                    type="tel"
                    placeholder="Referrer Phone Number (Optional)"
                    value={authReferral}
                    onChange={(e) => setAuthReferral(e.target.value)}
                    className="pv-input"
                  />
                </>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="pv-btn-emerald"
                style={{ width: "100%", padding: "12px", marginTop: 4 }}
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
        <div className="pv-modal-backdrop">
          <div className="pv-modal-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>
                Wallet & Cash Out
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="pv-btn-dark"
                style={{ padding: "4px 10px" }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 6,
                marginBottom: 14,
              }}
            >
              <button
                onClick={() => setWalletTab("fund")}
                className={
                  walletTab === "fund" ? "pv-btn-emerald" : "pv-btn-dark"
                }
                style={{ padding: "8px 4px", fontSize: 11 }}
              >
                Fund Wallet
              </button>
              <button
                onClick={() => setWalletTab("withdraw")}
                className={
                  walletTab === "withdraw" ? "pv-btn-emerald" : "pv-btn-dark"
                }
                style={{ padding: "8px 4px", fontSize: 11 }}
              >
                Cash Out
              </button>
              <button
                onClick={() => setWalletTab("referrals")}
                className={
                  walletTab === "referrals" ? "pv-btn-emerald" : "pv-btn-dark"
                }
                style={{ padding: "8px 4px", fontSize: 11 }}
              >
                Refer (+₦50)
              </button>
            </div>

            {walletTab === "fund" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                  Instant Main Wallet deposit via Paystack (Card, Bank Transfer,
                  or USSD).
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 6,
                  }}
                >
                  {["200", "500", "1000", "5000"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFundAmount(preset)}
                      className={
                        fundAmount === preset ? "pv-sector-btn" : "pv-btn-dark"
                      }
                      style={{ padding: "8px 4px" }}
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
                  className="pv-input"
                  placeholder="Enter amount (₦)"
                />
                <button
                  onClick={handleFundWithPaystack}
                  disabled={paystackConnecting}
                  className="pv-btn-emerald"
                  style={{ width: "100%", padding: "12px" }}
                >
                  {paystackConnecting
                    ? "OPENING PAYSTACK CHECKOUT..."
                    : `PAY ₦${Number(fundAmount || 0).toLocaleString()} WITH PAYSTACK`}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (user?.phone) {
                      fetchUserSession(user.phone);
                      showToast(
                        "Wallet synced with server! Checking latest deposits...",
                        "success"
                      );
                    }
                  }}
                  className="pv-btn-dark"
                  style={{ width: "100%", fontSize: 11, padding: "9px" }}
                >
                  ↻ Window Closed After Transfer? Tap to Sync Wallet
                </button>
              </div>
            )}

            {walletTab === "withdraw" && (
              <form
                onSubmit={handleWithdrawSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 9 }}
              >
                <p style={{ margin: 0, fontSize: 12, color: "#10b981", fontWeight: 800 }}>
                  Withdrawable Main Wallet: ₦
                  {getMainBalance(user).toLocaleString()}
                </p>
                <input
                  type="number"
                  required
                  placeholder="Amount to Withdraw (Min ₦500)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pv-input"
                />
                <input
                  type="text"
                  required
                  placeholder="Bank Name (e.g. OPay, PalmPay, Stanbic, GTBank)"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="pv-input"
                />
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="10-Digit Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="pv-input"
                />
                <input
                  type="text"
                  required
                  placeholder="Account Holder Name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="pv-input"
                />
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="Your 4-Digit Withdrawal PIN"
                  value={withdrawPinInput}
                  onChange={(e) => setWithdrawPinInput(e.target.value)}
                  className="pv-input"
                />
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="pv-btn-emerald"
                  style={{ width: "100%", padding: "12px" }}
                >
                  {withdrawLoading
                    ? "Submitting..."
                    : "SUBMIT CASH OUT REQUEST"}
                </button>
              </form>
            )}

            {walletTab === "referrals" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="pv-wallet-bonus">
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#fbbf24" }}>
                    Play Bonus: ₦{getBonusBalance(user).toLocaleString()}
                  </p>
                  <p style={{ margin: "6px 0 0 0", fontSize: 11, color: "#d1d5db" }}>
                    Earn <strong>₦50</strong> into your Play Bonus wallet every
                    time a friend registers with your link, funds their Main
                    Wallet, and unlocks their first node!
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: "#080a0f",
                    border: "1px solid #262b38",
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 11,
                    color: "#10b981",
                    wordBreak: "break-all",
                  }}
                >
                  https://www.thepixelvest.com.ng/?ref=
                  {user ? normalizePhone(user.phone) : "YOUR_PHONE"}
                </div>
                <button
                  onClick={copyReferralLink}
                  className="pv-btn-emerald"
                  style={{ width: "100%", padding: "12px" }}
                >
                  COPY MY REFERRAL LINK
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: ADMIN STUDIO (EDIT GRID NODES + CREDIT PLAYER WALLET)       */}
      {/* ==================================================================== */}
      {showAdminModal && (
        <div className="pv-modal-backdrop">
          <div className="pv-modal-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#fbbf24" }}>
                ⚙️ Admin Studio
              </h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="pv-btn-dark"
                style={{ padding: "4px 10px" }}
              >
                ✕
              </button>
            </div>

            {!isAdminUnlocked ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                  Enter your Admin PIN to edit nodes or credit player wallets
                  (PIN: 2026):
                </p>
                <input
                  type="password"
                  placeholder="Enter Admin PIN"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="pv-input"
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
                  className="pv-btn-emerald"
                  style={{ width: "100%", padding: "12px" }}
                >
                  UNLOCK ADMIN STUDIO
                </button>
              </div>
            ) : (
              <>
                <div className="pv-wallets-grid" style={{ marginBottom: 14 }}>
                  <button
                    type="button"
                    onClick={() => setAdminTab("node")}
                    className={
                      adminTab === "node" ? "pv-btn-emerald" : "pv-btn-dark"
                    }
                    style={{ fontSize: 11, padding: "9px 6px" }}
                  >
                    💎 Edit Grid Node
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTab("wallet")}
                    className={
                      adminTab === "wallet" ? "pv-btn-emerald" : "pv-btn-dark"
                    }
                    style={{ fontSize: 11, padding: "9px 6px" }}
                  >
                    💰 Credit Player Wallet
                  </button>
                </div>

                {adminTab === "node" ? (
                  <form
                    onSubmit={handleSaveNodeOverride}
                    style={{ display: "flex", flexDirection: "column", gap: 10 }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        1. Node Number (1 – 1,000,000)
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="number"
                          min={1}
                          max={1000000}
                          required
                          value={editNodeId}
                          onChange={(e) => handleAdminLoadNode(e.target.value)}
                          className="pv-input"
                        />
                        <span
                          style={{
                            backgroundColor: "#0c0f16",
                            border: "1px solid #262b38",
                            borderRadius: 10,
                            padding: "8px 10px",
                            fontSize: 11,
                            color: "#fbbf24",
                            display: "flex",
                            alignItems: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Default: ₦
                          {getExact12TierNodePrize(
                            Number(editNodeId) || 1
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        2. Node Name / Brand Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MTN Gold Vault, VIP Node"
                        value={editBrandName}
                        onChange={(e) => setEditBrandName(e.target.value)}
                        className="pv-input"
                        style={{ width: "100%" }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        3. Upload Picture or Paste Image URL
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        style={{ fontSize: 11, marginBottom: 6, width: "100%" }}
                      />
                      <input
                        type="text"
                        placeholder="Or paste image link (https://...)"
                        value={editLogoUrl}
                        onChange={(e) => setEditLogoUrl(e.target.value)}
                        className="pv-input"
                        style={{ width: "100%" }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        4. Gift Amount Inside This Node (₦)
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        placeholder="e.g. 5000, 1000, 100, 0"
                        value={editCustomPrize}
                        onChange={(e) => setEditCustomPrize(e.target.value)}
                        className="pv-input"
                        style={{
                          width: "100%",
                          color: "#10b981",
                          fontWeight: 900,
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        5. Node Lock Status
                      </label>
                      <div className="pv-wallets-grid" style={{ marginBottom: 0 }}>
                        <button
                          type="button"
                          onClick={() => setEditNodeIsSold(false)}
                          className={
                            !editNodeIsSold ? "pv-sector-btn" : "pv-btn-dark"
                          }
                        >
                          💎 Available (₦100)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditNodeIsSold(true)}
                          className={
                            editNodeIsSold ? "pv-sector-btn" : "pv-btn-dark"
                          }
                        >
                          🔒 Locked (Sold)
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={adminSaving}
                      className="pv-btn-emerald"
                      style={{ width: "100%", padding: "12px", marginTop: 4 }}
                    >
                      {adminSaving
                        ? "Saving Node..."
                        : `SAVE CHANGES TO NODE #${editNodeId}`}
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={handleAdminCreditPlayer}
                    style={{ display: "flex", flexDirection: "column", gap: 10 }}
                  >
                    <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                      If a player&apos;s bank transfer ever gets stuck, credit
                      their wallet directly here instead of refunding cash:
                    </p>
                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Player Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 08012345678"
                        value={adminCreditPhone}
                        onChange={(e) => setAdminCreditPhone(e.target.value)}
                        className="pv-input"
                        style={{ width: "100%" }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Amount to Credit (₦)
                      </label>
                      <input
                        type="number"
                        min={50}
                        required
                        placeholder="e.g. 500"
                        value={adminCreditAmount}
                        onChange={(e) => setAdminCreditAmount(e.target.value)}
                        className="pv-input"
                        style={{
                          width: "100%",
                          color: "#10b981",
                          fontWeight: 900,
                        }}
                      />
                    </div>

                    <div className="pv-wallets-grid">
                      <button
                        type="button"
                        onClick={() => setAdminCreditType("main")}
                        className={
                          adminCreditType === "main"
                            ? "pv-sector-btn"
                            : "pv-btn-dark"
                        }
                      >
                        Main Wallet
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminCreditType("bonus")}
                        className={
                          adminCreditType === "bonus"
                            ? "pv-sector-btn"
                            : "pv-btn-dark"
                        }
                      >
                        Play Bonus
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={adminCrediting}
                      className="pv-btn-emerald"
                      style={{ width: "100%", padding: "12px", marginTop: 4 }}
                    >
                      {adminCrediting
                        ? "Crediting Player..."
                        : `CREDIT ₦${Number(
                            adminCreditAmount || 0
                          ).toLocaleString()} TO PLAYER NOW`}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 6: TERMS & PRIVACY POLICY MODAL                                */}
      {/* ==================================================================== */}
      {legalModal && (
        <div className="pv-modal-backdrop">
          <div className="pv-modal-card">
            <h3 style={{ margin: "0 0 10px 0", fontSize: 16, fontWeight: 900 }}>
              {legalModal === "terms" ? "Terms of Service" : "Privacy Policy"}
            </h3>
            <p style={{ fontSize: 12, color: "#d1d5db", lineHeight: 1.6 }}>
              {legalModal === "terms"
                ? "The Pixel Vest is operated by PixelVest Digital Studios Ltd. Participants must be 18+. Each digital node unlocks for ₦100. Referral bonuses (₦50) are credited to Play Bonus once a referred user funds their Main Wallet and unlocks their first node."
                : "PixelVest Digital Studios Ltd protects your privacy. We use Paystack for encrypted payments and Google AdSense for advertisements. Contact adminpixelvest@gmail.com for support."}
            </p>
            <button
              onClick={() => setLegalModal(null)}
              className="pv-btn-dark"
              style={{ width: "100%", padding: "11px", marginTop: 10 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}