"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

// ==========================================
// INTERFACES & TYPES
// ==========================================
interface GridNode {
  id: number;
  status: "available" | "sold";
  owner_phone?: string | null;
  owner_name?: string | null;
  prize_amount: number;
  sponsor_name?: string | null;
  logo_url?: string | null;
  is_custom?: boolean;
}

interface CustomNodeOverride {
  node_id: number;
  custom_prize: number;
  sponsor_name: string;
  logo_url: string;
}

interface SoldNodeRecord {
  id: number;
  node_id?: number;
  status: string;
  owner_phone?: string | null;
  prize_amount?: number;
  sponsor_name?: string | null;
  logo_url?: string | null;
}

interface UserProfile {
  id?: string;
  phone: string;
  email: string;
  full_name?: string;
  wallet_balance: number;
  bonus_balance: number;
  withdrawal_pin?: string;
  referred_by?: string | null;
}

interface ModalState {
  isOpen: boolean;
  type: "auth" | "wallet" | "pin" | "node_result" | null;
  payload?: any;
}

// ==========================================
// DEFAULT SPONSOR NODES
// ==========================================
const DEFAULT_SPONSORS: Record<number, { name: string; logo: string }> = {
  1: {
    name: "GOOGLE",
    logo: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
  },
  7: {
    name: "PAYSTACK",
    logo: "https://www.google.com/s2/favicons?domain=paystack.com&sz=128",
  },
  12: {
    name: "MTN",
    logo: "https://www.google.com/s2/favicons?domain=mtn.ng&sz=128",
  },
};

// ==========================================
// 150 NIGERIAN & TRENDING STREET ROASTS
// ==========================================
export const NIGERIAN_STREET_ROASTS: string[] = [
  "1. Aii Jehovah! Which kind temptation be this? Empty box! 😭",
  "2. Eyah, sorry o! Try another node, you go cry ke? Never! 😂",
  "3. No evidence! You go explain tire because nothing dey inside this box.",
  "4. Otilo! That your ₦100 don enter voice mail. Move to the next node jor!",
  "5. Dey play! You think say na every node carry ₦10k? Try again boss!",
  "6. Chai, sapa nice one! This node dry pass harmattan breeze.",
  "7. Composure! Maintain steeze, no let anybody see say you pick empty box 💀",
  "8. Minus 10,000 aura! How you go leave correct nodes go pick this empty one?",
  "9. Village people work! Dem mount roadblock for this particular node.",
  "10. Who you offend today? Even cobweb no gree stay inside this node 😂",
  "11. Shege Banza! This node just show you premium tears.",
  "12. Nothing dey here o! Go warm eba chop, your next click fit pay sha.",
  "13. Jehovah overdo, pass this node! Oya tap the one beside am.",
  "14. E chok! Your hand just touch pure oxygen. No shishi!",
  "15. Justice for your ₦100! Because the way e take vanish ehn... 😂",
  "16. No panic, CEO! Na test of faith. The main cash dey the next line.",
  "17. You sure say you wash hand before you tap this node? Empty vault!",
  "18. Omo, this box empty pass lecture hall on Friday afternoon!",
  "19. Breakfast! Dem just serve you hot-hot inside this node 💔",
  "20. Wetin be this? Even NEPA get light pass this node wey you pick!",
  "21. Calma, calma! Big boys no dey cry for ₦100. Unlock another one!",
  "22. Zero returns! If na exam be this, na carry-over straight 😭",
  "23. Your village people dey use Starlink track your hand! Change pattern.",
  "24. Not even a single kobo! This node na pure vibes and Inshallah.",
  "25. You don buy market! Empty nylon na im full inside here.",
  "26. Aswear, the money wey suppose dey here just travel go Canada now now!",
  "27. Hold your chest! Take deep breath... because you no win anything 😂",
  "28. Na wa o! Out of 1 million nodes, your hand go jam the driest one!",
  "29. No gree for sapa! Tap another golden box, your glory dey front.",
  "30. Bombastic side eye 👀... This node literally laughed at your click!",
  "31. Omo x1000! Even rat enter this node, e go faint for hunger!",
  "32. You go cry? No cry boss, tap the next gold box make you recover!",
  "33. This node dry pass garri wey no get sugar. Try again jare!",
  "34. Dem donbilling you! ₦100 gone, zero alerts received.",
  "35. Walahi, nothing dey inside here! Turn your radar to the next box.",
  "36. Na breeze full this node! If you open am well, hurricane go blow.",
  "37. Sapa dey laugh you for corner! Quick, tap another node disgrace am.",
  "38. E be like say your network shake, because this box na pure dust!",
  "39. From fry pan to empty node! Oya shift hand go left small.",
  "40. Ah! Even POS attendant go pity you for this particular click.",
  "41. Zero alert! Your bank app still dey sleep, wake am with another node.",
  "42. Na who send you message come this node? Nobody dey house!",
  "43. Lock up! Pretend like say na test you dey test the mouse 😂",
  "44. This node na scam of emotions! Golden outside, pure dust inside.",
  "45. You miss the ₦10k by whiskers! Check the node under this one.",
  "46. E pain me for your body! That ₦100 for buy pure water quench thirst.",
  "47. Odogwu, shake body! Empty box no fit stop your shine today.",
  "48. This node na 'seen' without reply. Straight blue ticks, zero cash!",
  "49. Wait first... na your thumb abi na index finger you take tap this dust?",
  "50. Even spirit no dey inside this box. Total emptiness!",
  "51. If heartburn was a node, na this exact one you just click!",
  "52. Dem don sweep this vault clean since 1960. Move front!",
  "53. Your steeze just drop by 45%! Hurry up tap winning node recover am.",
  "54. Na wa! This box dry like suya wey sleep for sun three days.",
  "55. You sure say your landlord no dey pray against your hand so?",
  "56. Kpai! The ₦100 just kpai quietly inside this dark box.",
  "57. No cap, this node broke pass student for January ending!",
  "58. Oya, wipe your tears with handkerchief, tap the next gold box!",
  "59. You just donate ₦100 to the Ministry of Empty Boxes 😂",
  "60. Look left, look right... hope nobody see this your dry pick!",
  "61. Eyama! Dis one na premium dust. Wash your screen try again.",
  "62. This node no even get conscience! Just chop ₦100 clean mouth.",
  "63. Make I no lie give you, na cobweb and mosquito full inside here.",
  "64. Sapa 1 - 0 You. Oya equalize for the next node sharp-sharp!",
  "65. If 'Had I Known' was a grid box, na this exact number!",
  "66. Nothing concern this node with giveaway. Purewickedness!",
  "67. Even ritualist go reject this box, nothing dey inside at all!",
  "68. Oya do transfer of aggression go the next node, this one don cast.",
  "69. Na counterfeit luck you use tap this one o! Switch gear boss.",
  "70. Audio money! You hear the sound, but your wallet balance no move.",
  "71. This node na 'I will get back to you' from HR. Never happening!",
  "72. Chai! Even beggars for junction go give this node ₦5 out of pity.",
  "73. You tap am with full confidence, e reply you with full emptiness!",
  "74. Na mirage be this! Golden shine, zero kobo inside.",
  "75. Take heart boss, na so life be sometimes—one minute ₦100, next minute dust!",
  "76. Who padlock your luck for this sector? Jump go another sector jor!",
  "77. This box na pure 'To God be the Glory', zero Naira attached!",
  "78. Eiii! Even network provider no dey deduct money fast reach this node.",
  "79. Your hand cold! Rub your two palms together before the next tap.",
  "80. If dem born you well, tap the node beside am make we see!",
  "81. Na empty carton of Indomie full inside this particular vault.",
  "82. Dem don drink the soup leave empty plate for you inside this node!",
  "83. Alert nogree enter! Because na dry land your finger land on.",
  "84. Omo, this click loud o... sadly na empty drum dey make noise pass!",
  "85. You almost catch am! The money just jump enter the next box now.",
  "86. Na 'Insha Allah' and vibes dey sustain you after this empty pick 😂",
  "87. Even AI shock say you pick this exact dry box out of one million!",
  "88. This node na pure fasting and prayer—no food, no cash inside!",
  "89. Gbas Gbos! You give the node ₦100, the node give you heavy air.",
  "90. Relax, na warm-up click be that. Your real target dey front!",
  "91. This box empty like promise wey politician make during campaign!",
  "92. Zero joy! This node wake up today choose pure violence.",
  "93. Oya breathe in, breathe out... say after me: 'Sapa no go win!'",
  "94. Dem suppose arrest this node for daytime robbery of ₦100 😂",
  "95. Not a dime! Even dustbin get content pass this box.",
  "96. You tap gold, e turn charcoal! Village people watching in 4K.",
  "97. Eyaaa! Even the emoji inside this box dey cry for you 😭",
  "98. Shift! Leave this dry zone before sapa infect your wallet.",
  "99. Na ghost mode this node dey. Zero trace of Naira!",
  "100. Otilo patapata! Even CID no fit trace where that ₦100 enter.",
  "101. You get mind o! How you take pick the exact node wey get zero?",
  "102. This node dry pass lecturer handout wey get font size 6!",
  "103. No vex boss, na slip of finger. Try the lucky number below!",
  "104. If dem check this node blood group, na 'O-Empty' e go read!",
  "105. Awon Boys don clear this vault before you wake up this morning!",
  "106. E be like say na left hand you take click am. Use right hand next!",
  "107. Pure air condition! Nothing but cold breeze inside this box.",
  "108. This node na 'Try Again Later' in human form!",
  "109. Even telescope no fit see one kobo inside this particular node.",
  "110. Sapa just send you friend request from inside this box. Reject am!",
  "111. Omo, your eye sharp... for picking the wrong box! Try again jare 😂",
  "112. Na noise this node get, zero packaging, zero cash!",
  "113. If this node was a course, na 0-unit elective wey still hard!",
  "114. Dem don exile all the Naira comot from this number since!",
  "115. Wipe screen well! Maybe smudges make you tap empty box.",
  "116. Nothing spoil! Na ₦100 comot, ₦10,000 dey wait for front.",
  "117. This node na 'Insufficient Funds' personified!",
  "118. Chai, even squirrel no keep groundnut inside this vault!",
  "119. You hit the bullseye of emptiness! 100% accuracy on zero Naira 😂",
  "120. No panic, even Manchester United dey lose match sometimes—go again!",
  "121. This node na off-side goal! Referee don chalk am off, zero cash.",
  "122. VAR check complete: Decision—No Money Inside Box! ❌",
  "123. You shoot penalty throw am enter bar! Tap again make you score.",
  "124. Na dry desert be this! Not a drop of Naira in sight.",
  "125. Even NEPA transformer dey hum, this node just silent flat!",
  "126. Oya, change formation! 4-4-2 no work for this sector, try 4-3-3!",
  "127. This box na 'Ghost Worker'—name dey grid, salary no dey inside!",
  "128. Dem don use broom sweep every kobo comot here. Move on!",
  "129. Your ₦100 just do bungee jump enter black hole!",
  "130. If emptiness was an Olympic sport, this node carry Gold Medal 🥇",
  "131. No let small ₦100 roast scatter your steeze. Tap another box!",
  "132. Na 'Thank You For Participating' certificate dey inside this one 😂",
  "133. Even microscope for lab no fit detect single kobo inside here!",
  "134. This node negative pass malaria test result for rainy season!",
  "135. Zero growth on the culture plate! This node na pure sterile air.",
  "136. You just unbox premium Nigerian oxygen. Congrats boss! 😂",
  "137. Dem don lock this node key throway inside Lagoon!",
  "138. Not today! The vault keeper say make you check the next door.",
  "139. Oya clap for yourself... you successfully found the empty box! 👏",
  "140. This node na 'Network Error' for your pocket. Refresh your luck!",
  "141. Sapa bin wan laugh, quickly tap another node shut am up!",
  "142. Na mirage for Sahara desert you just tap so. Zero water, zero cash!",
  "143. Even magician no fit pull rabbit comot from this empty node!",
  "144. You pay ₦100 school fees learn say this box is empty 😂",
  "145. Shake your phone small, maybe the money hang for corner... Nope, still zero!",
  "146. This node na 'Read Only Memory'—nothing to withdraw inside!",
  "147. Dem don format this node hard drive clean. Not a byte of cash!",
  "148. Omo, na 'God Dey' remain after this kind dry click o!",
  "149. Even thief enter this node, na im go drop transport money for the box!",
  "150. Final verdict: 0.00 Naira! Tap the next gold box make we see miracle!"
];

// ==========================================
// 50 COLD VILLAIN QUOTES (ANIME, MOVIES & TV)
// ==========================================
export const VILLAIN_ROAST_QUOTES: string[] = [
  "151. \"Wake up to reality. Nothing ever goes as planned in this accursed grid.\" — Madara Uchiha",
  "152. \"You could not live with your own failure. Where did that bring you? Back to an empty node.\" — Thanos",
  "153. \"It’s not about the ₦100... it’s about sending a message. Everything burns!\" — The Joker",
  "154. \"I am the one who knocks! And I emptied this vault before you arrived.\" — Walter White",
  "155. \"This world shall know pain... starting with this ₦0 node you just clicked.\" — Pain (Nagato)",
  "156. \"Reality is often disappointing. Today, it cost you ₦100.\" — Thanos",
  "157. \"Do I really look like a guy with a prize in this box?\" — The Joker",
  "158. \"All according to keikaku (plan). You clicked the exact empty trap I set.\" — Sosuke Aizen",
  "159. \"I'll take a potato chip... and eat your ₦100 right in front of you!\" — Light Yagami",
  "160. \"You think darkness is your ally? You merely adopted the empty node; I was born in it.\" — Bane",
  "161. \"I can do whatever the hell I want... including leaving zero Naira in this node.\" — Homelander",
  "162. \"Pathetic. You lacked the hatred—and the luck—to unlock a winning box.\" — Itachi Uchiha",
  "163. \"Look at me, Hector. Zero Naira. Last chance to click another node.\" — Gus Fring",
  "164. \"Why so serious? It’s only ₦100 vanishing into thin air!\" — The Joker",
  "165. \"In this world, wherever there is light, there are also empty nodes.\" — Madara Uchiha",
  "166. \"You are not the guy. You're not capable of being the guy on this node.\" — Mike Ehrmantraut",
  "167. \"Know your place, fool! This vault was never meant to pay you.\" — Ryomen Sukuna",
  "168. \"Stand proud. You clicked hard... bit it was still an empty box.\" — Ryomen Sukuna",
  "169. \"A lion doesn't concern himself with the opinions of a player who picked an empty node.\" — Tywin Lannister",
  "170. \"Chaos isn't a pit. Chaos is a ladder... and you just missed a rung.\" — Littlefinger",
  "171. \"When you play the Game of Nodes, you win or you get roasted. There is no middle ground.\" — Cersei Lannister",
  "172. \"If you think this node has a happy ending, you haven't been paying attention.\" — Ramsay Bolton",
  "173. \"I find your lack of luck disturbing.\" — Darth Vader",
  "174. \" Unlimited Power! ...Zero Balance inside this box!\" — Emperor Palpatine",
  "175. \"Everything that has transpired has done so according to my design. Empty node!\" — Emperor Palpatine",
  "176. \"You underestimate the power of the Dark Side—and the emptiness of this node.\" — Darth Vader",
  "177. \"Fine, I'll take your ₦100 myself.\" — Thanos",
  "178. \"A small price to pay for salvation... thank you for the ₦100 donation.\" — Thanos",
  "179. \"The hardest choices require the strongest wills. Click again if you dare.\" — Thanos",
  "180. \"Admirable. But mistaken. There is no treasure buried in this coordinate.\" — Magneto",
  "181. \"Peace was never an option. Neither was winning on this node.\" — Magneto",
  "182. \"Peace has cost you your strength. Victory has defeated your ₦100.\" — Bane",
  "183. \"No one cared who I was until I turned this golden node pitch black.\" — Bane",
  "184. \"Some men just want to watch their wallet balance burn.\" — Alfred / The Dark Knight",
  "185. \"You either die a winner, or live long enough to click an empty node.\" — Harvey Two-Face",
  "186. \"Heads, you win. Tails, you lose. Look closely—both sides of this coin are zero.\" — Two-Face",
  "187. \"Since when were you under the impression that this node contained money?\" — Sosuke Aizen",
  "188. \"Admiration is the state furthest from understanding. You fell right into my empty node.\" — Sosuke Aizen",
  "189. \"Those who do not understand true pain can never understand an empty ₦100 box.\" — Pain",
  "190. \"Weakness disgusts me. Especially a weak click on an empty vault.\" — Madara Uchiha",
  "191. \"Amusing. You actually believed a prize was hiding behind this door?\" — Gilgamesh",
  "192. \"Mongrel! All the treasures of this grid belong in my vault, not this box!\" — Gilgamesh",
  "193. \"People's dreams never end! ...Except your dream of winning on this exact node.\" — Blackbeard",
  "194. \"Justice will prevail, you say? Of course it will! Whoever wins the node becomes justice!\" — Doflamingo",
  "195. \"Did you really think clicking blindly would defeat me? Think, player, think!\" — Omni-Man",
  "196. \"Look what they need to mimic a fraction of our jackpot!\" — Omni-Man",
  "197. \"I am inevitable. And this node is undeniably empty.\" — Thanos",
  "198. \"Tell me, Mr. Anderson... what good is a golden node if you're unable to win from it?\" — Agent Smith",
  "199. \"There is no spoon. And there is definitely no money in this node.\" — The Matrix",
  "200. \"Game Over. The house claims this coordinate. Pick another node to survive.\" — Jigsaw"
];

// Combined 200-Quote Master Bank
export const MASTER_ROAST_AND_VILLAIN_BANK: string[] = [
  ...NIGERIAN_STREET_ROASTS,
  ...VILLAIN_ROAST_QUOTES,
];

const INITIAL_TICKER_WINS = [
  "🔥 0813***902 just secured ₦3,000 on Node #42!",
  "⚡ 0906***118 unlocked ₦20,000 NELFUND Grant on Node #20!",
  "💰 0703***441 cashed out ₦5,000 straight to OPay!",
  "🚀 0802***774 earned ₦50 Referral Play Bonus!",
  "🎯 0816***309 hit ₦1,000 on Node #88!",
  "💎 0901***552 unlocked ₦10,000 Mega Vault on Node #314!",
];

// ==========================================
// MASTER PRIZE DISTRIBUTION ENGINE (1,000,000 NODES)
// ==========================================
// Exact distribution across the 1,000,000-node ecosystem:
// Total Winning Nodes = 250,000 | Total Payout = ₦22,000,000 Exact
// Remaining 750,000 Nodes = ₦0 (Triggers 200 Nigerian Roasts & Villain Quotes!)
//
// 1.  20,000 nodes = ₦70     (₦1,400,000)
// 2.     800 nodes = ₦3,000  (₦2,400,000)
// 3.     200 nodes = ₦5,000  (₦1,000,000)
// 4.     200 nodes = ₦10,000 (₦2,000,000)
// 5.   3,800 nodes = ₦1,000  (₦3,800,000)
// 6.  41,500 nodes = ₦100    (₦4,150,000)
// 7.  50,000 nodes = ₦50     (₦2,500,000)
// 8.  50,000 nodes = ₦60     (₦3,000,000)
// 9.  25,000 nodes = ₦30     (₦750,000)
// 10. 20,500 nodes = ₦20     (₦410,000)
// 11. 24,000 nodes = ₦10     (₦240,000)
// 12. 14,000 nodes = ₦25     (₦350,000)
export function getMasterNodePrize(nodeId: number): number {
  // BOOSTED HOOK ZONE FOR FIRST 100 NODES (Sector 1: 85% Win Rate to hook new users!)
  if (nodeId >= 1 && nodeId <= 100) {
    const first100Hash = (nodeId * 73 + 19) % 100;
    if (first100Hash === 99) return 3000;                                        // 1 Node  -> ₦3,000
    if (first100Hash === 88 || first100Hash === 44) return 1000;                 // 2 Nodes -> ₦1,000
    if (first100Hash >= 70 && first100Hash <= 84) return 100;                    // 15 Nodes -> ₦100
    if (first100Hash >= 58 && first100Hash <= 69) return 70;                     // 12 Nodes -> ₦70
    if (first100Hash >= 40 && first100Hash <= 57 && first100Hash !== 44) return 60; // 17 Nodes -> ₦60
    if (first100Hash >= 22 && first100Hash <= 39) return 50;                     // 18 Nodes -> ₦50
    if (first100Hash >= 14 && first100Hash <= 21) return 30;                     // 8 Nodes  -> ₦30
    if (first100Hash >= 10 && first100Hash <= 13) return 25;                     // 4 Nodes  -> ₦25
    if (first100Hash >= 5 && first100Hash <= 9) return 20;                       // 5 Nodes  -> ₦20
    if (first100Hash >= 1 && first100Hash <= 4) return 10;                       // 4 Nodes  -> ₦10
    return 0; // Remaining 14 Nodes in First 100 -> ₦0 Roast
  }

  // FULL 1,000,000-NODE DETERMINISTIC SCATTER
  // Coprime multiplier (73856093) maps every nodeId (1 to 1,000,000) to a unique slot
  const slot = ((nodeId * 73856093 + 19349663) % 1000000 + 1000000) % 1000000;

  if (slot < 200) return 10000;                   // 200 nodes    = ₦10,000
  if (slot < 400) return 5000;                    // 200 nodes    = ₦5,000
  if (slot < 1200) return 3000;                   // 800 nodes    = ₦3,000
  if (slot < 5000) return 1000;                   // 3,800 nodes  = ₦1,000
  if (slot < 46500) return 100;                   // 41,500 nodes = ₦100
  if (slot < 66500) return 70;                    // 20,000 nodes = ₦70
  if (slot < 116500) return 60;                   // 50,000 nodes = ₦60
  if (slot < 166500) return 50;                   // 50,000 nodes = ₦50
  if (slot < 191500) return 30;                   // 25,000 nodes = ₦30
  if (slot < 205500) return 25;                   // 14,000 nodes = ₦25
  if (slot < 226000) return 20;                   // 20,500 nodes = ₦20
  if (slot < 250000) return 10;                   // 24,000 nodes = ₦10

  return 0; // Remaining 750,000 nodes = ₦0 (Triggers 200 Roasts & Villain Quotes!)
}

export default function Home() {
  // ==========================================
  // CORE GRID & 1,000,000-NODE SECTOR STATES
  // ==========================================
  const TOTAL_MASTER_NODES = 1000000;
  const NODES_PER_SECTOR = 100;
  const TOTAL_SECTORS = TOTAL_MASTER_NODES / NODES_PER_SECTOR; // 10,000 Sectors of 100 nodes

  const [currentSector, setCurrentSector] = useState<number>(1);
  const [sectorJumpInput, setSectorJumpInput] = useState<string>("1");
  const [searchNodeInput, setSearchNodeInput] = useState<string>("");

  const [nodes, setNodes] = useState<GridNode[]>([]);
  const [soldNodesMap, setSoldNodesMap] = useState<Record<number, SoldNodeRecord>>({});
  const [customOverrides, setCustomOverrides] = useState<CustomNodeOverride[]>([]);
  const [loadingBoard, setLoadingBoard] = useState<boolean>(true);
  const [activeTickerIndex, setActiveTickerIndex] = useState<number>(0);
  const [tickerMessages, setTickerMessages] = useState<string[]>(INITIAL_TICKER_WINS);

  // USER & AUTHENTICATION STATES
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [pinInput, setPinInput] = useState<string>("");

  // EYE TOGGLE STATES (LOGIN & ACCOUNT CREATION)
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);

  // WALLET & DOUBLE-WALLET STATES
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [bonusBalance, setBonusBalance] = useState<number>(0);
  const [walletTab, setWalletTab] = useState<"deposit" | "withdraw" | "referral">("deposit");
  const [fundAmount, setFundAmount] = useState<string>("");

  // WITHDRAWAL & PIN AUTHORIZATION STATES
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [savedPin, setSavedPin] = useState<string>("0000");
  const [tempPin, setTempPin] = useState<string>("");
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  // GAMEPLAY & MODAL STATES
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [isPurchasingNode, setIsPurchasingNode] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: null,
    payload: null,
  });

  // ==========================================
  // 1. INITIALIZATION, REFERRAL TRACKER & PAYSTACK
  // ==========================================
  useEffect(() => {
    if (!document.getElementById("paystack-script")) {
      const script = document.createElement("script");
      script.id = "paystack-script";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get("ref");
      if (refCode) {
        localStorage.setItem("pixelvest_ref", refCode.trim());
      }
    }

    const savedPhone = localStorage.getItem("pixelvest_user_phone");
    if (savedPhone) {
      fetchUserProfile(savedPhone);
    }

    fetchBoardDataFromSupabase();
  }, []);

  useEffect(() => {
    buildSectorNodes(currentSector, customOverrides, soldNodesMap);
  }, [currentSector, customOverrides, soldNodesMap]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTickerIndex((prev) => (prev + 1) % tickerMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tickerMessages]);

  // ==========================================
  // 2. FETCH USER PROFILE & BALANCES
  // ==========================================
  const fetchUserProfile = async (phone: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .single();

      if (data && !error) {
        setUser(data);
        setWalletBalance(Number(data.wallet_balance || 0));
        setBonusBalance(Number(data.bonus_balance || 0));
        setSavedPin(data.withdrawal_pin || "0000");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  // ==========================================
  // 3. LOAD SUPABASE OVERRIDES & BUILD SECTOR NODES
  // ==========================================
  const fetchBoardDataFromSupabase = async () => {
    setLoadingBoard(true);
    try {
      const { data: overridesData } = await supabase
        .from("node_overrides")
        .select("*");

      const activeOverrides: CustomNodeOverride[] = overridesData || [];
      setCustomOverrides(activeOverrides);

      const { data: dbNodes } = await supabase.from("nodes").select("*");
      const soldMap: Record<number, SoldNodeRecord> = {};
      if (dbNodes && Array.isArray(dbNodes)) {
        dbNodes.forEach((item: any) => {
          const id = Number(item.id || item.node_id);
          if (id) {
            soldMap[id] = item;
          }
        });
      }
      setSoldNodesMap(soldMap);
    } catch (err) {
      console.error("Error loading board from Supabase:", err);
    } finally {
      setLoadingBoard(false);
    }
  };

  const buildSectorNodes = (
    sectorNumber: number,
    overridesList: CustomNodeOverride[],
    soldMap: Record<number, SoldNodeRecord>
  ) => {
    const startId = (sectorNumber - 1) * NODES_PER_SECTOR + 1;

    const generatedSectorNodes: GridNode[] = Array.from(
      { length: NODES_PER_SECTOR },
      (_, index) => {
        const id = startId + index;
        const soldRecord = soldMap[id];
        const customOverride = overridesList.find(
          (o) => Number(o.node_id) === id
        );
        const defaultSponsor = DEFAULT_SPONSORS[id];

        // Priority 1: Admin Dashboard Override (node_overrides table)
        // Priority 2: Master 1,000,000-Node / ₦22M Engine
        const resolvedPrize = customOverride
          ? Number(customOverride.custom_prize)
          : getMasterNodePrize(id);

        return {
          id,
          status:
            soldRecord?.status === "sold" || (soldRecord as any)?.is_sold
              ? "sold"
              : "available",
          owner_phone: soldRecord?.owner_phone || null,
          prize_amount: resolvedPrize,
          sponsor_name: customOverride
            ? customOverride.sponsor_name
            : defaultSponsor?.name || soldRecord?.sponsor_name || null,
          logo_url: customOverride
            ? customOverride.logo_url
            : defaultSponsor?.logo || soldRecord?.logo_url || null,
          is_custom: Boolean(customOverride || defaultSponsor),
        };
      }
    );

    setNodes(generatedSectorNodes);
  };

  // ==========================================
  // 4. JUMP TO ANY NODE OR SECTOR (1 - 1,000,000)
  // ==========================================
  const handleJumpToSector = (e: React.FormEvent) => {
    e.preventDefault();
    const sec = Number(sectorJumpInput);
    if (!sec || sec < 1 || sec > TOTAL_SECTORS) {
      return alert(
        `Please enter a Sector between 1 and ${TOTAL_SECTORS.toLocaleString()}.`
      );
    }
    setCurrentSector(sec);
  };

  const handleSearchNodeId = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNode = Number(searchNodeInput);
    if (!targetNode || targetNode < 1 || targetNode > TOTAL_MASTER_NODES) {
      return alert(
        `Please enter a valid Node ID between 1 and ${TOTAL_MASTER_NODES.toLocaleString()}.`
      );
    }
    const targetSector = Math.ceil(targetNode / NODES_PER_SECTOR);
    setCurrentSector(targetSector);
    setSectorJumpInput(String(targetSector));
    setSelectedNodeId(targetNode);
    setTimeout(() => {
      setSelectedNodeId(null);
    }, 3000);
  };

  // ==========================================
  // 5. AUTHENTICATION (LOGIN & ACCOUNT CREATION)
  // ==========================================
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim() || !passwordInput.trim()) {
      return alert("Please enter your phone number and password.");
    }

    setIsSubmittingAuth(true);

    try {
      if (authMode === "register") {
        if (!emailInput.trim()) {
          setIsSubmittingAuth(false);
          return alert("Please enter your email address for Paystack receipts.");
        }
        if (passwordInput !== confirmPasswordInput) {
          setIsSubmittingAuth(false);
          return alert("Passwords do not match! Check using the eye icon 👁️.");
        }
        if (pinInput.length !== 4) {
          setIsSubmittingAuth(false);
          return alert("Please set a 4-digit withdrawal PIN.");
        }

        const { data: existingUser } = await supabase
          .from("users")
          .select("phone")
          .eq("phone", phoneInput.trim())
          .single();

        if (existingUser) {
          setIsSubmittingAuth(false);
          return alert("This phone number is already registered. Please log in.");
        }

        const storedRef = localStorage.getItem("pixelvest_ref");
        const deviceAlreadyRegistered = localStorage.getItem(
          "pixelvest_device_registered"
        );
        const validReferrer =
          storedRef &&
          storedRef !== phoneInput.trim() &&
          !deviceAlreadyRegistered
            ? storedRef
            : null;

        const newUserPayload = {
          phone: phoneInput.trim(),
          email: emailInput.trim(),
          full_name: nameInput.trim() || "Pixel Investor",
          password: passwordInput,
          withdrawal_pin: pinInput,
          wallet_balance: 0,
          bonus_balance: 0,
          referred_by: validReferrer,
        };

        const { data: createdUser, error: insertError } = await supabase
          .from("users")
          .insert([newUserPayload])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        localStorage.setItem("pixelvest_device_registered", "true");
        localStorage.setItem("pixelvest_user_phone", createdUser.phone);

        setUser(createdUser);
        setWalletBalance(0);
        setBonusBalance(0);
        setSavedPin(createdUser.withdrawal_pin || "0000");
        setModal({ isOpen: false, type: null });
        alert("Account created successfully! Welcome to The Pixel Vest.");
      } else {
        const { data: foundUser, error: loginError } = await supabase
          .from("users")
          .select("*")
          .eq("phone", phoneInput.trim())
          .eq("password", passwordInput)
          .single();

        if (loginError || !foundUser) {
          setIsSubmittingAuth(false);
          return alert("Invalid phone number or password.");
        }

        localStorage.setItem("pixelvest_user_phone", foundUser.phone);
        setUser(foundUser);
        setWalletBalance(Number(foundUser.wallet_balance || 0));
        setBonusBalance(Number(foundUser.bonus_balance || 0));
        setSavedPin(foundUser.withdrawal_pin || "0000");
        setModal({ isOpen: false, type: null });
      }
    } catch (err: any) {
      alert("Authentication error: " + (err.message || "Try again."));
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pixelvest_user_phone");
    setUser(null);
    setWalletBalance(0);
    setBonusBalance(0);
    setModal({ isOpen: false, type: null });
  };

  // ==========================================
  // 6. PAYSTACK FUNDING & ANTI-FRAUD REFERRAL ENGINE
  // ==========================================
  const triggerFunding = () => {
    if (!user) {
      return setModal({ isOpen: true, type: "auth" });
    }
    const numericAmount = Number(fundAmount);
    if (!fundAmount || isNaN(numericAmount) || numericAmount < 100) {
      return alert("Minimum deposit amount is ₦100.");
    }

    const paystackPublicKey =
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
      "pk_live_YOUR_LIVE_PAYSTACK_KEY_HERE";

    if (!(window as any).PaystackPop) {
      return alert(
        "Payment gateway is still loading. Please check your internet and try again."
      );
    }

    const handler = (window as any).PaystackPop.setup({
      key: paystackPublicKey,
      email: user.email || `${user.phone}@thepixelvest.com`,
      amount: numericAmount * 100,
      currency: "NGN",
      callback: async function (response: any) {
        try {
          const updatedWallet = walletBalance + numericAmount;
          await supabase
            .from("users")
            .update({ wallet_balance: updatedWallet })
            .eq("phone", user.phone);

          setWalletBalance(updatedWallet);

          // ANTI-FRAUD REFERRAL PAYOUT (₦50 Play-Only Bonus on First Deposit)
          const storedRef =
            user.referred_by || localStorage.getItem("pixelvest_ref");
          const deviceFundedBefore = localStorage.getItem(
            "pixelvest_device_funded"
          );

          if (
            storedRef &&
            !deviceFundedBefore &&
            storedRef !== user.phone
          ) {
            const { data: referrerData } = await supabase
              .from("users")
              .select("bonus_balance")
              .eq("phone", storedRef)
              .single();

            if (referrerData) {
              const newRefBonus = Number(referrerData.bonus_balance || 0) + 50;
              await supabase
                .from("users")
                .update({ bonus_balance: newRefBonus })
                .eq("phone", storedRef);
            }

            localStorage.setItem("pixelvest_device_funded", "true");
          }

          setFundAmount("");
          alert(
            `Payment successful! ₦${numericAmount.toLocaleString()} added to your wallet.`
          );
        } catch (err) {
          console.error("Post-payment update error:", err);
        }
      },
      onClose: function () {
        alert("Deposit window closed.");
      },
    });

    handler.openIframe();
  };

  // ==========================================
  // 7. NODE PURCHASE, DOUBLE-WALLET & ADMIN OVERRIDE
  // ==========================================
  const handleNodeClick = async (clickedNode: GridNode) => {
    if (clickedNode.status === "sold") {
      return alert(
        `Node #${clickedNode.id} has already been secured${
          clickedNode.sponsor_name ? ` (${clickedNode.sponsor_name})` : ""
        }! Pick an available golden node.`
      );
    }

    if (!user) {
      return setModal({ isOpen: true, type: "auth" });
    }

    if (isPurchasingNode) return;

    const NODE_COST = 100;
    const totalAvailableSpend = walletBalance + bonusBalance;

    if (totalAvailableSpend < NODE_COST) {
      alert(
        "Insufficient balance! You need ₦100 to unlock a node. Opening your wallet..."
      );
      return setModal({ isOpen: true, type: "wallet" });
    }

    setIsPurchasingNode(true);
    setSelectedNodeId(clickedNode.id);

    try {
      // 1. SMART DOUBLE-WALLET DEDUCTION (Drains Play Bonus First!)
      let updatedBonus = bonusBalance;
      let updatedWallet = walletBalance;

      if (updatedBonus >= NODE_COST) {
        updatedBonus -= NODE_COST;
      } else {
        const remainderToPay = NODE_COST - updatedBonus;
        updatedBonus = 0;
        updatedWallet -= remainderToPay;
      }

      // 2. CHECK FOR ADMIN CUSTOM OVERRIDE FIRST; OTHERWISE USE 1M-NODE ENGINE
      const matchedOverride = customOverrides.find(
        (o) => Number(o.node_id) === clickedNode.id
      );

      let prizeWon = 0;
      let sponsorTitle = clickedNode.sponsor_name || null;

      if (matchedOverride) {
        prizeWon = Number(matchedOverride.custom_prize);
        sponsorTitle = matchedOverride.sponsor_name;
      } else {
        prizeWon = getMasterNodePrize(clickedNode.id);
      }

      // 3. CREDIT REAL WITHDRAWABLE WALLET IF USER WON
      const finalWalletBalance = updatedWallet + prizeWon;

      await supabase
        .from("users")
        .update({
          wallet_balance: finalWalletBalance,
          bonus_balance: updatedBonus,
        })
        .eq("phone", user.phone);

      setWalletBalance(finalWalletBalance);
      setBonusBalance(updatedBonus);

      // 4. MARK NODE AS SOLD IN SUPABASE & LOCAL STATE (KEEPING LOGO VISIBLE!)
      const soldPayload: SoldNodeRecord = {
        id: clickedNode.id,
        status: "sold",
        owner_phone: user.phone,
        prize_amount: prizeWon,
        sponsor_name: sponsorTitle,
        logo_url: clickedNode.logo_url || null,
      };

      await supabase.from("nodes").upsert([soldPayload]);

      setSoldNodesMap((prev) => ({
        ...prev,
        [clickedNode.id]: soldPayload,
      }));

      // 5. PICK FROM THE 200-QUOTE BANK (150 NIGERIAN ROASTS + 50 VILLAIN QUOTES)
      const randomRoast =
        MASTER_ROAST_AND_VILLAIN_BANK[
          Math.floor(Math.random() * MASTER_ROAST_AND_VILLAIN_BANK.length)
        ];

      if (prizeWon > 0) {
        const maskedPhone = `${user.phone.slice(0, 4)}***${user.phone.slice(-3)}`;
        setTickerMessages((prev) => [
          `🔥 ${maskedPhone} just won ₦${prizeWon.toLocaleString()} on Node #${clickedNode.id}${
            sponsorTitle ? ` (${sponsorTitle})` : ""
          }!`,
          ...prev,
        ]);
      }

      setModal({
        isOpen: true,
        type: "node_result",
        payload: {
          nodeId: clickedNode.id,
          prizeWon,
          sponsorName: sponsorTitle,
          logoUrl: clickedNode.logo_url,
          roastText: randomRoast,
        },
      });
    } catch (err: any) {
      alert("Error unlocking node: " + (err.message || "Please try again."));
    } finally {
      setIsPurchasingNode(false);
      setSelectedNodeId(null);
    }
  };

  // ==========================================
  // 8. WITHDRAWAL EXECUTION (STRICTLY REAL WALLET ONLY)
  // ==========================================
  const initiateWithdrawalRequest = () => {
    const amountNum = Number(withdrawAmount);
    if (!withdrawAmount || isNaN(amountNum) || amountNum < 500) {
      return alert("Minimum withdrawal amount is ₦500.");
    }
    if (amountNum > walletBalance) {
      return alert(
        "Insufficient withdrawable balance! Remember: Your ₦50 Referral Bonus is strictly for playing the grid and cannot be withdrawn."
      );
    }
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      return alert("Please complete all bank details before withdrawing.");
    }

    setTempPin("");
    setModal({ isOpen: true, type: "pin" });
  };

  const executeWithdrawal = async () => {
    if (!user) return;
    const amountNum = Number(withdrawAmount);

    setIsWithdrawing(true);
    try {
      const updatedWallet = walletBalance - amountNum;

      const { error: balanceError } = await supabase
        .from("users")
        .update({ wallet_balance: updatedWallet })
        .eq("phone", user.phone);

      if (balanceError) throw balanceError;

      await supabase.from("withdrawals").insert([
        {
          phone: user.phone,
          amount: amountNum,
          bank_name: bankName.trim(),
          account_number: accountNumber.trim(),
          account_name: accountName.trim(),
          status: "pending",
        },
      ]);

      setWalletBalance(updatedWallet);
      setWithdrawAmount("");
      setModal({ isOpen: false, type: null });
      alert(
        `Withdrawal of ₦${amountNum.toLocaleString()} authorized! Funds are being processed to your ${bankName} account.`
      );
    } catch (err: any) {
      alert("Withdrawal failed: " + (err.message || "Try again."));
    } finally {
      setIsWithdrawing(false);
    }
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#06080E",
        color: "#FFFFFF",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        paddingBottom: "80px",
      }}
    >
      {/* LIVE FOMO TICKER BAR */}
      <div
        style={{
          backgroundColor: "#0B111E",
          borderBottom: "1px solid rgba(255, 215, 0, 0.2)",
          padding: "10px 16px",
          textAlign: "center",
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "#FBBF24",
          letterSpacing: "0.3px",
        }}
      >
        {tickerMessages[activeTickerIndex]}
      </div>

      {/* TOP NAVIGATION HEADER */}
      <header
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "20px 16px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.6rem",
              fontWeight: 900,
              background: "linear-gradient(90deg, #FFD700, #10B981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            ▲ THE PIXEL VEST
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", color: "#9CA3AF" }}>
            1,000,000 Nodes • ₦22,000,000 Prize Vault • Tap a Golden Node (₦100)
          </p>
        </div>

        {/* WALLET & AUTH ACTION BUTTONS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {user ? (
            <>
              <div
                onClick={() => setModal({ isOpen: true, type: "wallet" })}
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid #10B981",
                  padding: "8px 14px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>
                  MAIN WALLET
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#10B981",
                  }}
                >
                  ₦{walletBalance.toLocaleString()}
                </span>
              </div>

              <div
                onClick={() => {
                  setWalletTab("referral");
                  setModal({ isOpen: true, type: "wallet" });
                }}
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid #F59E0B",
                  padding: "8px 14px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ fontSize: "0.7rem", color: "#FBBF24" }}>
                  PLAY BONUS
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#FBBF24",
                  }}
                >
                  ₦{bonusBalance.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => setModal({ isOpen: true, type: "wallet" })}
                style={{
                  padding: "10px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#10B981",
                  color: "#000",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                + FUND / CASH OUT
              </button>

              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 12px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#F87171",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setModal({ isOpen: true, type: "auth" })}
              style={{
                padding: "12px 22px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #FFD700, #F59E0B)",
                color: "#000",
                fontWeight: 900,
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
              }}
            >
              LOGIN / CREATE ACCOUNT
            </button>
          )}
        </div>
      </header>

      {/* SECTOR NAVIGATION & NODE SEARCH BAR */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "18px auto 10px auto",
          padding: "0 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            fontSize: "0.8rem",
            flexWrap: "wrap",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "4px",
                background: "linear-gradient(135deg, #FFD700, #B8860B)",
                display: "inline-block",
              }}
            />
            Available Node (₦100)
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#9CA3AF",
            }}
          >
            <span
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "4px",
                backgroundColor: "#07090E",
                border: "1px solid #374151",
                display: "inline-block",
              }}
            />
            Sold Node (Darkened • Logo Still Visible)
          </span>
        </div>

        {/* SEARCH SPECIFIC NODE ID (1 - 1,000,000) */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <form
            onSubmit={handleSearchNodeId}
            style={{ display: "flex", gap: "6px" }}
          >
            <input
              type="number"
              placeholder="Find Node # (1-1000000)"
              value={searchNodeInput}
              onChange={(e) => setSearchNodeInput(e.target.value)}
              style={{
                width: "165px",
                padding: "7px 10px",
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#fff",
                fontSize: "0.78rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#10B981",
                border: "none",
                color: "#000",
                fontWeight: 800,
                padding: "7px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.78rem",
              }}
            >
              Go
            </button>
          </form>

          <button
            onClick={fetchBoardDataFromSupabase}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#D1D5DB",
              padding: "7px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.78rem",
            }}
          >
            ↻ Refresh Live Board
          </button>
        </div>
      </section>

      {/* SECTOR PAGINATION HEADER */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "8px auto",
          padding: "0 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ fontSize: "0.85rem", color: "#FBBF24", fontWeight: 700 }}>
          Viewing Sector #{currentSector.toLocaleString()} of{" "}
          {TOTAL_SECTORS.toLocaleString()} •{" "}
          <span style={{ color: "#9CA3AF", fontWeight: 500 }}>
            Nodes #
            {((currentSector - 1) * NODES_PER_SECTOR + 1).toLocaleString()} – #
            {(currentSector * NODES_PER_SECTOR).toLocaleString()}
          </span>
          {currentSector === 1 && (
            <span
              style={{
                marginLeft: "8px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#10B981",
                padding: "2px 8px",
                borderRadius: "6px",
                fontSize: "0.72rem",
                fontWeight: 800,
              }}
            >
              🔥 HOT FIRST-100 ZONE
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button
            disabled={currentSector <= 1}
            onClick={() => {
              const prev = Math.max(1, currentSector - 1);
              setCurrentSector(prev);
              setSectorJumpInput(String(prev));
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: currentSector <= 1 ? "#4B5563" : "#fff",
              cursor: currentSector <= 1 ? "not-allowed" : "pointer",
              fontSize: "0.78rem",
              fontWeight: 700,
            }}
          >
            ← Prev 100
          </button>

          <form
            onSubmit={handleJumpToSector}
            style={{ display: "flex", gap: "4px" }}
          >
            <input
              type="number"
              value={sectorJumpInput}
              onChange={(e) => setSectorJumpInput(e.target.value)}
              style={{
                width: "70px",
                padding: "6px",
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#fff",
                textAlign: "center",
                fontSize: "0.78rem",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                backgroundColor: "rgba(245, 158, 11, 0.2)",
                border: "1px solid #F59E0B",
                color: "#FBBF24",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 800,
              }}
            >
              Sector
            </button>
          </form>

          <button
            disabled={currentSector >= TOTAL_SECTORS}
            onClick={() => {
              const next = Math.min(TOTAL_SECTORS, currentSector + 1);
              setCurrentSector(next);
              setSectorJumpInput(String(next));
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: currentSector >= TOTAL_SECTORS ? "#4B5563" : "#fff",
              cursor:
                currentSector >= TOTAL_SECTORS ? "not-allowed" : "pointer",
              fontSize: "0.78rem",
              fontWeight: 700,
            }}
          >
            Next 100 →
          </button>
        </div>
      </section>

      {/* ========================================== */}
      {/* THE INTERACTIVE MASTER GRID                */}
      {/* ========================================== */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "12px auto",
          padding: "16px",
        }}
      >
        {loadingBoard ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#FBBF24",
              fontWeight: 700,
            }}
          >
            Loading The Pixel Vest Vault...
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
              gap: "10px",
            }}
          >
            {nodes.map((node) => {
              const isSold = node.status === "sold";
              const isSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  style={{
                    position: "relative",
                    height: "88px",
                    borderRadius: "14px",
                    // GOLDEN WHEN AVAILABLE, DARK/BLACK WHEN SOLD (NEVER HIDES LOGO!)
                    background: isSold
                      ? "#07090E"
                      : "linear-gradient(135deg, #FFD700 0%, #D97706 60%, #92400E 100%)",
                    border: isSelected
                      ? "2px solid #10B981"
                      : isSold
                      ? "1px solid rgba(255, 255, 255, 0.14)"
                      : "1px solid rgba(255, 235, 150, 0.65)",
                    boxShadow: isSold
                      ? "inset 0 2px 8px rgba(0,0,0,0.85)"
                      : "0 4px 14px rgba(217, 119, 6, 0.28)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isSold ? "not-allowed" : "pointer",
                    overflow: "hidden",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    transform: isSelected ? "scale(0.95)" : "scale(1)",
                  }}
                >
                  {/* NODE NUMBER BADGE IN TOP-LEFT CORNER */}
                  <span
                    style={{
                      position: "absolute",
                      top: "5px",
                      left: "7px",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      color: isSold ? "#6B7280" : "#111827",
                      zIndex: 3,
                    }}
                  >
                    #{node.id}
                  </span>

                  {/* SOLD STATUS TAG IN TOP-RIGHT CORNER */}
                  {isSold && (
                    <span
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "6px",
                        fontSize: "0.52rem",
                        fontWeight: 900,
                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                        color: "#F87171",
                        padding: "1px 5px",
                        borderRadius: "4px",
                        zIndex: 3,
                      }}
                    >
                      SOLD
                    </span>
                  )}

                  {/* SPONSOR LOGO (GOOGLE, NELFUND, ETC.) — REMAINS VISIBLE EVEN WHEN SOLD! */}
                  {node.logo_url ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                        marginTop: "6px",
                      }}
                    >
                      <img
                        src={node.logo_url}
                        alt={node.sponsor_name || `Node ${node.id}`}
                        style={{
                          width: "36px",
                          height: "36px",
                          objectFit: "contain",
                          filter: isSold
                            ? "brightness(0.85) contrast(1.1)"
                            : "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                          opacity: isSold ? 0.88 : 1,
                        }}
                      />
                      {node.sponsor_name && (
                        <span
                          style={{
                            marginTop: "4px",
                            fontSize: "0.58rem",
                            fontWeight: 900,
                            color: isSold ? "#9CA3AF" : "#111827",
                            backgroundColor: isSold
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(255,255,255,0.75)",
                            padding: "1px 5px",
                            borderRadius: "4px",
                            maxWidth: "74px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {node.sponsor_name}
                        </span>
                      )}
                    </div>
                  ) : (
                    /* STANDARD NON-SPONSOR NODE ICON */
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        zIndex: 2,
                        marginTop: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.2rem",
                          opacity: isSold ? 0.35 : 0.9,
                        }}
                      >
                        {isSold ? "🔒" : "💎"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          color: isSold ? "#4B5563" : "#1F2937",
                          marginTop: "2px",
                        }}
                      >
                        {isSold ? "CLAIMED" : "₦100"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================== */}
      {/* MODALS CONTAINER (AUTH, WALLET, PIN, WIN)  */}
      {/* ========================================== */}
      {modal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.82)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "430px",
              backgroundColor: "#0F172A",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
            }}
          >
            {/* ------------------------------------------ */}
            {/* MODAL 1: AUTHENTICATION (WITH 👁️ TOGGLE)  */}
            {/* ------------------------------------------ */}
            {modal.type === "auth" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "18px",
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>
                    {authMode === "login" ? "Welcome Back" : "Create Account"}
                  </h2>
                  <button
                    onClick={() => setModal({ isOpen: false, type: null })}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9CA3AF",
                      fontSize: "1.3rem",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "18px",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    padding: "4px",
                    borderRadius: "12px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer",
                      backgroundColor:
                        authMode === "login" ? "#10B981" : "transparent",
                      color: authMode === "login" ? "#000" : "#9CA3AF",
                    }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer",
                      backgroundColor:
                        authMode === "register" ? "#10B981" : "transparent",
                      color: authMode === "register" ? "#000" : "#9CA3AF",
                    }}
                  >
                    Create Account
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit}>
                  {authMode === "register" && (
                    <>
                      <input
                        type="text"
                        placeholder="Full Name / Nickname"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          marginBottom: "12px",
                          borderRadius: "14px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />

                      <input
                        type="email"
                        placeholder="Email Address (for Paystack receipts)"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          marginBottom: "12px",
                          borderRadius: "14px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </>
                  )}

                  <input
                    type="tel"
                    placeholder="Phone Number (e.g. 08123456789)"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      marginBottom: "12px",
                      borderRadius: "14px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* PASSWORD INPUT WITH EYE TOGGLE 👁️ */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      marginBottom: "12px",
                    }}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px 48px 14px 16px",
                        borderRadius: "14px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide Password" : "Show Password"}
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.15rem",
                        color: "#9CA3AF",
                      }}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* CONFIRM PASSWORD & PIN IN ACCOUNT CREATION */}
                  {authMode === "register" && (
                    <>
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          marginBottom: "12px",
                        }}
                      >
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          value={confirmPasswordInput}
                          onChange={(e) =>
                            setConfirmPasswordInput(e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "14px 48px 14px 16px",
                            borderRadius: "14px",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#fff",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          title={
                            showConfirmPassword
                              ? "Hide Confirm Password"
                              : "Show Confirm Password"
                          }
                          style={{
                            position: "absolute",
                            right: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "1.15rem",
                            color: "#9CA3AF",
                          }}
                        >
                          {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                      </div>

                      <input
                        type="password"
                        maxLength={4}
                        placeholder="Set 4-Digit Withdrawal PIN (e.g. 1234)"
                        value={pinInput}
                        onChange={(e) =>
                          setPinInput(e.target.value.replace(/\D/g, ""))
                        }
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          marginBottom: "16px",
                          borderRadius: "14px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    style={{
                      width: "100%",
                      padding: "15px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #10B981, #059669)",
                      color: "#000",
                      fontWeight: 900,
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                    }}
                  >
                    {isSubmittingAuth
                      ? "PROCESSING..."
                      : authMode === "login"
                      ? "ENTER THE VAULT"
                      : "CREATE ACCOUNT NOW"}
                  </button>
                </form>
              </div>
            )}

            {/* ------------------------------------------ */}
            {/* MODAL 2: WALLET, DEPOSIT & ₦50 REFERRAL    */}
            {/* ------------------------------------------ */}
            {modal.type === "wallet" && user && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
                    My Vault Wallet
                  </h2>
                  <button
                    onClick={() => setModal({ isOpen: false, type: null })}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9CA3AF",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "14px",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>
                      Withdrawable Cash
                    </div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 900,
                        color: "#10B981",
                        marginTop: "4px",
                      }}
                    >
                      ₦{walletBalance.toLocaleString()}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "14px",
                      backgroundColor: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", color: "#FBBF24" }}>
                      Referral Play Bonus
                    </div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 900,
                        color: "#FBBF24",
                        marginTop: "4px",
                      }}
                    >
                      ₦{bonusBalance.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginBottom: "16px",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    padding: "4px",
                    borderRadius: "12px",
                  }}
                >
                  <button
                    onClick={() => setWalletTab("deposit")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      backgroundColor:
                        walletTab === "deposit" ? "#10B981" : "transparent",
                      color: walletTab === "deposit" ? "#000" : "#9CA3AF",
                    }}
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setWalletTab("withdraw")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      backgroundColor:
                        walletTab === "withdraw" ? "#10B981" : "transparent",
                      color: walletTab === "withdraw" ? "#000" : "#9CA3AF",
                    }}
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => setWalletTab("referral")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      backgroundColor:
                        walletTab === "referral" ? "#F59E0B" : "transparent",
                      color: walletTab === "referral" ? "#000" : "#9CA3AF",
                    }}
                  >
                    Earn ₦50
                  </button>
                </div>

                {walletTab === "deposit" && (
                  <div>
                    <input
                      type="number"
                      placeholder="Enter Amount (e.g. 500)"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        marginBottom: "12px",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      onClick={triggerFunding}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "12px",
                        backgroundColor: "#10B981",
                        color: "#000",
                        fontWeight: 900,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      FUND WITH PAYSTACK
                    </button>
                  </div>
                )}

                {walletTab === "withdraw" && (
                  <div>
                    <input
                      type="number"
                      placeholder="Amount to Withdraw (Min ₦500)"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        marginBottom: "10px",
                        boxSizing: "border-box",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Bank Name (e.g. OPay, PalmPay, GTBank)"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        marginBottom: "10px",
                        boxSizing: "border-box",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="10-Digit Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        marginBottom: "10px",
                        boxSizing: "border-box",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Account Name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        marginBottom: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      onClick={initiateWithdrawalRequest}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "12px",
                        backgroundColor: "#F59E0B",
                        color: "#000",
                        fontWeight: 900,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      REQUEST CASHOUT
                    </button>
                  </div>
                )}

                {walletTab === "referral" && (
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderRadius: "14px",
                      border: "1px dashed #10B981",
                    }}
                  >
                    <p
                      style={{
                        color: "#10B981",
                        fontSize: "0.92rem",
                        fontWeight: 800,
                        margin: "0 0 8px 0",
                      }}
                    >
                      🚀 EARN ₦50 PLAY CREDIT PER FRIEND
                    </p>
                    <p
                      style={{
                        color: "#9CA3AF",
                        fontSize: "0.78rem",
                        lineHeight: 1.5,
                        margin: "0 0 12px 0",
                      }}
                    >
                      Share your link below. Once your friend registers and makes
                      their first deposit, you automatically get ₦50 in Play
                      Bonus to unlock nodes on the grid! (Non-withdrawable).
                    </p>
                    <input
                      type="text"
                      readOnly
                      value={
                        typeof window !== "undefined"
                          ? `${window.location.origin}?ref=${user.phone}`
                          : `https://thepixelvestlive.vercel.app?ref=${user.phone}`
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: "#000",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#FBBF24",
                        fontSize: "0.8rem",
                        outline: "none",
                        boxSizing: "border-box",
                        marginBottom: "10px",
                      }}
                    />
                    <button
                      onClick={() => {
                        const link =
                          typeof window !== "undefined"
                            ? `${window.location.origin}?ref=${user.phone}`
                            : `https://thepixelvestlive.vercel.app?ref=${user.phone}`;
                        navigator.clipboard.writeText(link);
                        alert("Referral link copied! Share it on WhatsApp.");
                      }}
                      style={{
                        width: "100%",
                        padding: "11px",
                        borderRadius: "10px",
                        backgroundColor: "#10B981",
                        color: "#000",
                        fontWeight: 800,
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                      }}
                    >
                      COPY REFERRAL LINK
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------ */}
            {/* MODAL 3: NODE OUTCOME (WIN OR 200 ROASTS)  */}
            {/* ------------------------------------------ */}
            {modal.type === "node_result" && modal.payload && (
              <div style={{ textAlign: "center" }}>
                {modal.payload.logoUrl && (
                  <img
                    src={modal.payload.logoUrl}
                    alt="Sponsor"
                    style={{
                      width: "56px",
                      height: "56px",
                      objectFit: "contain",
                      marginBottom: "10px",
                    }}
                  />
                )}
                <h2
                  style={{
                    margin: "0 0 8px 0",
                    color: modal.payload.prizeWon > 0 ? "#10B981" : "#F87171",
                  }}
                >
                  {modal.payload.prizeWon > 0
                    ? `🎉 BOOM! ₦${modal.payload.prizeWon.toLocaleString()} WON!`
                    : `🔒 NODE #${modal.payload.nodeId} UNLOCKED`}
                </h2>
                <p
                  style={{
                    color: "#D1D5DB",
                    fontSize: "0.94rem",
                    lineHeight: 1.55,
                    backgroundColor: "rgba(255,255,255,0.04)",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {modal.payload.prizeWon > 0
                    ? `Congratulations! You secured ${
                        modal.payload.sponsorName || "instant cash"
                      } on Node #${
                        modal.payload.nodeId
                      }. The cash has been credited straight to your withdrawable wallet!`
                    : modal.payload.roastText.replace(/^\d+\.\s*/, "")}
                </p>
                <button
                  onClick={() => setModal({ isOpen: false, type: null })}
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    backgroundColor: "#10B981",
                    color: "#000",
                    fontWeight: 900,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  CONTINUE PLAYING
                </button>
              </div>
            )}

            {/* ------------------------------------------ */}
            {/* MODAL 4: PIN CONFIRMATION                  */}
            {/* ------------------------------------------ */}
            {modal.type === "pin" && (
              <div style={{ textAlign: "center" }}>
                <h3 style={{ marginTop: 0 }}>Enter 4-Digit Withdrawal PIN</h3>
                <input
                  type="password"
                  maxLength={4}
                  value={tempPin}
                  onChange={(e) => setTempPin(e.target.value)}
                  placeholder="••••"
                  style={{
                    width: "100%",
                    padding: "14px",
                    textAlign: "center",
                    fontSize: "1.4rem",
                    letterSpacing: "8px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    marginBottom: "16px",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={() => {
                    if (tempPin === savedPin) {
                      setTempPin("");
                      executeWithdrawal();
                    } else {
                      alert("Incorrect Withdrawal PIN!");
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    backgroundColor: "#10B981",
                    color: "#000",
                    fontWeight: 900,
                    border: "none",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  {isWithdrawing ? "AUTHORIZING..." : "CONFIRM"}
                </button>
                <button
                  onClick={() => {
                    setTempPin("");
                    setModal({ isOpen: true, type: "wallet", payload: null });
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    backgroundColor: "transparent",
                    color: "#9CA3AF",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}