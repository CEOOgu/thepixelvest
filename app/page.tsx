"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// 0. GLOBAL INTERCEPTOR: PAYSTACK IFRAME CLIPBOARD PERMISSION & APK INSTALL
// ============================================================================
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: any) => {
    e.preventDefault();
    (window as any).__pvDeferredPrompt = e;
  });

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

const PAYSTACK_PUBLIC_KEY = "pk_live_4f604b2d9d9689f50eba439e704600844f7dfd01";

const ADSENSE_CLIENT_ID = "ca-pub-9204985294084444";
const ADSENSE_UNIT_SLOT_ID = "3277719159";

const ADMIN_MASTER_PIN = "Amophanty//:betty?";

const TOTAL_NODES = 1000000;
const NODES_PER_SECTOR = 100;
const TOTAL_SECTORS = TOTAL_NODES / NODES_PER_SECTOR;
const NODE_PRICE = 100;
const REFERRAL_REWARD_AMOUNT = 50;
const STREAK_TARGET_NODES = 5;
const STREAK_BONUS_REWARD = 100;

export interface SiteAdConfig {
  slot_position: "top" | "bottom";
  ad_mode: "adsense" | "custom";
  adsense_client: string;
  adsense_slot: string;
  custom_html?: string;
  image_url?: string;
  target_url?: string;
  sponsor_label?: string;
  is_active?: boolean;
}

const DEFAULT_AD_CONFIGS: Record<"top" | "bottom", SiteAdConfig> = {
  top: {
    slot_position: "top",
    ad_mode: "adsense",
    adsense_client: ADSENSE_CLIENT_ID,
    adsense_slot: ADSENSE_UNIT_SLOT_ID,
    custom_html: "",
    image_url: "",
    target_url: "https://www.thepixelvest.com.ng",
    sponsor_label: "SPONSORED BANNER AD",
    is_active: true,
  },
  bottom: {
    slot_position: "bottom",
    ad_mode: "adsense",
    adsense_client: ADSENSE_CLIENT_ID,
    adsense_slot: ADSENSE_UNIT_SLOT_ID,
    custom_html: "",
    image_url: "",
    target_url: "https://www.thepixelvest.com.ng",
    sponsor_label: "SPONSORED PARTNER AD",
    is_active: true,
  },
};

const LIVE_TICKER_MESSAGES = [
  "💎 0901***552 unlocked ₦10,000 Mega Vault on Node #314!",
  "💎 0803***119 unlocked 5 Nodes & hit ₦5,000 Super Vault + ₦100 Streak Bonus!",
  "💎 0706***884 unlocked ₦3,000 Gold Vault on Node #14,820!",
  "💎 0814***902 unlocked ₦1,000 Cash Vault on Node #204,115!",
  "💎 0905***337 earned ₦50 Referral Play Bonus from an active player!",
  "💎 0809***441 unlocked ₦10,000 Mega Vault on Node #882,009!",
];

// ============================================================================
// 1B. 10 POPULAR COMPANY LOGOS IN SECTOR #1 (NODES 1 - 100)
// ============================================================================
function makeBrandSvg(
  bg: string,
  fg: string,
  text: string,
  sub?: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="22" fill="${bg}"/>
    <text x="60" y="${sub ? "58" : "68"}" text-anchor="middle" fill="${fg}" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${
    text.length > 6 ? "18" : "24"
  }">${text}</text>
    ${
      sub
        ? `<text x="60" y="84" text-anchor="middle" fill="${fg}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="13" opacity="0.9">${sub}</text>`
        : ""
    }
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const DEFAULT_SECTOR_1_BRAND_NODES: Record<
  number,
  { brand_name: string; logo_url: string }
> = {
  7: {
    brand_name: "MTN Nigeria",
    logo_url: makeBrandSvg("#FFCC00", "#000000", "MTN", "5G VAULT"),
  },
  14: {
    brand_name: "OPay Digital",
    logo_url: makeBrandSvg("#00B875", "#FFFFFF", "OPay", "INSTANT"),
  },
  21: {
    brand_name: "Paystack",
    logo_url: makeBrandSvg("#011B33", "#00C3F7", "Paystack", "VERIFIED"),
  },
  28: {
    brand_name: "Moniepoint",
    logo_url: makeBrandSvg("#0357EE", "#FFFFFF", "MONIE", "POINT"),
  },
  35: {
    brand_name: "Flutterwave",
    logo_url: makeBrandSvg("#FB9129", "#111827", "FLW", "WAVE"),
  },
  42: {
    brand_name: "PalmPay",
    logo_url: makeBrandSvg("#6E3FF3", "#FFFFFF", "PalmPay", "REWARDS"),
  },
  55: {
    brand_name: "GTCO Bank",
    logo_url: makeBrandSvg("#E04F16", "#FFFFFF", "GTCO", "737 BOX"),
  },
  68: {
    brand_name: "Dangote Group",
    logo_url: makeBrandSvg("#102A71", "#FBBF24", "DANGOTE", "MEGA"),
  },
  77: {
    brand_name: "Access More",
    logo_url: makeBrandSvg("#F37021", "#FFFFFF", "ACCESS", "DIAMOND"),
  },
  95: {
    brand_name: "Kuda Bank",
    logo_url: makeBrandSvg("#40196D", "#34D399", "kuda.", "FREE VAULT"),
  },
};

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
  "Nothing dey inside o! Even echo dey fear to sound inside this empty vault! 🔇😂",
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
  "Nothing dey inside Chief! Even bacterium no survive inside this dry vault! 🦠😂",
  "Quote: 'One golden tap can change your whole week—keep unlocking!' 🌟💰",
  "Final Boss Roast #250: Otilo! 😂 Since you don read reach here, the next node you tap get special anointing—go unlock am now! ⚡💎",
];

// ============================================================================
// 3. UPGRADED 30% WIN-RATE PRIZE ENGINE (300,000 WINNING NODES = ₦22,000,000)
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

  if (perm < 25000) return 70;
  if (perm < 25600) return 3000;
  if (perm < 25700) return 5000;
  if (perm < 25800) return 10000;
  if (perm < 29000) return 1000;
  if (perm < 84000) return 100;
  if (perm < 144000) return 50;
  if (perm < 194000) return 60;
  if (perm < 226000) return 30;
  if (perm < 251000) return 20;
  if (perm < 280000) return 10;
  if (perm < 300000) return 25;
  return 0;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) {
    return "0" + digits.slice(3);
  }
  return digits;
}

// ============================================================================
// 4. DYNAMIC AD BANNER ENGINE (ADSENSE CODE OR CLICKABLE SPONSOR IMAGE + LINK)
// ============================================================================
function AdSenseBanner({
  config,
  defaultLabel = "SPONSORED BANNER AD",
}: {
  config?: SiteAdConfig;
  defaultLabel?: string;
}) {
  const activeConfig = config || DEFAULT_AD_CONFIGS.top;
  const labelText = activeConfig.sponsor_label || defaultLabel;
  const isCustomImageMode =
    activeConfig.ad_mode === "custom" && Boolean(activeConfig.image_url);

  useEffect(() => {
    if (!isCustomImageMode) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
          {}
        );
      } catch (err) {}
    }
  }, [
    isCustomImageMode,
    activeConfig.adsense_client,
    activeConfig.adsense_slot,
  ]);

  if (activeConfig.is_active === false) {
    return null;
  }

  return (
    <div className="pv-ad-box">
      <div className="pv-ad-label">{labelText}</div>
      <div className="pv-ad-slot">
        {isCustomImageMode ? (
          <a
            href={activeConfig.target_url || "https://www.thepixelvest.com.ng"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "48px",
              textDecoration: "none",
              overflow: "hidden",
              borderRadius: "8px",
            }}
          >
            <img
              src={activeConfig.image_url}
              alt={labelText}
              style={{
                width: "100%",
                height: "48px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </a>
        ) : (
          <>
            <span className="pv-ad-placeholder">
              ⚡ Google AdSense • The Pixel Vest Partner Network
            </span>
            <ins
              className="adsbygoogle"
              style={{
                display: "inline-block",
                width: "100%",
                maxWidth: "380px",
                height: "50px",
                maxHeight: "50px",
              }}
              data-ad-client={
                activeConfig.adsense_client || ADSENSE_CLIENT_ID
              }
              data-ad-slot={activeConfig.adsense_slot || ADSENSE_UNIT_SLOT_ID}
            />
          </>
        )}
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
  const [highlightedNode, setHighlightedNode] = useState<number | null>(null);

  const [user, setUser] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  const [streakCount, setStreakCount] = useState<number>(0);

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

  const [siteAds, setSiteAds] =
    useState<Record<"top" | "bottom", SiteAdConfig>>(DEFAULT_AD_CONFIGS);

  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [inspectSoldNode, setInspectSoldNode] = useState<number | null>(null);
  const [walletSource, setWalletSource] = useState<"main" | "bonus">("main");
  const [unlockLoading, setUnlockLoading] = useState<boolean>(false);
  const [rewardResult, setRewardResult] = useState<{
    nodesUnlocked: { nodeId: number; amount: number; brandName: string }[];
    totalAmount: number;
    streakBonusEarned: number;
    roastIndex: number;
  } | null>(null);

  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [walletTab, setWalletTab] = useState<
    "fund" | "withdraw" | "dispute" | "referrals"
  >("fund");
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

  const [disputeAmount, setDisputeAmount] = useState<string>("500");
  const [disputeSender, setDisputeSender] = useState<string>("");
  const [disputeRefNote, setDisputeRefNote] = useState<string>("");
  const [disputeProofUrl, setDisputeProofUrl] = useState<string>("");
  const [disputeSubmitting, setDisputeSubmitting] = useState<boolean>(false);

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<
    "node" | "wallet" | "withdrawals" | "disputes" | "ads"
  >("node");
  const [adminPinInput, setAdminPinInput] = useState<string>("");
  const [adminCreditPhone, setAdminCreditPhone] = useState<string>("");
  const [adminCreditAmount, setAdminCreditAmount] = useState<string>("500");
  const [adminCreditType, setAdminCreditType] = useState<"main" | "bonus">(
    "main"
  );
  const [adminCrediting, setAdminCrediting] = useState<boolean>(false);

  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState<boolean>(false);

  const [disputesList, setDisputesList] = useState<any[]>([]);
  const [initiatedDepositsList, setInitiatedDepositsList] = useState<any[]>([]);
  const [loadingDisputes, setLoadingDisputes] = useState<boolean>(false);

  const [adminAdSlotPos, setAdminAdSlotPos] = useState<"top" | "bottom">("top");
  const [adminAdMode, setAdminAdMode] = useState<"adsense" | "custom">(
    "adsense"
  );
  const [adminAdClientId, setAdminAdClientId] =
    useState<string>(ADSENSE_CLIENT_ID);
  const [adminAdSlotId, setAdminAdSlotId] =
    useState<string>(ADSENSE_UNIT_SLOT_ID);
  const [adminAdCustomHtml, setAdminAdCustomHtml] = useState<string>("");
  const [adminAdImageUrl, setAdminAdImageUrl] = useState<string>("");
  const [adminAdTargetUrl, setAdminAdTargetUrl] = useState<string>("https://");
  const [adminAdLabel, setAdminAdLabel] = useState<string>(
    "SPONSORED BANNER AD"
  );
  const [adminAdSaving, setAdminAdSaving] = useState<boolean>(false);

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

    const savedStreak = Number(localStorage.getItem("pv_streak_count") || "0");
    setStreakCount(savedStreak % STREAK_TARGET_NODES);

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

    const savedPending = localStorage.getItem("pv_active_pending_tx");
    if (savedPending) {
      try {
        const parsed = JSON.parse(savedPending);
        setPendingTx(parsed);
        if (parsed.amount) setDisputeAmount(String(parsed.amount));
        if (parsed.ref) setDisputeRefNote(String(parsed.ref));
      } catch (e) {}
    }

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

    const localAds = localStorage.getItem("pixelvest_site_ads");
    if (localAds) {
      try {
        setSiteAds((prev) => ({ ...prev, ...JSON.parse(localAds) }));
      } catch (e) {}
    }

    const savedPhone = localStorage.getItem("pixelvest_active_phone");
    if (savedPhone) {
      fetchUserSession(savedPhone);
    }

    fetchSectorBoardData(1);
    fetchSiteAdsConfig();

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

  const fetchSiteAdsConfig = async () => {
    if (!supabase) return;
    try {
      const nextAds: Record<"top" | "bottom", SiteAdConfig> = {
        ...DEFAULT_AD_CONFIGS,
      };

      const { data: adRows } = await supabase.from("site_ads").select("*");
      if (adRows && adRows.length > 0) {
        adRows.forEach((row: any) => {
          if (row.slot_position === "top" || row.slot_position === "bottom") {
            const pos: "top" | "bottom" = row.slot_position;
            nextAds[pos] = { ...nextAds[pos], ...row };
          }
        });
      }

      const { data: backupAdRows } = await supabase
        .from("node_overrides")
        .select("*")
        .in("node_id", [-501, -502]);

      if (backupAdRows && backupAdRows.length > 0) {
        backupAdRows.forEach((b: any) => {
          try {
            const parsed = JSON.parse(b.logo_url || "{}");
            if (
              parsed.slot_position === "top" ||
              parsed.slot_position === "bottom"
            ) {
              const pos: "top" | "bottom" = parsed.slot_position;
              nextAds[pos] = { ...nextAds[pos], ...parsed };
            }
          } catch (e) {}
        });
      }

      setSiteAds(nextAds);
      localStorage.setItem("pixelvest_site_ads", JSON.stringify(nextAds));
    } catch (e) {}
  };

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

            await supabase.from("transactions").upsert(
              [
                {
                  user_phone: cleanPhone,
                  type: "deposit",
                  amount: amountNaira,
                  status: "completed",
                  reference: txRef,
                },
              ],
              { onConflict: "reference" }
            );
            break;
          }
        } catch (err) {
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    }
  };

  const persistNodeLockToDatabase = async (
    nodeId: number,
    soldRecord: Record<string, any>
  ) => {
    setSoldNodesMap((prev) => {
      const next = { ...prev, [nodeId]: soldRecord };
      localStorage.setItem("pixelvest_sold_nodes", JSON.stringify(next));
      return next;
    });

    if (!supabase) return;

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
              .insert([
                { node_id: nodeId, is_sold: Boolean(soldRecord.is_sold) },
              ]);
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
          "Account created! Unlock 5 nodes to claim your ₦100 Streak Bonus!",
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

  const handleNodeCardClick = (nodeId: number) => {
    const isSold = Boolean(soldNodesMap[nodeId]?.is_sold);
    if (isSold) {
      setInspectSoldNode(nodeId);
      return;
    }

    setSelectedNodes((prev) => {
      if (prev.includes(nodeId)) {
        return prev.filter((id) => id !== nodeId);
      } else {
        return [...prev, nodeId];
      }
    });
  };

  const handleUnlockSelectedNodes = async () => {
    const activeNodes = selectedNodes.filter(
      (id) => !soldNodesMap[id]?.is_sold
    );

    if (activeNodes.length === 0) {
      showToast("Please tap one or more available Golden Nodes first!", "info");
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const totalCost = activeNodes.length * NODE_PRICE;
    const mainBal = getMainBalance(user);
    const bonusBal = getBonusBalance(user);

    if (walletSource === "main" && mainBal < totalCost) {
      showToast(
        `Insufficient Main Wallet (₦${totalCost.toLocaleString()} needed for ${
          activeNodes.length
        } node${activeNodes.length > 1 ? "s" : ""}). Fund via Paystack!`,
        "error"
      );
      setFundAmount(String(Math.max(500, totalCost)));
      setWalletTab("fund");
      setShowWalletModal(true);
      return;
    }

    if (walletSource === "bonus" && bonusBal < totalCost) {
      showToast(
        `Insufficient Play Bonus (₦${totalCost.toLocaleString()} needed). Switch to Main Wallet!`,
        "error"
      );
      return;
    }

    setUnlockLoading(true);

    try {
      let validNodesToUnlock = [...activeNodes];
      if (supabase) {
        const { data: liveSoldRows } = await supabase
          .from("grid_nodes")
          .select("*")
          .in("node_id", activeNodes);

        if (liveSoldRows && liveSoldRows.length > 0) {
          const alreadySoldIds = new Set<number>();
          liveSoldRows.forEach((r: any) => {
            if (r.is_sold) {
              alreadySoldIds.add(Number(r.node_id));
            }
          });

          if (alreadySoldIds.size > 0) {
            setSoldNodesMap((prev) => {
              const next = { ...prev };
              liveSoldRows.forEach((r: any) => {
                if (r.is_sold) next[Number(r.node_id)] = r;
              });
              return next;
            });
            validNodesToUnlock = activeNodes.filter(
              (id) => !alreadySoldIds.has(id)
            );
            setSelectedNodes(validNodesToUnlock);

            if (validNodesToUnlock.length === 0) {
              showToast(
                "Selected node(s) were just unlocked by another player!",
                "error"
              );
              setUnlockLoading(false);
              return;
            }
          }
        }
      }

      const finalCost = validNodesToUnlock.length * NODE_PRICE;
      const cleanUserPhone = normalizePhone(String(user.phone));

      let totalPrizeWon = 0;
      const unlockedBreakdown: {
        nodeId: number;
        amount: number;
        brandName: string;
      }[] = [];

      for (const nodeId of validNodesToUnlock) {
        const customOverride = nodeOverridesMap[nodeId];
        const defaultBrand = DEFAULT_SECTOR_1_BRAND_NODES[nodeId];
        const hasCustomPrize =
          customOverride &&
          customOverride.custom_prize !== undefined &&
          customOverride.custom_prize !== null &&
          customOverride.custom_prize !== "";

        const prizeWon = hasCustomPrize
          ? Number(customOverride.custom_prize)
          : getExact12TierNodePrize(nodeId);

        totalPrizeWon += prizeWon;

        const brandTitle =
          customOverride?.brand_name ||
          defaultBrand?.brand_name ||
          `Golden Node #${nodeId}`;
        const brandLogo =
          customOverride?.logo_url || defaultBrand?.logo_url || null;

        unlockedBreakdown.push({
          nodeId,
          amount: prizeWon,
          brandName: brandTitle,
        });

        const soldRecord = {
          node_id: nodeId,
          owner_phone: cleanUserPhone,
          owner_name: user.full_name || cleanUserPhone,
          brand_name: brandTitle,
          logo_url: brandLogo,
          is_sold: true,
          prize_won: prizeWon,
          unlocked_at: new Date().toISOString(),
        };

        await persistNodeLockToDatabase(nodeId, soldRecord);
      }

      const prevStreak = streakCount;
      const totalProgress = prevStreak + validNodesToUnlock.length;
      const completedStreaks = Math.floor(totalProgress / STREAK_TARGET_NODES);
      const newStreakMod = totalProgress % STREAK_TARGET_NODES;
      const streakBonusEarned = completedStreaks * STREAK_BONUS_REWARD;

      setStreakCount(newStreakMod);
      localStorage.setItem("pv_streak_count", String(newStreakMod));

      const updatedMain =
        walletSource === "main"
          ? mainBal - finalCost + totalPrizeWon
          : mainBal + totalPrizeWon;
      const updatedBonus =
        (walletSource === "bonus" ? bonusBal - finalCost : bonusBal) +
        streakBonusEarned;

      const referrerPhone = user.referred_by
        ? normalizePhone(String(user.referred_by))
        : null;
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

      const randomRoastIdx =
        (validNodesToUnlock[0] + Math.floor(Math.random() * 250)) %
        EMPTY_NODE_ROASTS_AND_QUOTES.length;

      setSelectedNodes([]);
      setRewardResult({
        nodesUnlocked: unlockedBreakdown,
        totalAmount: totalPrizeWon,
        streakBonusEarned,
        roastIndex: randomRoastIdx,
      });
    } catch (err) {
      console.error("Batch unlock error:", err);
      showToast("Error unlocking nodes. Please try again.", "error");
    } finally {
      setUnlockLoading(false);
    }
  };

  const handleFundWithPaystack = async () => {
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

    const cleanPhone = normalizePhone(user.phone);
    const txRef = `PV_${cleanPhone}_${Date.now()}`;

    if (supabase) {
      try {
        await supabase.from("transactions").upsert(
          [
            {
              user_phone: cleanPhone,
              type: "deposit_initiated",
              amount: amountNaira,
              status: "initiated",
              reference: txRef,
            },
          ],
          { onConflict: "reference" }
        );
      } catch (e) {}
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

      const newPending = {
        ref: txRef,
        amount: amountNaira,
        phone: cleanPhone,
        time: Date.now(),
      };
      setPendingTx(newPending);
      setDisputeAmount(String(amountNaira));
      setDisputeRefNote(txRef);
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
            "Sent money but window closed? Open 'Dispute' tab to claim your deposit!",
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

      const withdrawalObj = {
        user_phone: cleanPhone,
        amount: amt,
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const localW = JSON.parse(
        localStorage.getItem("pv_local_withdrawals") || "[]"
      );
      localW.unshift({ ...withdrawalObj, id: `LW_${Date.now()}` });
      localStorage.setItem("pv_local_withdrawals", JSON.stringify(localW));

      if (supabase) {
        const { error: wErr } = await supabase.from("withdrawals").insert([
          {
            user_phone: cleanPhone,
            amount: amt,
            bank_name: bankName.trim(),
            account_number: accountNumber.trim(),
            account_name: accountName.trim(),
            status: "pending",
          },
        ]);

        if (wErr) {
          await supabase.from("withdrawals").insert([
            {
              user_phone: cleanPhone,
              amount: amt,
              bank_name: `${bankName.trim()} - ${accountNumber.trim()} (${accountName.trim()})`,
            },
          ]);
        }

        const backupId = -1000000 - (Math.floor(Date.now() / 1000) % 900000);
        await supabase.from("node_overrides").upsert([
          {
            node_id: backupId,
            brand_name: "WITHDRAWAL_REQ",
            logo_url: JSON.stringify({
              backup_id: backupId,
              ...withdrawalObj,
            }),
            custom_prize: amt,
          },
        ]);
      }

      setShowWalletModal(false);
      setWithdrawAmount("");
      setWithdrawPinInput("");
      showToast(
        `✅ ₦${amt.toLocaleString()} Cash Out submitted! Processing to ${bankName}.`,
        "success"
      );
    } catch (err) {
      showToast("Could not submit withdrawal. Try again.", "error");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleDisputeProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 320;
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
        const compressedDataUrl = canvas.toDataURL("image/webp", 0.8);
        setDisputeProofUrl(compressedDataUrl);
        showToast("Receipt screenshot attached!", "success");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPaymentDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowWalletModal(false);
      setShowAuthModal(true);
      return;
    }

    const amt = Number(disputeAmount);
    if (isNaN(amt) || amt < 100) {
      showToast("Enter the valid amount you transferred (Min ₦100).", "error");
      return;
    }
    if (!disputeSender.trim()) {
      showToast(
        "Please enter Sender Name & Bank (e.g. OPay / PalmPay).",
        "error"
      );
      return;
    }

    setDisputeSubmitting(true);
    try {
      const cleanPhone = normalizePhone(user.phone);
      const disputeRecord = {
        user_phone: cleanPhone,
        user_name: user.full_name || cleanPhone,
        amount: amt,
        sender_info: disputeSender.trim(),
        reference_note:
          disputeRefNote.trim() || pendingTx?.ref || "Bank Transfer",
        proof_url: disputeProofUrl || null,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const localD = JSON.parse(
        localStorage.getItem("pv_local_disputes") || "[]"
      );
      localD.unshift({ ...disputeRecord, id: `LD_${Date.now()}` });
      localStorage.setItem("pv_local_disputes", JSON.stringify(localD));

      if (supabase) {
        await supabase.from("payment_disputes").insert([disputeRecord]);

        const backupDisputeId =
          -2000000 - (Math.floor(Date.now() / 1000) % 900000);
        await supabase.from("node_overrides").upsert([
          {
            node_id: backupDisputeId,
            brand_name: "PAYMENT_DISPUTE",
            logo_url: JSON.stringify({
              backup_id: backupDisputeId,
              ...disputeRecord,
            }),
            custom_prize: amt,
          },
        ]);
      }

      setDisputeSender("");
      setDisputeRefNote("");
      setDisputeProofUrl("");
      setShowWalletModal(false);
      showToast(
        "✅ Payment Dispute received! Admin will verify & credit your wallet shortly.",
        "success"
      );
    } catch (err) {
      showToast("Dispute submitted! Admin notified.", "success");
    } finally {
      setDisputeSubmitting(false);
    }
  }; const fetchAdminWithdrawals = async () => {
    setLoadingWithdrawals(true);
    const combined: any[] = [];
    const seenKeys = new Set<string>();

    try {
      if (supabase) {
        const { data: wRows } = await supabase
          .from("withdrawals")
          .select("*")
          .limit(100);

        if (wRows && wRows.length > 0) {
          wRows.forEach((r: any) => {
            const key = `${r.user_phone}_${r.amount}_${r.account_number}`;
            seenKeys.add(key);
            combined.push(r);
          });
        }

        const { data: backupRows } = await supabase
          .from("node_overrides")
          .select("*")
          .lte("node_id", -1000000)
          .gte("node_id", -1999999);

        if (backupRows && backupRows.length > 0) {
          backupRows.forEach((b: any) => {
            try {
              const parsed = JSON.parse(b.logo_url || "{}");
              const key = `${parsed.user_phone}_${parsed.amount}_${parsed.account_number}`;
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                combined.push({ ...parsed, backup_node_id: b.node_id });
              }
            } catch (e) {}
          });
        }
      }

      const localW = JSON.parse(
        localStorage.getItem("pv_local_withdrawals") || "[]"
      );
      localW.forEach((lw: any) => {
        const key = `${lw.user_phone}_${lw.amount}_${lw.account_number}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          combined.push(lw);
        }
      });

      combined.sort((a, b) => {
        const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tB - tA;
      });

      setWithdrawalsList(combined);
    } catch (e) {}
    setLoadingWithdrawals(false);
  };

  const markWithdrawalPaid = async (row: any) => {
    try {
      if (supabase) {
        if (row.id && !String(row.id).startsWith("LW_")) {
          await supabase
            .from("withdrawals")
            .update({ status: "paid" })
            .eq("id", row.id);
        } else {
          await supabase
            .from("withdrawals")
            .update({ status: "paid" })
            .match({ user_phone: row.user_phone, amount: row.amount });
        }

        if (row.backup_node_id || row.backup_id) {
          const bId = row.backup_node_id || row.backup_id;
          const updatedJson = JSON.stringify({ ...row, status: "paid" });
          await supabase
            .from("node_overrides")
            .update({ logo_url: updatedJson })
            .eq("node_id", bId);
        }
      }

      const localW = JSON.parse(
        localStorage.getItem("pv_local_withdrawals") || "[]"
      ).map((item: any) =>
        item.user_phone === row.user_phone && item.amount === row.amount
          ? { ...item, status: "paid" }
          : item
      );
      localStorage.setItem("pv_local_withdrawals", JSON.stringify(localW));

      showToast(
        `✅ Marked ₦${Number(row.amount || 0).toLocaleString()} as PAID!`,
        "success"
      );
      fetchAdminWithdrawals();
    } catch (e) {}
  };

  const fetchAdminDisputes = async () => {
    setLoadingDisputes(true);
    const combined: any[] = [];
    const seenKeys = new Set<string>();

    try {
      if (supabase) {
        const { data: dRows } = await supabase
          .from("payment_disputes")
          .select("*")
          .limit(100);

        if (dRows && dRows.length > 0) {
          dRows.forEach((r: any) => {
            const key = `${r.user_phone}_${r.amount}_${r.sender_info}`;
            seenKeys.add(key);
            combined.push(r);
          });
        }

        const { data: backupRows } = await supabase
          .from("node_overrides")
          .select("*")
          .lte("node_id", -2000000)
          .gte("node_id", -2999999);

        if (backupRows && backupRows.length > 0) {
          backupRows.forEach((b: any) => {
            try {
              const parsed = JSON.parse(b.logo_url || "{}");
              const key = `${parsed.user_phone}_${parsed.amount}_${parsed.sender_info}`;
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                combined.push({ ...parsed, backup_node_id: b.node_id });
              }
            } catch (e) {}
          });
        }

        const { data: txRows } = await supabase
          .from("transactions")
          .select("*")
          .eq("status", "initiated")
          .limit(50);

        if (txRows && txRows.length > 0) {
          setInitiatedDepositsList(txRows);
        }
      }

      const localD = JSON.parse(
        localStorage.getItem("pv_local_disputes") || "[]"
      );
      localD.forEach((ld: any) => {
        const key = `${ld.user_phone}_${ld.amount}_${ld.sender_info}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          combined.push(ld);
        }
      });

      combined.sort((a, b) => {
        const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tB - tA;
      });

      setDisputesList(combined);
    } catch (e) {}
    setLoadingDisputes(false);
  };

  const handleResolveDispute = async (
    dispute: any,
    action: "approved" | "rejected"
  ) => {
    try {
      const targetPhone = normalizePhone(dispute.user_phone || "");
      const amt = Number(dispute.amount || 0);

      if (action === "approved" && targetPhone && amt > 0 && supabase) {
        const { data: targetUser } = await supabase
          .from("users")
          .select("wallet_balance")
          .eq("phone", targetPhone)
          .maybeSingle();

        const currentBal = Number(targetUser?.wallet_balance ?? 0);
        await supabase
          .from("users")
          .update({ wallet_balance: currentBal + amt })
          .eq("phone", targetPhone);

        if (user && normalizePhone(user.phone) === targetPhone) {
          fetchUserSession(targetPhone);
        }
      }

      if (supabase) {
        if (dispute.id && !String(dispute.id).startsWith("LD_")) {
          await supabase
            .from("payment_disputes")
            .update({ status: action })
            .eq("id", dispute.id);
        } else {
          await supabase
            .from("payment_disputes")
            .update({ status: action })
            .match({ user_phone: dispute.user_phone, amount: dispute.amount });
        }

        if (dispute.backup_node_id || dispute.backup_id) {
          const bId = dispute.backup_node_id || dispute.backup_id;
          const updatedJson = JSON.stringify({ ...dispute, status: action });
          await supabase
            .from("node_overrides")
            .update({ logo_url: updatedJson })
            .eq("node_id", bId);
        }
      }

      const localD = JSON.parse(
        localStorage.getItem("pv_local_disputes") || "[]"
      ).map((item: any) =>
        item.user_phone === dispute.user_phone && item.amount === dispute.amount
          ? { ...item, status: action }
          : item
      );
      localStorage.setItem("pv_local_disputes", JSON.stringify(localD));

      showToast(
        action === "approved"
          ? `✅ Approved! ₦${amt.toLocaleString()} credited to ${targetPhone}'s Main Wallet!`
          : `Dispute marked as Rejected.`,
        action === "approved" ? "success" : "info"
      );
      fetchAdminDisputes();
    } catch (e) {
      showToast("Error updating dispute.", "error");
    }
  };

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
    const defaultBrand = DEFAULT_SECTOR_1_BRAND_NODES[idNum];
    const defaultGift = getExact12TierNodePrize(idNum);

    setEditBrandName(
      existingOverride?.brand_name ||
        existingSold?.brand_name ||
        defaultBrand?.brand_name ||
        ""
    );
    setEditLogoUrl(
      existingOverride?.logo_url ||
        existingSold?.logo_url ||
        defaultBrand?.logo_url ||
        ""
    );
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
        const MAX_SIZE = 240;
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
        const compressedDataUrl = canvas.toDataURL("image/webp", 0.88);
        setEditLogoUrl(compressedDataUrl);
        showToast("High-res picture uploaded for Node!", "success");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAdminLoadAdSlot = (slot: "top" | "bottom") => {
    setAdminAdSlotPos(slot);
    const cfg = siteAds[slot] || DEFAULT_AD_CONFIGS[slot];
    setAdminAdMode(cfg.ad_mode || "adsense");
    setAdminAdClientId(cfg.adsense_client || ADSENSE_CLIENT_ID);
    setAdminAdSlotId(cfg.adsense_slot || ADSENSE_UNIT_SLOT_ID);
    setAdminAdCustomHtml(cfg.custom_html || "");
    setAdminAdImageUrl(cfg.image_url || "");
    setAdminAdTargetUrl(cfg.target_url || "https://");
    setAdminAdLabel(cfg.sponsor_label || "SPONSORED BANNER AD");
  };

const handleAdminSaveAdConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAdSaving(true);

    const topPayload: SiteAdConfig = {
      slot_position: "top",
      ad_mode: adminAdMode,
      adsense_client: adminAdClientId.trim() || ADSENSE_CLIENT_ID,
      adsense_slot: adminAdSlotId.trim() || ADSENSE_UNIT_SLOT_ID,
      custom_html: adminAdCustomHtml.trim(),
      image_url: adminAdImageUrl.trim(),
      target_url: adminAdTargetUrl.trim(),
      sponsor_label: adminAdLabel.trim() || "SPONSORED BANNER AD",
      is_active: true,
    };

    const bottomPayload: SiteAdConfig = {
      ...topPayload,
      slot_position: "bottom",
    };

    try {
      const updatedSiteAds = {
        top: topPayload,
        bottom: bottomPayload,
      };
      setSiteAds(updatedSiteAds);
      localStorage.setItem("pixelvest_site_ads", JSON.stringify(updatedSiteAds));

      if (supabase) {
        await supabase
          .from("site_ads")
          .upsert([topPayload, bottomPayload], { onConflict: "slot_position" });

        await supabase.from("node_overrides").upsert([
          {
            node_id: -501,
            brand_name: "SITE_AD_CONFIG",
            logo_url: JSON.stringify(topPayload),
            custom_prize: 0,
          },
          {
            node_id: -502,
            brand_name: "SITE_AD_CONFIG",
            logo_url: JSON.stringify(bottomPayload),
            custom_prize: 0,
          },
        ]);
      }

      showToast(
        "✅ Both Top & Bottom Banner Ads synced and updated!",
        "success"
      );
    } catch (e) {
      showToast("Ad slots saved locally!", "success");
    } finally {
      setAdminAdSaving(false);
    }
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
      const updatedMap = { ...nodeOverridesMap, [idNum]: payload };
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
    setHighlightedNode(cleanNum);

    if (!soldNodesMap[cleanNum]?.is_sold) {
      setSelectedNodes((prev) =>
        prev.includes(cleanNum) ? prev : [...prev, cleanNum]
      );
      showToast(
        `Node #${cleanNum.toLocaleString()} highlighted & selected! Tap more nodes or checkout below.`,
        "success"
      );
    } else {
      showToast(
        `Jumped to Node #${cleanNum.toLocaleString()} (Already Sold/Locked).`,
        "info"
      );
    }

    setTimeout(() => {
      const el = document.getElementById(`pv-node-${cleanNum}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 180);

    setTimeout(() => {
      setHighlightedNode((prev) => (prev === cleanNum ? null : prev));
    }, 7000);
  };

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

  return (
    <div className="pv-root">
      <style>{`
      * {
          box-sizing: border-box;
          max-width: 100%;
        }
        html, body, .pv-root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          max-width: 100vw !important;
          overflow-x: hidden !important;
          overscroll-behavior-x: none !important;
          touch-action: pan-y !important;
          position: relative !important;
          background-color: #07090e !important;
          color: #ffffff !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }
        .pv-container { max-width: 430px; margin: 0 auto; padding: 8px 6px 190px 6px; }
        .pv-ticker { background-color: #082016; border: 1px solid rgba(16, 185, 129, 0.45); border-radius: 12px; padding: 10px 12px; margin-bottom: 14px; text-align: center; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4); }
        .pv-ticker-text { margin: 0; color: #fbbf24 !important; font-weight: 800; font-size: 13px; line-height: 1.35; }
        .pv-header-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
        .pv-brand-wrap { display: flex; align-items: center; gap: 8px; }
        .pv-brand-title { margin: 0; font-size: 21px; font-weight: 900; letter-spacing: 0.4px; color: #10b981 !important; display: flex; align-items: center; gap: 6px; }
        .pv-triangle { color: #fbbf24 !important; font-size: 19px; }
        .pv-install-btn { background-color: #10b981 !important; border: 1px solid #34d399 !important; color: #000000 !important; font-weight: 900; font-size: 11px; padding: 8px 12px; border-radius: 9px; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3); }
        .pv-subtitle { margin: 0 0 10px 0; color: #9ca3af !important; font-size: 12.5px; line-height: 1.4; }
        .pv-streak-card { background: linear-gradient(90deg, #161224 0%, #0d1f1a 100%); border: 1px solid rgba(251, 191, 36, 0.45); border-radius: 12px; padding: 9px 12px; margin-bottom: 12px; }
        .pv-streak-top { display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 800; margin-bottom: 6px; }
        .pv-streak-track { width: 100%; height: 8px; background-color: #090b10; border-radius: 99px; overflow: hidden; border: 1px solid #262b38; }
        .pv-streak-fill { height: 100%; background: linear-gradient(90deg, #fbbf24, #10b981); border-radius: 99px; transition: width 0.3s ease; }
        .pv-wallets-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .pv-wallet-main { background-color: #081e17; border: 1px solid rgba(16, 185, 129, 0.55); border-radius: 12px; padding: 11px 13px; }
        .pv-wallet-bonus { background-color: #211708; border: 1px solid rgba(245, 158, 11, 0.55); border-radius: 12px; padding: 11px 13px; }
        .pv-wallet-label { margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af !important; }
        .pv-wallet-label-gold { margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #fcd34d !important; }
        .pv-wallet-val-main { margin: 4px 0 0 0; font-size: 20px; font-weight: 900; color: #10b981 !important; }
        .pv-wallet-val-bonus { margin: 4px 0 0 0; font-size: 20px; font-weight: 900; color: #fbbf24 !important; }
        .pv-actions-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 10px; }
        .pv-btn-emerald { background-color: #10b981 !important; color: #000000 !important; font-weight: 900; font-size: 13px; padding: 10px 16px; border-radius: 11px; border: none; cursor: pointer; flex: 1; text-align: center; }
        .pv-btn-refer { background-color: #211708 !important; color: #fbbf24 !important; border: 1px solid rgba(245, 158, 11, 0.5) !important; font-weight: 800; font-size: 12px; padding: 10px 13px; border-radius: 11px; cursor: pointer; }
        .pv-btn-logout { background-color: #291216 !important; color: #fda4af !important; border: 1px solid rgba(244, 63, 94, 0.4) !important; font-weight: 800; font-size: 13px; padding: 10px 15px; border-radius: 11px; cursor: pointer; }
        .pv-dispute-banner { width: 100%; background-color: #1c1317; border: 1px solid rgba(244, 63, 94, 0.45); color: #fda4af !important; border-radius: 10px; padding: 8px 12px; font-size: 11.5px; font-weight: 800; text-align: center; cursor: pointer; margin-bottom: 10px; }
        .pv-divider { border: 0; border-top: 1px solid #1f2430; margin: 12px 0; }
        .pv-legend { margin-bottom: 12px; font-size: 12px; }
        .pv-legend-item { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
        .pv-dot-gold { width: 14px; height: 14px; border-radius: 4px; background: linear-gradient(135deg, #fde047, #d97706); border: 1px solid #fef08a; display: inline-block; flex-shrink: 0; }
        .pv-dot-selected { width: 14px; height: 14px; border-radius: 4px; background: linear-gradient(135deg, #34d399, #059669); border: 2px solid #ffffff; display: inline-block; flex-shrink: 0; }
        .pv-dot-sold { width: 14px; height: 14px; border-radius: 4px; background-color: #12151e; border: 1px solid #374151; display: inline-block; flex-shrink: 0; }
        .pv-search-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .pv-input { flex: 1; background-color: #12151e !important; border: 1px solid #2d3343 !important; color: #ffffff !important; border-radius: 10px; padding: 10px 13px; font-size: 14px; outline: none; }
        .pv-btn-go { background-color: #10b981 !important; color: #000000 !important; font-weight: 900; font-size: 14px; padding: 10px 18px; border-radius: 10px; border: none; cursor: pointer; }
        .pv-refresh-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
        .pv-btn-dark { background-color: #12151e !important; border: 1px solid #262b38 !important; color: #e5e7eb !important; font-weight: 700; font-size: 12px; padding: 9px 14px; border-radius: 10px; cursor: pointer; }
        .pv-ad-box { margin: 10px 0 !important; padding: 5px 8px !important; background-color: #0c0f16 !important; border: 1px solid #1e2433 !important; border-radius: 11px !important; text-align: center !important; height: 68px !important; max-height: 68px !important; min-height: 68px !important; overflow: hidden !important; }
        .pv-ad-label { font-size: 9px !important; line-height: 11px !important; font-weight: 700 !important; letter-spacing: 1px !important; color: #6b7280 !important; text-transform: uppercase !important; margin-bottom: 3px !important; }
        .pv-ad-slot { position: relative !important; width: 100% !important; height: 48px !important; max-height: 48px !important; min-height: 48px !important; overflow: hidden !important; display: flex !important; align-items: center !important; justify-content: center !important; background-color: #080a0f !important; border-radius: 8px !important; }
        .pv-ad-slot ins.adsbygoogle, .pv-ad-slot iframe { height: 48px !important; max-height: 48px !important; min-height: 48px !important; overflow: hidden !important; }
        .pv-ad-placeholder { position: absolute !important; font-size: 11px !important; font-weight: 700 !important; color: #10b981 !important; opacity: 0.75 !important; pointer-events: none !important; white-space: nowrap !important; }
        .pv-sector-info { font-size: 13px; color: #9ca3af !important; margin: 0 0 10px 0; line-height: 1.4; }
        .pv-sector-highlight { color: #fbbf24 !important; font-weight: 800; }
        .pv-pagination-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px; }
        .pv-page-btn { background-color: #12151e !important; border: 1px solid #262b38 !important; color: #ffffff !important; font-weight: 800; font-size: 12px; padding: 8px 14px; border-radius: 11px; cursor: pointer; min-width: 80px; text-align: center; line-height: 1.25; }
        .pv-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pv-sector-jump { display: flex; align-items: center; gap: 6px; }
        .pv-sector-input { width: 74px; background-color: #12151e !important; border: 1px solid #2d3343 !important; color: #ffffff !important; font-weight: 800; font-size: 13px; padding: 9px 8px; border-radius: 10px; text-align: center; }
        .pv-sector-btn { background-color: #211708 !important; border: 1px solid #f59e0b !important; color: #fbbf24 !important; font-weight: 800; font-size: 12px; padding: 9px 13px; border-radius: 10px; cursor: pointer; }
        .pv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
        .pv-node-card { aspect-ratio: 1 / 1; min-height: 114px; border-radius: 15px; padding: 7px 8px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; cursor: pointer; transition: transform 0.14s ease, box-shadow 0.14s ease; user-select: none; position: relative; }
        .pv-node-card:active { transform: scale(0.95); }
        .pv-node-available { background: linear-gradient(180deg, #fcd34d 0%, #f59e0b 55%, #d97706 100%) !important; border: 1px solid #fef08a !important; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15); }
        .pv-node-selected { background: linear-gradient(180deg, #34d399 0%, #10b981 55%, #059669 100%) !important; border: 2.5px solid #ffffff !important; box-shadow: 0 0 18px rgba(16, 185, 129, 0.75) !important; transform: translateY(-2px); }
        @keyframes pvPulseGlow { 0%, 100% { box-shadow: 0 0 0 3px #00f2fe, 0 0 24px #10b981; transform: scale(1.03); } 50% { box-shadow: 0 0 0 6px #fbbf24, 0 0 32px #fbbf24; transform: scale(0.98); } }
        .pv-node-highlighted { animation: pvPulseGlow 1.1s infinite ease-in-out !important; z-index: 5; }
        .pv-node-sold { background-color: #12151e !important; border: 1px solid #262b38 !important; opacity: 0.85; }
        .pv-node-top { width: 100%; display: flex; justify-content: space-between; align-items: flex-start; gap: 3px; }
        .pv-node-num-avail { font-size: 11px; font-weight: 900; color: #111827 !important; }
        .pv-node-num-sold { font-size: 11px; font-weight: 900; color: #9ca3af !important; }
        .pv-node-badge { font-size: 8px; font-weight: 800; padding: 2px 4px; border-radius: 4px; background-color: rgba(0, 0, 0, 0.42); color: #ffffff !important; max-width: 58px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pv-node-center { display: flex; align-items: center; justify-content: center; margin: auto 0; width: 100%; }
        .pv-node-diamond { font-size: 28px; line-height: 1; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25)); }
        .pv-node-logo { width: 58px; height: 58px; border-radius: 12px; object-fit: cover; background-color: #ffffff; padding: 2px; box-shadow: 0 3px 8px rgba(0,0,0,0.38); }
        .pv-node-price-avail { font-size: 12px; font-weight: 900; color: #111827 !important; }
        .pv-node-price-selected { font-size: 11px; font-weight: 900; color: #052e16 !important; background-color: rgba(255,255,255,0.85); padding: 2px 6px; border-radius: 5px; }
        .pv-node-price-sold { font-size: 10px; font-weight: 900; color: #ef4444 !important; letter-spacing: 0.4px; }
        .pv-cart-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 9500; background: linear-gradient(180deg, #0d131d 0%, #070a10 100%); border-top: 2px solid #10b981; box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.85); padding: 10px 14px 14px 14px; }
        .pv-cart-inner { max-width: 440px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }
        .pv-info-card { margin-top: 24px; background-color: #0c0f16; border: 1px solid #1e2433; border-radius: 14px; padding: 14px; font-size: 12px; color: #9ca3af !important; line-height: 1.55; }
        .pv-info-title { margin: 0 0 8px 0; font-size: 14px; font-weight: 800; color: #ffffff !important; }
        .pv-footer { margin-top: 24px; padding-top: 18px; border-top: 1px solid #1a1f2c; text-align: center; font-size: 12px; color: #9ca3af !important; }
        .pv-footer-links { display: flex; justify-content: center; gap: 14px; margin-top: 10px; }
        .pv-link-btn { background: none !important; border: none !important; color: #9ca3af !important; text-decoration: underline; font-size: 11px; cursor: pointer; padding: 0; }
        .pv-modal-backdrop { position: fixed; inset: 0; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.84); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .pv-modal-card { background-color: #12151e; border: 1px solid #2d3343; border-radius: 18px; max-width: 380px; width: 100%; padding: 20px; color: #ffffff !important; max-height: 90vh; overflow-y: auto; }
        .pv-toast { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 10000; background-color: #10b981; color: #000000 !important; font-weight: 900; font-size: 13px; padding: 12px 18px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.6); max-width: 340px; width: 90%; text-align: center; }
      `}</style>

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
        <div className="pv-ticker">
          <p className="pv-ticker-text">{LIVE_TICKER_MESSAGES[tickerIndex]}</p>
        </div>

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

        <p className="pv-subtitle">
          1,000,000 Nodes • ₦22,000,000 Prize Vault (30% Win Rate!) • Tap 1 or
          More Nodes (₦100)
        </p>

        <div className="pv-streak-card">
          <div className="pv-streak-top">
            <span style={{ color: "#fbbf24" }}>
              🔥 Loyalty Streak: {streakCount} / {STREAK_TARGET_NODES} Nodes
            </span>
            <span style={{ color: "#10b981" }}>
              Unlock {STREAK_TARGET_NODES - streakCount} more = +₦100 Free
              Bonus!
            </span>
          </div>
          <div className="pv-streak-track">
            <div
              className="pv-streak-fill"
              style={{
                width: `${Math.min(
                  100,
                  (streakCount / STREAK_TARGET_NODES) * 100
                )}%`,
              }}
            />
          </div>
        </div>

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

        <button
          type="button"
          onClick={() => {
            if (!user) {
              setShowAuthModal(true);
            } else {
              setWalletTab("dispute");
              setShowWalletModal(true);
            }
          }}
          className="pv-dispute-banner"
        >
          🚨 Deposited via Paystack &amp; Not Reflecting? Tap Here to Submit
          Payment Dispute
        </button>

        <hr className="pv-divider" />

        <div className="pv-legend">
          <div className="pv-legend-item">
            <span className="pv-dot-gold" />
            <span style={{ color: "#ffffff", fontWeight: 700 }}>
              Available Node (Tap to Select • ₦100)
            </span>
          </div>
          <div className="pv-legend-item">
            <span className="pv-dot-selected" />
            <span style={{ color: "#34d399", fontWeight: 700 }}>
              Selected in Your Cart (Tap Multiple to Unlock Together!)
            </span>
          </div>
          <div className="pv-legend-item">
            <span className="pv-dot-sold" />
            <span style={{ color: "#9ca3af" }}>
              Sold Node (Darkened • Locked • Logo Still Visible)
            </span>
          </div>
        </div>

        <div className="pv-search-row">
          <input
            type="number"
            min={1}
            max={1000000}
            value={searchNodeInput}
            onChange={(e) => setSearchNodeInput(e.target.value)}
            placeholder="Search Node # (1 - 1,000,000)"
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
              const targetNode =
                selectedNodes[0] || highlightedNode || startNodeNum;
              handleAdminLoadNode(String(targetNode));
              fetchAdminWithdrawals();
              fetchAdminDisputes();
              setShowAdminModal(true);
            }}
            className="pv-sector-btn"
          >
            ⚙️ Admin Studio
          </button>
        </div>

     <AdSenseBanner
          config={
            siteAds.bottom?.ad_mode === "custom" && siteAds.bottom?.image_url
              ? siteAds.bottom
              : siteAds.top
          }
          defaultLabel="SPONSORED PARTNER AD"
        />

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

        <div className="pv-grid">
          {sectorNodes.map((nodeId) => {
            const soldInfo = soldNodesMap[nodeId];
            const isSold = Boolean(soldInfo?.is_sold);
            const isSelected = selectedNodes.includes(nodeId);
            const isHighlighted = highlightedNode === nodeId;

            const override = nodeOverridesMap[nodeId];
            const defaultBrand = DEFAULT_SECTOR_1_BRAND_NODES[nodeId];
            const displayBrand =
              override?.brand_name ||
              soldInfo?.brand_name ||
              defaultBrand?.brand_name;
            const displayLogo =
              override?.logo_url ||
              soldInfo?.logo_url ||
              defaultBrand?.logo_url;

            return (
              <div
                id={`pv-node-${nodeId}`}
                key={nodeId}
                onClick={() => handleNodeCardClick(nodeId)}
                className={`pv-node-card ${
                  isSold
                    ? "pv-node-sold"
                    : isSelected
                    ? "pv-node-selected"
                    : "pv-node-available"
                } ${isHighlighted ? "pv-node-highlighted" : ""}`}
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
                      {isSold ? "🔒" : isSelected ? "✅" : "💎"}
                    </span>
                  )}
                </div>
                <div>
                  <span
                    className={
                      isSold
                        ? "pv-node-price-sold"
                        : isSelected
                        ? "pv-node-price-selected"
                        : "pv-node-price-avail"
                    }
                  >
                    {isSold
                      ? "SOLD • LOCKED"
                      : isSelected
                      ? "✓ SELECTED"
                      : "₦100"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <AdSenseBanner
          config={siteAds.bottom}
          defaultLabel="SPONSORED PARTNER AD"
        />

        <section className="pv-info-card">
          <h2 className="pv-info-title">
            The Pixel Vest — Nigeria&apos;s 1,000,000 Digital Node Grid
          </h2>
          <p style={{ margin: "0 0 8px 0" }}>
            Select single or multiple digital nodes for ₦100 each, enjoy a 30%
            instant cash win rate across 300,000 winning vaults, and earn
            guaranteed <strong>+₦100 Loyalty Streak Bonuses</strong> every 5
            nodes you unlock!
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
                const targetNode =
                  selectedNodes[0] || highlightedNode || startNodeNum;
                handleAdminLoadNode(String(targetNode));
                fetchAdminWithdrawals();
                fetchAdminDisputes();
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

      {selectedNodes.length > 0 && (
        <div className="pv-cart-bar">
          <div className="pv-cart-inner">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: "#ffffff" }}>
                <span style={{ color: "#10b981" }}>
                  {selectedNodes.length} Node
                  {selectedNodes.length > 1 ? "s" : ""} Selected
                </span>{" "}
                • Total:{" "}
                <span style={{ color: "#fbbf24", fontWeight: 900 }}>
                  ₦{(selectedNodes.length * NODE_PRICE).toLocaleString()}
                </span>
                <div
                  style={{
                    fontSize: 10,
                    color: "#9ca3af",
                    maxWidth: 250,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginTop: 2,
                  }}
                >
                  Nodes: {selectedNodes.map((n) => `#${n}`).join(", ")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {isAdminUnlocked && selectedNodes.length === 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      handleAdminLoadNode(String(selectedNodes[0]));
                      setAdminTab("node");
                      setShowAdminModal(true);
                    }}
                    className="pv-sector-btn"
                    style={{ padding: "6px 9px", fontSize: 10 }}
                  >
                    ⚙️ Edit #{selectedNodes[0]}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedNodes([])}
                  className="pv-btn-dark"
                  style={{ padding: "6px 10px", fontSize: 11 }}
                >
                  Clear ✕
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setWalletSource("main")}
                style={{
                  flex: 1,
                  padding: "7px 8px",
                  borderRadius: 9,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  backgroundColor:
                    walletSource === "main" ? "#08291e" : "#12151e",
                  color: walletSource === "main" ? "#10b981" : "#9ca3af",
                  border:
                    walletSource === "main"
                      ? "1.5px solid #10b981"
                      : "1px solid #262b38",
                }}
              >
                Main: ₦{getMainBalance(user).toLocaleString()}
              </button>
              <button
                type="button"
                onClick={() => setWalletSource("bonus")}
                style={{
                  flex: 1,
                  padding: "7px 8px",
                  borderRadius: 9,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  backgroundColor:
                    walletSource === "bonus" ? "#291d08" : "#12151e",
                  color: walletSource === "bonus" ? "#fbbf24" : "#9ca3af",
                  border:
                    walletSource === "bonus"
                      ? "1.5px solid #fbbf24"
                      : "1px solid #262b38",
                }}
              >
                Bonus: ₦{getBonusBalance(user).toLocaleString()}
              </button>
            </div>

            <button
              type="button"
              onClick={handleUnlockSelectedNodes}
              disabled={unlockLoading}
              className="pv-btn-emerald"
              style={{
                width: "100%",
                backgroundColor: "#fbbf24",
                padding: "12px",
                fontSize: 13,
              }}
            >
              {unlockLoading
                ? `Unlocking ${selectedNodes.length} Node(s)...`
                : `🔓 UNLOCK ${selectedNodes.length} SELECTED NODE${
                    selectedNodes.length > 1 ? "S" : ""
                  } NOW (₦${(
                    selectedNodes.length * NODE_PRICE
                  ).toLocaleString()})`}
            </button>
          </div>
        </div>
      )}

      {inspectSoldNode !== null && (
        <div className="pv-modal-backdrop">
          <div className="pv-modal-card" style={{ textAlign: "center" }}>
            {(() => {
              const soldInfo = soldNodesMap[inspectSoldNode];
              const override = nodeOverridesMap[inspectSoldNode];
              const defaultBrand = DEFAULT_SECTOR_1_BRAND_NODES[inspectSoldNode];
              const displayBrand =
                override?.brand_name ||
                soldInfo?.brand_name ||
                defaultBrand?.brand_name ||
                "Golden Vault Node";
              const displayLogo =
                override?.logo_url ||
                soldInfo?.logo_url ||
                defaultBrand?.logo_url;

              return (
                <>
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      margin: "0 auto 12px auto",
                      borderRadius: 18,
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.45)",
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
                          width: 72,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: 14,
                          backgroundColor: "#fff",
                          padding: 2,
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 36 }}>🔒</span>
                    )}
                  </div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: 19, fontWeight: 900 }}>
                    Node #{inspectSoldNode.toLocaleString()}
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
                    <p
                      style={{
                        margin: "0 0 4px 0",
                        color: "#f87171",
                        fontWeight: 800,
                      }}
                    >
                      🔒 Node Permanently Locked (Sold)
                    </p>
                    <p style={{ margin: 0, color: "#9ca3af" }}>
                      Unlocked by: {soldInfo?.owner_name || "Player"}
                    </p>
                  </div>
                  {isAdminUnlocked && (
                    <button
                      onClick={() => {
                        const target = String(inspectSoldNode);
                        setInspectSoldNode(null);
                        setAdminTab("node");
                        handleAdminLoadNode(target);
                        setShowAdminModal(true);
                      }}
                      className="pv-sector-btn"
                      style={{ width: "100%", marginBottom: 10 }}
                    >
                      ⚙️ Admin: Edit or Unlock Node #{inspectSoldNode}
                    </button>
                  )}
                  <button
                    onClick={() => setInspectSoldNode(null)}
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

      {rewardResult && (
        <div className="pv-modal-backdrop">
          <div className="pv-modal-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>
              {rewardResult.totalAmount > 0 ? "🎉" : "😂"}
            </div>
            <h3
              style={{
                margin: "0 0 6px 0",
                fontSize: 20,
                fontWeight: 900,
                color: "#fbbf24",
              }}
            >
              {rewardResult.totalAmount > 0
                ? `${rewardResult.nodesUnlocked.length} Node${
                    rewardResult.nodesUnlocked.length > 1 ? "s" : ""
                  } Unlocked — Cash Hit!`
                : `${rewardResult.nodesUnlocked.length} Node${
                    rewardResult.nodesUnlocked.length > 1 ? "s" : ""
                  } Unlocked — Empty Vault!`}
            </h3>

            <div
              style={{
                backgroundColor: "#0c0f16",
                border: "1px solid #262b38",
                borderRadius: 11,
                padding: "8px 10px",
                marginBottom: 12,
                maxHeight: 130,
                overflowY: "auto",
                textAlign: "left",
              }}
            >
              {rewardResult.nodesUnlocked.map((item) => (
                <div
                  key={item.nodeId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    padding: "4px 0",
                    borderBottom: "1px solid #161b26",
                  }}
                >
                  <span style={{ color: "#d1d5db", fontWeight: 700 }}>
                    Node #{item.nodeId} ({item.brandName})
                  </span>
                  <span
                    style={{
                      color: item.amount > 0 ? "#10b981" : "#9ca3af",
                      fontWeight: 900,
                    }}
                  >
                    +₦{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {rewardResult.streakBonusEarned > 0 && (
              <div
                style={{
                  backgroundColor: "#211708",
                  border: "1px solid #fbbf24",
                  borderRadius: 11,
                  padding: 10,
                  marginBottom: 12,
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#fbbf24",
                }}
              >
                🔥 5-NODE STREAK COMPLETED! +₦
                {rewardResult.streakBonusEarned.toLocaleString()} FREE PLAY
                BONUS ADDED!
              </div>
            )}

            {rewardResult.totalAmount > 0 ? (
              <div
                style={{
                  backgroundColor: "#082419",
                  border: "1px solid #10b981",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#6ee7b7",
                  }}
                >
                  TOTAL INSTANT GIFT CREDITED TO MAIN WALLET!
                </p>
                <p
                  style={{
                    margin: "6px 0 0 0",
                    fontSize: 28,
                    fontWeight: 900,
                    color: "#10b981",
                  }}
                >
                  +₦{rewardResult.totalAmount.toLocaleString()}
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
              {rewardResult.totalAmount > 0
                ? "Claim & Continue Playing"
                : `No Gree! (${
                    STREAK_TARGET_NODES - streakCount
                  } more for +₦100 Streak Bonus!) 🔥`}
            </button>
          </div>
        </div>
      )}

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
                Wallet, Cash Out &amp; Support
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
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 5,
                marginBottom: 14,
              }}
            >
              <button
                onClick={() => setWalletTab("fund")}
                className={
                  walletTab === "fund" ? "pv-btn-emerald" : "pv-btn-dark"
                }
                style={{ padding: "8px 3px", fontSize: 10 }}
              >
                Fund
              </button>
              <button
                onClick={() => setWalletTab("withdraw")}
                className={
                  walletTab === "withdraw" ? "pv-btn-emerald" : "pv-btn-dark"
                }
                style={{ padding: "8px 3px", fontSize: 10 }}
              >
                Cash Out
              </button>
              <button
                onClick={() => setWalletTab("dispute")}
                className={
                  walletTab === "dispute" ? "pv-btn-emerald" : "pv-btn-dark"
                }
                style={{
                  padding: "8px 3px",
                  fontSize: 10,
                  borderColor:
                    walletTab === "dispute" ? "#10b981" : "rgba(244,63,94,0.5)",
                  color: walletTab === "dispute" ? "#000" : "#fda4af",
                }}
              >
                🚨 Dispute
              </button>
              <button
                onClick={() => setWalletTab("referrals")}
                className={
                  walletTab === "referrals" ? "pv-btn-emerald" : "pv-btn-dark"
                }
                style={{ padding: "8px 3px", fontSize: 10 }}
              >
                Refer
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
                        "Wallet synced with server! If deposit is still missing, tap the 🚨 Dispute tab above.",
                        "info"
                      );
                    }
                  }}
                  className="pv-btn-dark"
                  style={{ width: "100%", fontSize: 11, padding: "9px" }}
                >
                  ↻ Sync Wallet Balance
                </button>
                <button
                  type="button"
                  onClick={() => setWalletTab("dispute")}
                  className="pv-dispute-banner"
                  style={{ marginBottom: 0 }}
                >
                  🚨 Sent Money &amp; Window Closed? Click Here to Report
                  Payment
                </button>
              </div>
            )}

            {walletTab === "withdraw" && (
              <form
                onSubmit={handleWithdrawSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 9 }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#10b981",
                    fontWeight: 800,
                  }}
                >
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

            {walletTab === "dispute" && (
              <form
                onSubmit={handleSubmitPaymentDispute}
                style={{ display: "flex", flexDirection: "column", gap: 9 }}
              >
                <div
                  style={{
                    backgroundColor: "#1f1216",
                    border: "1px solid rgba(244,63,94,0.4)",
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 11.5,
                    color: "#fda4af",
                  }}
                >
                  <strong>🚨 Paystack Deposit Not Reflecting?</strong>
                  <br />
                  Fill in your transfer details below. Admin will verify your
                  transfer and credit your Main Wallet directly!
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      display: "block",
                      marginBottom: 3,
                    }}
                  >
                    1. Amount Transferred (₦)
                  </label>
                  <input
                    type="number"
                    min={100}
                    required
                    placeholder="e.g. 500"
                    value={disputeAmount}
                    onChange={(e) => setDisputeAmount(e.target.value)}
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
                      marginBottom: 3,
                    }}
                  >
                    2. Sender Name &amp; Bank Used
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe - OPay / PalmPay"
                    value={disputeSender}
                    onChange={(e) => setDisputeSender(e.target.value)}
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
                      marginBottom: 3,
                    }}
                  >
                    3. Time Sent / Session ID or Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sent at 2:15 PM via Paystack Transfer"
                    value={disputeRefNote}
                    onChange={(e) => setDisputeRefNote(e.target.value)}
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
                      marginBottom: 3,
                    }}
                  >
                    4. Attach Transfer Receipt Screenshot (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDisputeProofUpload}
                    style={{ fontSize: 11, width: "100%" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={disputeSubmitting}
                  className="pv-btn-emerald"
                  style={{ width: "100%", padding: "12px", marginTop: 4 }}
                >
                  {disputeSubmitting
                    ? "Submitting Dispute..."
                    : "SUBMIT PAYMENT DISPUTE NOW"}
                </button>
              </form>
            )}

            {walletTab === "referrals" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="pv-wallet-bonus">
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#fbbf24",
                    }}
                  >
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
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#fbbf24",
                }}
              >
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
                  Enter Master Admin Password to unlock studio controls:
                </p>
                <input
                  type="password"
                  placeholder="Enter Admin Password"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="pv-input"
                />
                <button
                  onClick={() => {
                    if (adminPinInput.trim() === ADMIN_MASTER_PIN) {
                      setIsAdminUnlocked(true);
                      handleAdminLoadNode(editNodeId);
                      handleAdminLoadAdSlot("top");
                      fetchAdminWithdrawals();
                      fetchAdminDisputes();
                      showToast("Admin Studio Unlocked!", "success");
                    } else {
                      showToast("Invalid Admin Password", "error");
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 4,
                    marginBottom: 14,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setAdminTab("node")}
                    className={
                      adminTab === "node" ? "pv-btn-emerald" : "pv-btn-dark"
                    }
                    style={{ fontSize: 9, padding: "8px 2px" }}
                  >
                    💎 Nodes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTab("wallet")}
                    className={
                      adminTab === "wallet" ? "pv-btn-emerald" : "pv-btn-dark"
                    }
                    style={{ fontSize: 9, padding: "8px 2px" }}
                  >
                    💰 Credit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminTab("withdrawals");
                      fetchAdminWithdrawals();
                    }}
                    className={
                      adminTab === "withdrawals"
                        ? "pv-btn-emerald"
                        : "pv-btn-dark"
                    }
                    style={{ fontSize: 9, padding: "8px 2px" }}
                  >
                    🏦 CashOut
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminTab("disputes");
                      fetchAdminDisputes();
                    }}
                    className={
                      adminTab === "disputes" ? "pv-btn-emerald" : "pv-btn-dark"
                    }
                    style={{ fontSize: 9, padding: "8px 2px" }}
                  >
                    🚨 Disputes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminTab("ads");
                      handleAdminLoadAdSlot(adminAdSlotPos);
                    }}
                    className={
                      adminTab === "ads" ? "pv-btn-emerald" : "pv-btn-dark"
                    }
                    style={{ fontSize: 9, padding: "8px 2px" }}
                  >
                    📢 Ads
                  </button>
                </div>

                {adminTab === "node" && (
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
                )}

                {adminTab === "wallet" && (
                  <form
                    onSubmit={handleAdminCreditPlayer}
                    style={{ display: "flex", flexDirection: "column", gap: 10 }}
                  >
                    <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                      Credit any player&apos;s Main Wallet or Play Bonus
                      instantly by phone number:
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

                {adminTab === "withdrawals" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                      type="button"
                      onClick={fetchAdminWithdrawals}
                      className="pv-btn-dark"
                      style={{ width: "100%", fontSize: 11 }}
                    >
                      ↻{" "}
                      {loadingWithdrawals
                        ? "Loading..."
                        : "Refresh Cash Out Requests"}
                    </button>
                    {withdrawalsList.length === 0 ? (
                      <p
                        style={{
                          textAlign: "center",
                          fontSize: 12,
                          color: "#9ca3af",
                        }}
                      >
                        No withdrawal requests found yet.
                      </p>
                    ) : (
                      withdrawalsList.map((w, idx) => (
                        <div
                          key={w.id || idx}
                          style={{
                            backgroundColor: "#0c0f16",
                            border:
                              w.status === "paid"
                                ? "1px solid #10b981"
                                : "1px solid #fbbf24",
                            borderRadius: 12,
                            padding: 12,
                            fontSize: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontWeight: 900,
                            }}
                          >
                            <span style={{ color: "#10b981", fontSize: 15 }}>
                              ₦{Number(w.amount || 0).toLocaleString()}
                            </span>
                            <span
                              style={{
                                color:
                                  w.status === "paid" ? "#10b981" : "#fbbf24",
                                textTransform: "uppercase",
                                fontSize: 11,
                              }}
                            >
                              {w.status || "pending"}
                            </span>
                          </div>
                          <p
                            style={{
                              margin: "6px 0 2px 0",
                              color: "#ffffff",
                              fontWeight: 700,
                            }}
                          >
                            {w.bank_name} • {w.account_number}
                          </p>
                          <p
                            style={{
                              margin: "0 0 8px 0",
                              color: "#9ca3af",
                              fontSize: 11,
                            }}
                          >
                            Name: {w.account_name} | Phone: {w.user_phone}
                          </p>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  String(w.account_number || "")
                                );
                                showToast("Account number copied!", "success");
                              }}
                              className="pv-btn-dark"
                              style={{ flex: 1, fontSize: 11, padding: "7px" }}
                            >
                              📋 Copy Acct No
                            </button>
                            {w.status !== "paid" && (
                              <button
                                type="button"
                                onClick={() => markWithdrawalPaid(w)}
                                className="pv-btn-emerald"
                                style={{ flex: 1, fontSize: 11, padding: "7px" }}
                              >
                                ✅ Mark Paid
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {adminTab === "disputes" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                      type="button"
                      onClick={fetchAdminDisputes}
                      className="pv-btn-dark"
                      style={{ width: "100%", fontSize: 11 }}
                    >
                      ↻{" "}
                      {loadingDisputes
                        ? "Loading..."
                        : "Refresh Payment Disputes & Deposit Logs"}
                    </button>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#fbbf24",
                      }}
                    >
                      1. Player Payment Complaints ({disputesList.length})
                    </p>
                    {disputesList.length === 0 ? (
                      <p
                        style={{
                          textAlign: "center",
                          fontSize: 11.5,
                          color: "#9ca3af",
                          margin: "4px 0",
                        }}
                      >
                        No payment dispute tickets submitted yet.
                      </p>
                    ) : (
                      disputesList.map((d, idx) => (
                        <div
                          key={d.id || idx}
                          style={{
                            backgroundColor: "#0c0f16",
                            border:
                              d.status === "approved"
                                ? "1px solid #10b981"
                                : d.status === "rejected"
                                ? "1px solid #ef4444"
                                : "1px solid #fbbf24",
                            borderRadius: 12,
                            padding: 12,
                            fontSize: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontWeight: 900,
                            }}
                          >
                            <span style={{ color: "#fbbf24", fontSize: 15 }}>
                              Claim: ₦{Number(d.amount || 0).toLocaleString()}
                            </span>
                            <span
                              style={{
                                color:
                                  d.status === "approved"
                                    ? "#10b981"
                                    : d.status === "rejected"
                                    ? "#ef4444"
                                    : "#fbbf24",
                                textTransform: "uppercase",
                                fontSize: 11,
                              }}
                            >
                              {d.status || "pending"}
                            </span>
                          </div>
                          <p
                            style={{
                              margin: "6px 0 2px 0",
                              color: "#ffffff",
                              fontWeight: 700,
                            }}
                          >
                            Player: {d.user_phone} ({d.user_name || "Player"})
                          </p>
                          <p
                            style={{
                              margin: "0 0 4px 0",
                              color: "#10b981",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            Sender: {d.sender_info}
                          </p>
                          <p
                            style={{
                              margin: "0 0 8px 0",
                              color: "#9ca3af",
                              fontSize: 11,
                            }}
                          >
                            Ref/Note: {d.reference_note}
                          </p>
                          {d.proof_url && (
                            <div style={{ marginBottom: 8 }}>
                              <img
                                src={d.proof_url}
                                alt="Transfer Receipt"
                                style={{
                                  width: "100%",
                                  maxHeight: 160,
                                  objectFit: "contain",
                                  borderRadius: 8,
                                  border: "1px solid #262b38",
                                }}
                              />
                            </div>
                          )}
                          {(!d.status || d.status === "pending") && (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                type="button"
                                onClick={() =>
                                  handleResolveDispute(d, "approved")
                                }
                                className="pv-btn-emerald"
                                style={{ flex: 2, fontSize: 11, padding: "8px" }}
                              >
                                ✅ Approve &amp; Credit ₦
                                {Number(d.amount || 0).toLocaleString()}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleResolveDispute(d, "rejected")
                                }
                                className="pv-btn-logout"
                                style={{ flex: 1, fontSize: 11, padding: "8px" }}
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}

                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#34d399",
                      }}
                    >
                      2. Initiated Checkouts (Opened Paystack Window:{" "}
                      {initiatedDepositsList.length})
                    </p>
                    {initiatedDepositsList.length === 0 ? (
                      <p
                        style={{
                          textAlign: "center",
                          fontSize: 11,
                          color: "#9ca3af",
                          margin: 0,
                        }}
                      >
                        No uncompleted Paystack checkouts logged yet.
                      </p>
                    ) : (
                      initiatedDepositsList.map((tx, idx) => (
                        <div
                          key={tx.id || idx}
                          style={{
                            backgroundColor: "#090d14",
                            border: "1px solid #262b38",
                            borderRadius: 10,
                            padding: 10,
                            fontSize: 11,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontWeight: 800,
                            }}
                          >
                            <span style={{ color: "#ffffff" }}>
                              📱 {tx.user_phone}
                            </span>
                            <span style={{ color: "#fbbf24" }}>
                              ₦{Number(tx.amount || 0).toLocaleString()} (
                              {tx.status})
                            </span>
                          </div>
                          <p
                            style={{
                              margin: "4px 0 6px 0",
                              color: "#9ca3af",
                              fontSize: 10,
                              wordBreak: "break-all",
                            }}
                          >
                            Ref: {tx.reference}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setAdminCreditPhone(String(tx.user_phone || ""));
                              setAdminCreditAmount(String(tx.amount || 500));
                              setAdminTab("wallet");
                            }}
                            className="pv-sector-btn"
                            style={{
                              width: "100%",
                              padding: "6px",
                              fontSize: 10.5,
                            }}
                          >
                            💰 Load in Credit Tab to Top Up Player
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {adminTab === "ads" && (
                  <form
                    onSubmit={handleAdminSaveAdConfig}
                    style={{ display: "flex", flexDirection: "column", gap: 10 }}
                  >
                    <p style={{ margin: 0, fontSize: 11.5, color: "#9ca3af" }}>
                      Manage your Top &amp; Bottom horizontal banner spaces. Use
                      Google AdSense OR upload a clickable sponsor banner image
                      + link:
                    </p>
                    <div className="pv-wallets-grid" style={{ marginBottom: 2 }}>
                      <button
                        type="button"
                        onClick={() => handleAdminLoadAdSlot("top")}
                        className={
                          adminAdSlotPos === "top"
                            ? "pv-sector-btn"
                            : "pv-btn-dark"
                        }
                        style={{ fontSize: 11 }}
                      >
                        🔼 Top Banner Slot
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdminLoadAdSlot("bottom")}
                        className={
                          adminAdSlotPos === "bottom"
                            ? "pv-sector-btn"
                            : "pv-btn-dark"
                        }
                        style={{ fontSize: 11 }}
                      >
                        🔽 Bottom Banner Slot
                      </button>
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
                        Select Ad Type for{" "}
                        {adminAdSlotPos === "top" ? "Top" : "Bottom"} Slot:
                      </label>
                      <div className="pv-wallets-grid" style={{ marginBottom: 0 }}>
                        <button
                          type="button"
                          onClick={() => setAdminAdMode("adsense")}
                          className={
                            adminAdMode === "adsense"
                              ? "pv-btn-emerald"
                              : "pv-btn-dark"
                          }
                          style={{ fontSize: 11, padding: "8px" }}
                        >
                          ⚡ Google AdSense
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminAdMode("custom")}
                          className={
                            adminAdMode === "custom"
                              ? "pv-btn-emerald"
                              : "pv-btn-dark"
                          }
                          style={{ fontSize: 11, padding: "8px" }}
                        >
                          🖼️ Image + Link Ad
                        </button>
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
                        Banner Header Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SPONSORED BANNER AD"
                        value={adminAdLabel}
                        onChange={(e) => setAdminAdLabel(e.target.value)}
                        className="pv-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    {adminAdMode === "adsense" ? (
                      <>
                        <div>
                          <label
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                              display: "block",
                              marginBottom: 4,
                            }}
                          >
                            Paste Full Google AdSense HTML Code (Auto-Extracts
                            IDs)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Paste <ins class='adsbygoogle' ...> code here or edit IDs below"
                            value={adminAdCustomHtml}
                            onChange={(e) => {
                              const raw = e.target.value;
                              setAdminAdCustomHtml(raw);
                              const clientMatch = raw.match(/ca-pub-\d+/i);
                              const slotMatch = raw.match(
                                /data-ad-slot=["'](\d+)["']/i
                              );
                              if (clientMatch)
                                setAdminAdClientId(clientMatch[0]);
                              if (slotMatch) setAdminAdSlotId(slotMatch[1]);
                            }}
                            className="pv-input"
                            style={{
                              width: "100%",
                              fontSize: 11,
                              fontFamily: "monospace",
                            }}
                          />
                        </div>
                        <div className="pv-wallets-grid" style={{ marginBottom: 0 }}>
                          <div>
                            <label
                              style={{
                                fontSize: 10,
                                color: "#9ca3af",
                                display: "block",
                                marginBottom: 3,
                              }}
                            >
                              Publisher Client ID
                            </label>
                            <input
                              type="text"
                              value={adminAdClientId}
                              onChange={(e) =>
                                setAdminAdClientId(e.target.value)
                              }
                              className="pv-input"
                              style={{ width: "100%", fontSize: 11 }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: 10,
                                color: "#9ca3af",
                                display: "block",
                                marginBottom: 3,
                              }}
                            >
                              Ad Unit Slot ID
                            </label>
                            <input
                              type="text"
                              value={adminAdSlotId}
                              onChange={(e) => setAdminAdSlotId(e.target.value)}
                              className="pv-input"
                              style={{ width: "100%", fontSize: 11 }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                              display: "block",
                              marginBottom: 4,
                            }}
                          >
                            1. Upload Sponsor Banner Image (or Paste Image URL)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas =
                                    document.createElement("canvas");
                                  canvas.width = 380;
                                  canvas.height = 60;
                                  const ctx = canvas.getContext("2d");
                                  ctx?.drawImage(img, 0, 0, 380, 60);
                                  setAdminAdImageUrl(
                                    canvas.toDataURL("image/webp", 0.88)
                                  );
                                  showToast(
                                    "Banner image uploaded & sized!",
                                    "success"
                                  );
                                };
                                img.src = ev.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }}
                            style={{
                              fontSize: 11,
                              marginBottom: 6,
                              width: "100%",
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Or paste banner image URL (https://...)"
                            value={adminAdImageUrl}
                            onChange={(e) => setAdminAdImageUrl(e.target.value)}
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
                            2. Clickable Destination Link (Where Users Go When
                            They Tap the Ad)
                          </label>
                          <input
                            type="url"
                            required
                            placeholder="https://wa.me/234... or https://sponsorwebsite.com"
                            value={adminAdTargetUrl}
                            onChange={(e) =>
                              setAdminAdTargetUrl(e.target.value)
                            }
                            className="pv-input"
                            style={{ width: "100%" }}
                          />
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={adminAdSaving}
                      className="pv-btn-emerald"
                      style={{ width: "100%", padding: "12px", marginTop: 4 }}
                    >
                      {adminAdSaving
                        ? "Saving Ad Slot..."
                        : `SAVE ${adminAdSlotPos.toUpperCase()} BANNER AD`}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

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