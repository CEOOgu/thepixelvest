"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

// ==========================================
// PAYSTACK LIVE PUBLIC KEY
// ==========================================
const PAYSTACK_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
  "pk_live_4f604b2d9d9689f50eba439e704600844f7dfd01";

// ==========================================
// INTERFACES & TYPES
// ==========================================
interface GridNode {
  id: number;
  status: "available" | "sold";
  owner_phone?: string | null;
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
  1: { name: "GOOGLE", logo: "https://www.google.com/s2/favicons?domain=google.com&sz=128" },
  7: { name: "PAYSTACK", logo: "https://www.google.com/s2/favicons?domain=paystack.com&sz=128" },
  12: { name: "MTN", logo: "https://www.google.com/s2/favicons?domain=mtn.ng&sz=128" },
};

// ==========================================
// 150 NIGERIAN STREET & TRENDING ROASTS
// ==========================================
const NIGERIAN_STREET_ROASTS: string[] = [
  "Aii Jehovah! Which kind temptation be this? Empty box! 😭",
  "Eyah, sorry o! Try another node, you go cry ke? Never! 😂",
  "No evidence! You go explain tire because nothing dey inside this box.",
  "Otilo! That your ₦100 don enter voice mail. Move to the next node jor!",
  "Dey play! You think say na every node carry ₦10k? Try again boss!",
  "Chai, sapa nice one! This node dry pass harmattan breeze.",
  "Composure! Maintain steeze, no let anybody see say you pick empty box 💀",
  "Minus 10,000 aura! How you go leave correct nodes go pick this empty one?",
  "Village people work! Dem mount roadblock for this particular node.",
  "Who you offend today? Even cobweb no gree stay inside this node 😂",
  "Shege Banza! This node just show you premium tears.",
  "Nothing dey here o! Go warm eba chop, your next click fit pay sha.",
  "Jehovah overdo, pass this node! Oya tap the one beside am.",
  "E choc! Your hand just touch pure oxygen. No shishi!",
  "Justice for your ₦100! Because the way e take vanish ehn... 😂",
  "No panic, CEO! Na test of faith. The main cash dey the next line.",
  "You sure say you wash hand before you tap this node? Empty vault!",
  "Omo, this box empty pass lecture hall on Friday afternoon!",
  "Breakfast! Dem just serve you hot-hot inside this node 💔",
  "Wetin be this? Even NEPA get light pass this node wey you pick!",
  "Calma, calma! Big boys no dey cry for ₦100. Unlock another one!",
  "Zero returns! If na exam be this, na carry-over straight 😭",
  "Your village people dey use Starlink track your hand! Change pattern.",
  "Not even a single kobo! This node na pure vibes and Inshallah.",
  "You don buy market! Empty nylon na im full inside here.",
  "Aswear, the money wey suppose dey here just travel go Canada now now!",
  "Hold your chest! Take deep breath... because you no win anything 😂",
  "Na wa o! Out of 1 million nodes, your hand go jam the driest one!",
  "No gree for sapa! Tap another golden box, your glory dey front.",
  "Bombastic side eye 👀... This node literally laughed at your click!",
  "Omo x1000! Even rat enter this node, e go faint for hunger!",
  "You go cry? No cry boss, tap the next gold box make you recover!",
  "This node na fake life! Golden outside, pure dust inside.",
  "Abeg shift! Your hand too heavy for this node, try the next row.",
  "Sapa dey hail you o! E say make you try one more box.",
  "Dem don sweep this vault clean before you wake up!",
  "Na breeze full inside here! Even ₦10 no gree hide for your eye.",
  "Odogwu, your network dey whine you? Because this pick na zero!",
  "If 'Had I Known' was a node, na this exact box be am!",
  "Look left, look right... nobody see you, hurry up tap another one! 😂",
  "E pain me for your body! That ₦100 just do disappearance jutsu.",
  "Format your hand! Change finger take tap the next node.",
  "Use your left hand tap the next one, this right hand don cast!",
  "Nothing concern this node concern money! Na pure decoration.",
  "Omo, na who send you come this particular number? Empty!",
  "Even POS woman go pity you for this empty box wey you open!",
  "You tap am with full confidence, yama-yama come comot! 💀",
  "This node dey on fasting and prayer. Zero Naira inside!",
  "Try again jor! Winners no dey quit because of ordinary ₦100.",
  "Chai! The person wey eat the money for this node no even leave crumb.",
  "Na setup! This node na trap wey village people set since morning.",
  "Wipe your tears with handkerchief, the next node get joy!",
  "Your steeze just drop by 40%! Recover am for the next box.",
  "Wait first... na close eye you take pick this node abi na open eye? 😂",
  "E be like say this node owe bank, dem don deduct everything!",
  "Zero! Nada! Kponkpi! Nothing dey inside this golden box.",
  "If to say luck na course, you for buy textbook today! Try again.",
  "Oya clap for yourself! You just successfully unlocked pure air 👏",
  "This node dry pass cabin biscuit without tea!",
  "No dulling! One empty box no fit stop Odogwu from cashing out.",
  "Who lock this vault collect the key? Because nothing dey inside!",
  "Na wa! Even alert of ₦0.00 no gree drop from this box.",
  "You sure say your village people no dey online right now? 👀",
  "This node na 'Try Again Later' in human form!",
  "Sorry boss! Make we pretend say you no tap this particular box.",
  "E don cast! Move two boxes down make you check whether blessing dey there.",
  "Sapa 1 - 0 You! Equalize sharp-sharp for the next node.",
  "The money inside here don elope with another investor!",
  "Na ordinary cobweb and old newspaper full inside this node.",
  "Focus! No let one dry node distract your ₦10k target.",
  "Ah! Even beggars go reject this node if you dash dem.",
  "This box na audio money! Zero balance on arrival.",
  "Drink cold water first, then tap the next box with anger!",
  "Omo, this node just give you dirty slap for wallet 😂",
  "No worry, na sacrifice! The next click fit open the main vault.",
  "How market? Because inside this node, market no move at all!",
  "E-empty! Even Chinese man know say nothing dey here.",
  "You tap Node, Node tap you back! ₦100 gone to the wind.",
  "Your instinct whine you big time for this number o!",
  "Abeg who recommend this number give you? Collect your ₦100 back from am!",
  "Pure dust! Even broom no fit sweep anything comot from here.",
  "Dem don use spiritual remote lock the cash for this box!",
  "No vex! Even Dangote dey miss target sometimes. Tap another one!",
  "This node na 'Viewed by 0 people' because nothing dey inside!",
  "Shishi no dey! Na only echo dey sound inside this vault.",
  "If depression was a grid box, na this exact one you just click 😂",
  "Otilo far away! Even search party no fit find that your ₦100 again.",
  "Breathe in, breathe out... oya tap another gold box!",
  "This node na pure scammer vibes—shiny gold outside, empty inside!",
  "Na who tell you say money dey this corner? Shift go middle jor!",
  "Chai! Your hand just miss the winning box by one inch!",
  "Empty like student pocket for January 25th!",
  "No panic! Even Manchester United dey lose match before comeback.",
  "Dem just use your ₦100 buy pure water for headquarters! 😂",
  "You almost hit am... na lie, you no near am at all! Empty box!",
  "This node na 'Seen 2:14 AM' with zero reply!",
  "Village people conference dey hold inside this exact node!",
  "Oya shake body, commot bad luck before you tap the next one!",
  "If 'Overconfidence' was a person! See as the box empty.",
  "Zero Naira, Zero Kobo! Only premium roast dey inside here.",
  "Na wa! This box dry pass lecturer joke for 8 AM class.",
  "Even network provider shock why you pick this node!",
  "That your ₦100 don join ancestors. Rest in peace to am! 🕊️",
  "Try another sector boss, this corner dey do stronghead!",
  "Nothing! Even microscope no fit see one kobo inside this box.",
  "Omo, na who do this matrix? Why this particular box dry like this!",
  "Smile for camera 📸! You just unlocked the most useless box today.",
  "You get mind o! You just jump all the winning boxes land for desert.",
  "Eyah! Take am as offering, the main testimony dey front.",
  "Sapa laugh wicked laugh when you tap this number!",
  "No evidence of funds found! Case dismissed with ₦0.",
  "Even AI shock for the way your hand take dodge all the money!",
  "Change your sitting position! E be like say that chair get bad luck 😂",
  "Waka pass! Nothing concern this node with giveaway.",
  "Odogwu, no fall hand! One more click to show who be boss.",
  "This box na 'Insufficient Funds' headquarters!",
  "Dem don cash out the glory of this node since 1999!",
  "Na pure mirage! You think say na gold, na ordinary sand.",
  "Jehovah! See as ₦100 just evaporate without receipt!",
  "No cry o! Adult no suppose cry because of empty node 😂",
  "This node na ghost mode—zero activity, zero Naira!",
  "Even native doctor no fit conjure one Naira comot from this box.",
  "E be like say you step on lizard tail this morning! Try again jor.",
  "Empty! The money wey dey here don go NYSC camp.",
  "You tap am with steeze, e reply you with premium dust!",
  "Shift go front! Back benchers no dey keep money here.",
  "Omo, this node tight pass hostel security at 11 PM!",
  "No single kobo! Even the box dey shy to open face.",
  "Your hand just jam rock! Tap the soft gold box beside am.",
  "If 'Try Your Luck' had a wicked twin, na this node!",
  "Format that number from your head—e no pay at all!",
  "Chai! Dem just serve you cold pap without sugar inside this node.",
  "Nothing dey! Na only wind dey blow inside this vault.",
  "You sure say nobody hex your screen? Wipe am tap again! 😂",
  "This node na '404 Cash Not Found'!",
  "Oya, do fast tap another one before your village people reload!",
  "Even recession fear the level of emptiness inside this box!",
  "That your ₦100 just enter one-chance bus! Move on boss.",
  "Zero! Even calculator refuse to waste battery on top this node.",
  "Na wa o! You dodge ₦1,000 go hug empty drum!",
  "Composure still intact? Oya prove am for the next node!",
  "This node don retire from paying money since last year!",
  "Empty vault! Only cockroach and receipt of old debt dey inside.",
  "E choc! How person go pick empty box with full chest like this?",
  "No retreat, no surrender! Sapa no fit win this round.",
  "Dem don transfer the blessing of this box go another number!",
  "Laugh am off 😂! Na who give up na im lose.",
  "This node dry pass fuel scarcity queue for Abuja!",
  "Zero alert! Even SMS charges refuse to cut from this box.",
  "Oya last warning to sapa: the next node MUST drop cash!",
];

// ==========================================
// 50 COLD VILLAIN QUOTES (ANIME & MOVIES)
// ==========================================
const VILLAIN_ROAST_QUOTES: string[] = [
  "\"Wake up to reality. Nothing ever goes as planned in this accursed grid.\" — Madara Uchiha",
  "\"You could not live with your own failure. Where did that bring you? Back to an empty node.\" — Thanos",
  "\"It’s not about the ₦100... it’s about sending a message. Everything burns!\" — The Joker",
  "\"I am inevitable... and this node is completely empty.\" — Thanos",
  "\"This world shall know pain... starting with your wallet balance.\" — Pain (Nagato)",
  "\"Did you really think clicking that box was part of your plan? It was part of mine.\" — Sosuke Aizen",
  "\"I’ll take a potato chip... and eat your ₦100!\" — Light Yagami (Kira)",
  "\"You are not the guy. You're not capable of being the guy on this node.\" — Mike Ehrmantraut",
  "\"I am the one who knocks! And I emptied this vault before you arrived.\" — Walter White",
  "\"Look at me, Hector. Zero Naira inside this box.\" — Gus Fring",
  "\"Stand proud. You clicked hard, but this node is empty.\" — Ryomen Sukuna",
  "\"Know your place, fool! My domain holds zero cash for that click.\" — Ryomen Sukuna",
  "\"Throughout Heaven and Earth, this node alone is the broke one.\" — Kenjaku",
  "\"People’s dreams never end! Unfortunately, your ₦100 just did.\" — Blackbeard",
  "\"Justice will prevail? Of course! Because the house just won your ₦100!\" — Doflamingo",
  "\"Weakness disgusts me... especially picking an empty node like this.\" — Madara Uchiha",
  "\"You’re just a cheap knockoff. I’m the upgrade—and I took the cash.\" — Homelander",
  "\"I can do whatever the hell I want! Including leaving this node empty.\" — Homelander",
  "\"Why so serious? Let’s put a smile on that zero balance!\" — The Joker",
  "\"You merely adopted the grid. I was born in it, molded by it.\" — Bane",
  "\"Peace has cost you your strength. Victory has defeated your ₦100.\" — Bane",
  "\"If you think this node has a happy ending, you haven’t been paying attention.\" — Ramsay Bolton",
  "\"Chaos isn’t a pit. Chaos is a ladder... and you just slipped off a rung.\" — Littlefinger",
  "\"When you play the Game of Nodes, you win or you get roasted.\" — Cersei Lannister",
  "\"A lion does not concern himself with the loss of ₦100.\" — Tywin Lannister",
  "\"All that for a drop of ₦0?\" — Thanos",
  "\"Reality is often disappointing. This node certainly was.\" — Thanos",
  "\"The hardest choices require the strongest wills... and another ₦100 deposit.\" — Thanos",
  "\"Admirable... but mistaken. There is no treasure here.\" — Megatron",
  "\"Long live the King... and rest in peace to your ₦100.\" — Scar",
  "\"You have nothing to threaten me with! Nothing to do with all your clicks!\" — The Joker",
  "\"Madness, as you know, is like gravity. All it takes is a little push on the wrong node.\" — The Joker",
  "\"Exactly as planned (Keikaku Doori). You clicked the decoy box.\" — Light Yagami",
  "\"Since when were you under the impression that this node had money?\" — Sosuke Aizen",
  "\"Admire from afar, for this vault is sealed in darkness.\" — Sosuke Aizen",
  "\"Those who do not understand true pain can never understand an empty node.\" — Pain",
  "\"Foolish little investor... you lack enough luck for this node.\" — Itachi Uchiha",
  "\"You are already under my Genjutsu. That gold node was empty all along.\" — Itachi Uchiha",
  "\"There is no hope on this square. Only despair.\" — Ulquiorra Cifer",
  "\"What is a king to a god? What is a god to an empty node?\" — Parody",
  "\"I find your lack of luck disturbing.\" — Darth Vader",
  "\"You don't know the power of the Dark Side of the Grid!\" — Darth Vader",
  "\"Unlimited Power! ...Zero Naira payout.\" — Emperor Palpatine",
  "\"Do it! Click the next node and fulfill your destiny!\" — Emperor Palpatine",
  "\"Every fairy tale needs a good old-fashioned villain. I took the prize from this box.\" — Moriarty",
  "\"Did you miss me? Because you definitely missed the cash node!\" — Jim Moriarty",
  "\"Tell me, Mr. Anderson... what good is a node if it’s completely empty?\" — Agent Smith",
  "\"Hope. It is the quintessential human delusion... especially on this node.\" — The Architect",
  "\"Pathetic. Come back when you can pick a winning coordinate.\" — Majin Vegeta",
  "\"Even a low-class warrior wouldn't have clicked an empty box that boldly!\" — Frieza",
];

export const MASTER_ROAST_QUOTES: string[] = [
  ...NIGERIAN_STREET_ROASTS,
  ...VILLAIN_ROAST_QUOTES,
];

const INITIAL_TICKER_WINS = [
  "0902***443 secured ₦5,000",
  "0813***902 secured ₦3,000 on Node #42",
  "0906***118 unlocked ₦20,000 NELFUND Grant",
  "0703***441 cashed out ₦5,000 to OPay",
  "0802***774 earned ₦100 Bulk Buy Bonus",
  "0816***309 hit ₦1,000 on Node #88",
];

// ==========================================
// 1,000,000-NODE PRIZE ENGINE (₦22,000,000 POOL)
// ==========================================
export function getMasterNodePrize(nodeId: number): number {
  if (nodeId >= 1 && nodeId <= 100) {
    const first100Hash = (nodeId * 73 + 19) % 100;
    if (first100Hash === 99) return 3000;
    if (first100Hash === 88 || first100Hash === 44) return 1000;
    if (first100Hash >= 72 && first100Hash <= 84) return 100;
    if (first100Hash >= 60 && first100Hash <= 71) return 70;
    if (first100Hash >= 45 && first100Hash <= 59) return 60;
    if (first100Hash >= 28 && first100Hash <= 43) return 50;
    if (first100Hash >= 18 && first100Hash <= 27) return 30;
    if (first100Hash >= 12 && first100Hash <= 17) return 25;
    if (first100Hash >= 6 && first100Hash <= 11) return 20;
    if (first100Hash >= 1 && first100Hash <= 5) return 10;
    return 0;
  }

  const safeId = nodeId % 1000000;
  const slot = ((safeId * 738561 + 193496) % 1000000 + 1000000) % 1000000;

  if (slot < 200) return 10000;      // 200 nodes    = ₦10,000
  if (slot < 400) return 5000;       // 200 nodes    = ₦5,000
  if (slot < 1200) return 3000;      // 800 nodes    = ₦3,000
  if (slot < 5000) return 1000;      // 3,800 nodes  = ₦1,000
  if (slot < 46500) return 100;      // 41,500 nodes = ₦100
  if (slot < 66500) return 70;       // 20,000 nodes = ₦70
  if (slot < 116500) return 60;      // 50,000 nodes = ₦60
  if (slot < 166500) return 50;      // 50,000 nodes = ₦50
  if (slot < 191500) return 30;      // 25,000 nodes = ₦30
  if (slot < 205500) return 25;      // 14,000 nodes = ₦25
  if (slot < 226000) return 20;      // 20,500 nodes = ₦20
  if (slot < 250000) return 10;      // 24,000 nodes = ₦10

  return 0; // Remaining 750,000 nodes = ₦0 (Roasts)
}

// ==========================================
// SYNCHRONOUS INSTANT GRID GENERATOR (0.01s LOAD)
// ==========================================
function generateNodesInstant(
  startId: number,
  count: number,
  overridesList: CustomNodeOverride[],
  soldMap: Record<number, SoldNodeRecord>
): GridNode[] {
  return Array.from({ length: count }, (_, index) => {
    const id = startId + index;
    const soldRecord = soldMap[id];
    const customOverride = overridesList.find((o) => Number(o.node_id) === id);
    const defaultSponsor = DEFAULT_SPONSORS[id];

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
  });
}

export default function Home() {
  const TOTAL_MASTER_NODES = 1000000;
  const [startNodeId, setStartNodeId] = useState<number>(1);
  const [visibleCount, setVisibleCount] = useState<number>(100);
  const [searchNodeInput, setSearchNodeInput] = useState<string>("");

  // RENDER 100 GOLDEN NODES IMMEDIATELY ON FRAME 1 (NO LOADING DELAY!)
  const [nodes, setNodes] = useState<GridNode[]>(() =>
    generateNodesInstant(1, 100, [], {})
  );
  const [soldNodesMap, setSoldNodesMap] = useState<Record<number, SoldNodeRecord>>({});
  const [customOverrides, setCustomOverrides] = useState<CustomNodeOverride[]>([]);
  const [activeTickerIndex, setActiveTickerIndex] = useState<number>(0);
  const [tickerMessages, setTickerMessages] = useState<string[]>(INITIAL_TICKER_WINS);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // USER & AUTH STATES
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [pinInput, setPinInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);

  // WALLET, BULK BUY & WITHDRAWAL STATES
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [bonusBalance, setBonusBalance] = useState<number>(0);
  const [nodesBoughtCount, setNodesBoughtCount] = useState<number>(0);
  const [walletTab, setWalletTab] = useState<"deposit" | "withdraw" | "referral">("deposit");
  const [fundAmount, setFundAmount] = useState<string>("1000");
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
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: null, payload: null });

  // ==========================================
  // 1. INITIALIZATION, PWA INSTALL & PAYSTACK
  // ==========================================
  useEffect(() => {
    if (!document.getElementById("paystack-script")) {
      const script = document.createElement("script");
      script.id = "paystack-script";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get("ref");
      if (refCode) localStorage.setItem("pixelvest_ref", refCode.trim());

      const savedCount = Number(localStorage.getItem("pixelvest_nodes_bought") || "0");
      setNodesBoughtCount(savedCount);

      const savedPhone = localStorage.getItem("pixelvest_user_phone");
      if (savedPhone) fetchUserProfile(savedPhone);
    }

    syncBoardWithSupabase(1, 100);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    setNodes(generateNodesInstant(startNodeId, visibleCount, customOverrides, soldNodesMap));
  }, [startNodeId, visibleCount, customOverrides, soldNodesMap]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTickerIndex((prev) => (prev + 1) % tickerMessages.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [tickerMessages]);

  // ==========================================
  // 2. FAST BACKGROUND SUPABASE SYNC
  // ==========================================
  const syncBoardWithSupabase = async (start: number, count: number) => {
    try {
      const end = start + count - 1;
      const [overridesRes, soldRes] = await Promise.all([
        supabase.from("node_overrides").select("*"),
        supabase.from("nodes").select("*").gte("id", start).lte("id", end),
      ]);

      if (overridesRes.data) setCustomOverrides(overridesRes.data);
      if (soldRes.data && Array.isArray(soldRes.data)) {
        setSoldNodesMap((prev) => {
          const next = { ...prev };
          soldRes.data.forEach((item: any) => {
            const id = Number(item.id || item.node_id);
            if (id) next[id] = item;
          });
          return next;
        });
      }
    } catch (err) {
      console.error("Background sync error:", err);
    }
  };

  const fetchUserProfile = async (phone: string) => {
    try {
      const { data } = await supabase.from("users").select("*").eq("phone", phone).single();
      if (data) {
        setUser(data);
        setWalletBalance(Number(data.wallet_balance || 0));
        setBonusBalance(Number(data.bonus_balance || 0));
        setSavedPin(data.withdrawal_pin || "0000");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  // ==========================================
  // 3. SEARCH NODE, LOAD NEXT 100 & INSTALL APP
  // ==========================================
  const handleSearchNodeId = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(searchNodeInput);
    if (!target || target < 1 || target > TOTAL_MASTER_NODES) {
      return alert("Enter a valid Node number between 1 and 1,000,000.");
    }
    const sectorStart = Math.floor((target - 1) / 100) * 100 + 1;
    setStartNodeId(sectorStart);
    setVisibleCount(100);
    setSelectedNodeId(target);
    syncBoardWithSupabase(sectorStart, 100);
    setTimeout(() => setSelectedNodeId(null), 3500);
  };

  const handleLoadNext100 = () => {
    const nextCount = Math.min(visibleCount + 100, 1000);
    setVisibleCount(nextCount);
    syncBoardWithSupabase(startNodeId, nextCount);
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      alert(
        "📲 To install The Pixel Vest App on your phone:\n\n• On Android (Chrome/Edge): Tap the 3 dots (⋮) at the top right and select 'Install App' or 'Add to Home Screen'.\n• On iPhone (Safari): Tap the Share icon at the bottom and select 'Add to Home Screen'."
      );
    }
  };

  const handleShareReferral = async () => {
    const shareUrl = user
      ? `https://thepixelvest.com.ng?ref=${user.phone}`
      : "https://thepixelvest.com.ng";
    const shareText =
      "🔥 Tap a Golden Node on The Pixel Vest (₦100) and unlock up to ₦10,000 instant cash & brand grants! Use my link to join:";

    if (navigator.share) {
      try {
        await navigator.share({ title: "The Pixel Vest", text: shareText, url: shareUrl });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    alert(`🎁 Referral Link Copied!\n${shareUrl}\n\nShare on WhatsApp—you earn ₦50 Free Play Bonus whenever a friend joins and funds their wallet!`);
  };

  // ==========================================
  // 4. AUTHENTICATION (WITH 👁️ EYE TOGGLE)
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
          return alert("Passwords do not match! Tap the 👁️ icon to check.");
        }
        if (pinInput.length !== 4) {
          setIsSubmittingAuth(false);
          return alert("Please set a 4-digit withdrawal PIN.");
        }

        const { data: existing } = await supabase
          .from("users")
          .select("phone")
          .eq("phone", phoneInput.trim())
          .single();

        if (existing) {
          setIsSubmittingAuth(false);
          return alert("Phone number already registered. Please switch to Login.");
        }

        const storedRef = localStorage.getItem("pixelvest_ref");
        const deviceReg = localStorage.getItem("pixelvest_device_registered");
        const validRef =
          storedRef && storedRef !== phoneInput.trim() && !deviceReg ? storedRef : null;

        const { data: created, error } = await supabase
          .from("users")
          .insert([
            {
              phone: phoneInput.trim(),
              email: emailInput.trim(),
              full_name: nameInput.trim() || "Pixel Investor",
              password: passwordInput,
              withdrawal_pin: pinInput,
              wallet_balance: 0,
              bonus_balance: 0,
              referred_by: validRef,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        localStorage.setItem("pixelvest_device_registered", "true");
        localStorage.setItem("pixelvest_user_phone", created.phone);
        setUser(created);
        setWalletBalance(0);
        setBonusBalance(0);
        setSavedPin(created.withdrawal_pin || "0000");
        setModal({ isOpen: false, type: null });
      } else {
        const { data: found, error } = await supabase
          .from("users")
          .select("*")
          .eq("phone", phoneInput.trim())
          .eq("password", passwordInput)
          .single();

        if (error || !found) {
          setIsSubmittingAuth(false);
          return alert("Invalid phone number or password.");
        }

        localStorage.setItem("pixelvest_user_phone", found.phone);
        setUser(found);
        setWalletBalance(Number(found.wallet_balance || 0));
        setBonusBalance(Number(found.bonus_balance || 0));
        setSavedPin(found.withdrawal_pin || "0000");
        setModal({ isOpen: false, type: null });
      }
    } catch (err: any) {
      alert("Auth error: " + (err.message || "Please try again."));
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // ==========================================
  // 5. PAYSTACK LIVE FUNDING + BULK BUY PROMO
  // ==========================================
  const triggerFunding = () => {
    if (!user) return setModal({ isOpen: true, type: "auth" });
    const numericAmount = Number(fundAmount);
    if (!fundAmount || isNaN(numericAmount) || numericAmount < 100) {
      return alert("Minimum deposit is ₦100.");
    }

    if (!(window as any).PaystackPop) {
      return alert("Paystack checkout is loading. Please check your connection and tap again.");
    }

    // BULK BUY PROMO: Buy 10 Nodes (₦1,000) -> Get 1 Free (+₦100 Bonus)
    // Buy 20 Nodes (₦2,000) -> Get 2 Free (+₦200 Bonus)
    const freeBulkBonus = Math.floor(numericAmount / 1000) * 100;

    const handler = (window as any).PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email || `${user.phone}@thepixelvest.com.ng`,
      amount: numericAmount * 100,
      currency: "NGN",
      callback: async function () {
        try {
          const updatedWallet = walletBalance + numericAmount;
          const updatedBonus = bonusBalance + freeBulkBonus;

          await supabase
            .from("users")
            .update({
              wallet_balance: updatedWallet,
              bonus_balance: updatedBonus,
            })
            .eq("phone", user.phone);

          setWalletBalance(updatedWallet);
          setBonusBalance(updatedBonus);

          // Anti-Fraud ₦50 Referral Bonus on First Deposit
          const storedRef = user.referred_by || localStorage.getItem("pixelvest_ref");
          const deviceFunded = localStorage.getItem("pixelvest_device_funded");
          if (storedRef && !deviceFunded && storedRef !== user.phone) {
            const { data: refUser } = await supabase
              .from("users")
              .select("bonus_balance")
              .eq("phone", storedRef)
              .single();

            if (refUser) {
              await supabase
                .from("users")
                .update({ bonus_balance: Number(refUser.bonus_balance || 0) + 50 })
                .eq("phone", storedRef);
            }
            localStorage.setItem("pixelvest_device_funded", "true");
          }

          setModal({ isOpen: false, type: null });
          alert(
            freeBulkBonus > 0
              ? `🎉 Deposit Confirmed! ₦${numericAmount.toLocaleString()} added to Main Wallet + ₦${freeBulkBonus} FREE Bulk-Buy Node Bonus!`
              : `✅ Deposit Confirmed! ₦${numericAmount.toLocaleString()} added to your wallet.`
          );
        } catch (err) {
          console.error("Post-payment error:", err);
        }
      },
      onClose: function () {},
    });

    handler.openIframe();
  };

  // ==========================================
  // 6. NODE UNLOCK + EVERY 10TH NODE FREE PROMO
  // ==========================================
  const handleNodeClick = async (clickedNode: GridNode) => {
    if (clickedNode.status === "sold") {
      return alert(
        `Node #${clickedNode.id} is already sold${
          clickedNode.sponsor_name ? ` (${clickedNode.sponsor_name})` : ""
        }! Tap an available golden node.`
      );
    }
    if (!user) return setModal({ isOpen: true, type: "auth" });
    if (isPurchasingNode) return;

    const NODE_COST = 100;
    if (walletBalance + bonusBalance < NODE_COST) {
      return setModal({ isOpen: true, type: "wallet" });
    }

    setIsPurchasingNode(true);
    setSelectedNodeId(clickedNode.id);

    try {
      let nextBonus = bonusBalance;
      let nextWallet = walletBalance;

      if (nextBonus >= NODE_COST) {
        nextBonus -= NODE_COST;
      } else {
        const rem = NODE_COST - nextBonus;
        nextBonus = 0;
        nextWallet -= rem;
      }

      const matchedOverride = customOverrides.find(
        (o) => Number(o.node_id) === clickedNode.id
      );
      const prizeWon = matchedOverride
        ? Number(matchedOverride.custom_prize)
        : getMasterNodePrize(clickedNode.id);
      const sponsorTitle = matchedOverride
        ? matchedOverride.sponsor_name
        : clickedNode.sponsor_name || null;

      // BULK PLAY PROMO: Every 10th node unlocked awards +1 FREE Node (₦100 Play Bonus)
      const newBoughtCount = nodesBoughtCount + 1;
      const earnedFreeNode = newBoughtCount % 10 === 0;
      if (earnedFreeNode) nextBonus += 100;

      setNodesBoughtCount(newBoughtCount);
      localStorage.setItem("pixelvest_nodes_bought", String(newBoughtCount));

      const finalWallet = nextWallet + prizeWon;

      // Optimistic UI update so node turns dark immediately
      const soldRecord: SoldNodeRecord = {
        id: clickedNode.id,
        status: "sold",
        owner_phone: user.phone,
        prize_amount: prizeWon,
        sponsor_name: sponsorTitle,
        logo_url: clickedNode.logo_url || null,
      };
      setSoldNodesMap((prev) => ({ ...prev, [clickedNode.id]: soldRecord }));
      setWalletBalance(finalWallet);
      setBonusBalance(nextBonus);

      await Promise.all([
        supabase
          .from("users")
          .update({ wallet_balance: finalWallet, bonus_balance: nextBonus })
          .eq("phone", user.phone),
        supabase.from("nodes").upsert([soldRecord]),
      ]);

      const randomRoast =
        MASTER_ROAST_QUOTES[Math.floor(Math.random() * MASTER_ROAST_QUOTES.length)];

      if (prizeWon > 0) {
        const masked = `${user.phone.slice(0, 4)}***${user.phone.slice(-3)}`;
        setTickerMessages((prev) => [
          `${masked} secured ₦${prizeWon.toLocaleString()}`,
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
          earnedFreeNode,
        },
      });
    } catch (err: any) {
      alert("Error unlocking node: " + (err.message || "Try again."));
    } finally {
      setIsPurchasingNode(false);
      setSelectedNodeId(null);
    }
  };

  // ==========================================
  // 7. WITHDRAWAL EXECUTION
  // ==========================================
  const initiateWithdrawalRequest = () => {
    const amountNum = Number(withdrawAmount);
    if (!withdrawAmount || isNaN(amountNum) || amountNum < 500) {
      return alert("Minimum withdrawal is ₦500.");
    }
    if (amountNum > walletBalance) {
      return alert("Insufficient Main Wallet balance! (Play Bonus is for unlocking nodes).");
    }
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      return alert("Please complete all bank account details.");
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
      const { error } = await supabase
        .from("users")
        .update({ wallet_balance: updatedWallet })
        .eq("phone", user.phone);
      if (error) throw error;

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
      alert(`✅ Withdrawal of ₦${amountNum.toLocaleString()} submitted to ${bankName}!`);
    } catch (err: any) {
      alert("Withdrawal error: " + (err.message || "Try again."));
    } finally {
      setIsWithdrawing(false);
    }
  };

  // ==========================================
  // RENDER UI (EXACT SCREENSHOT MATCH + FAST GRID)
  // ==========================================
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#06080F",
        color: "#FFFFFF",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        paddingBottom: "60px",
      }}
    >
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "18px 16px" }}>
        {/* 1. TOP HEADER BAR */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "1.35rem",
              fontWeight: 900,
              letterSpacing: "0.5px",
              color: "#FFFFFF",
            }}
          >
            THE PIXEL VEST
          </h1>

          <button
            onClick={() =>
              user
                ? setModal({ isOpen: true, type: "wallet" })
                : setModal({ isOpen: true, type: "auth" })
            }
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.14)",
              border: "1.5px solid #10B981",
              color: "#10B981",
              padding: "7px 16px",
              borderRadius: "999px",
              fontWeight: 800,
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            ₦{(walletBalance + bonusBalance).toLocaleString()}
          </button>
        </header>

        {/* 2. SEARCH NODE BAR + YELLOW FIND BUTTON */}
        <form
          onSubmit={handleSearchNodeId}
          style={{ display: "flex", gap: "10px", marginBottom: "18px" }}
        >
          <input
            type="number"
            placeholder="Search Node (1 - 1M)"
            value={searchNodeInput}
            onChange={(e) => setSearchNodeInput(e.target.value)}
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: "14px",
              backgroundColor: "#0E131F",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#FFFFFF",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#FBBF24",
              color: "#000000",
              fontWeight: 900,
              fontSize: "0.9rem",
              padding: "0 24px",
              borderRadius: "14px",
              border: "none",
              cursor: "pointer",
            }}
          >
            FIND
          </button>
        </form>

        {/* 3. STACKED PILLS: LIVE PAYOUT, INSTALL APP & 1M NODES BADGE */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {/* Green Live Payout Pill */}
          <div
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: "999px",
              padding: "7px 18px",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#D1FAE5",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#10B981",
                display: "inline-block",
              }}
            />
            {tickerMessages[activeTickerIndex]}
          </div>

          {/* Blue Install App Pill */}
          <button
            onClick={handleInstallApp}
            style={{
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "999px",
              padding: "9px 22px",
              fontSize: "0.82rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
            }}
          >
            📲 INSTALL APP
          </button>

          {/* Gold Live Grid 1,000,000 Nodes Pill */}
          <div
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              borderRadius: "999px",
              padding: "6px 18px",
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "#FBBF24",
              letterSpacing: "0.8px",
            }}
          >
            LIVE GRID • 1,000,000 NODES
          </div>
        </div>

        {/* 4. HERO SECTION & BULK BUY PROMO */}
        <section style={{ textAlign: "center", marginBottom: "18px" }}>
          <h2
            style={{
              margin: "0 0 12px 0",
              fontSize: "1.75rem",
              fontWeight: 900,
              lineHeight: 1.2,
              color: "#FFFFFF",
            }}
          >
            Stand A Chance To Win{" "}
            <span style={{ color: "#FBBF24", display: "block" }}>
              Up To ₦1 Million.
            </span>
          </h2>

          <p
            style={{
              margin: "0 0 14px 0",
              fontSize: "0.9rem",
              lineHeight: 1.55,
              color: "#9CA3AF",
            }}
          >
            Secure an exclusive digital node for <strong style={{ color: "#E5E7EB" }}>₦100</strong>.
            <br />
            Uncover hidden cash bounties instantly.
            <br />
            Cash out directly to your bank or as airtime.
          </p>

          <div
            onClick={() =>
              user
                ? setModal({ isOpen: true, type: "wallet" })
                : setModal({ isOpen: true, type: "auth" })
            }
            style={{
              fontSize: "0.85rem",
              fontWeight: 800,
              color: "#10B981",
              cursor: "pointer",
            }}
          >
            ⚡ Bulk Buy: 10+ (Get 1 Free) | 20+ (Get 2 Free)
          </div>
        </section>

        {/* 5. GOOGLE ADS RECTANGLE SPACE (WITH SAFE MARGIN) */}
        <div
          style={{
            width: "100%",
            minHeight: "76px",
            backgroundColor: "#0B0F1A",
            border: "1px dashed rgba(255,255,255,0.16)",
            borderRadius: "14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "22px",
            padding: "10px",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "1.2px",
              color: "#6B7280",
            }}
          >
            SPONSORED AD SPACE
          </span>
          {/* Google AdSense Unit Slot Ready */}
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
            data-ad-slot="XXXXXXXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

        {/* 6. ORDERLY 5-COLUMN GOLDEN NODE GRID */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: "10px",
            marginBottom: "24px",
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
                  aspectRatio: "1 / 1",
                  borderRadius: "16px",
                  // GOLDEN WHEN AVAILABLE, DARK/BLACK WHEN SOLD (LOGO STAYS VISIBLE!)
                  background: isSold
                    ? "#07090F"
                    : "linear-gradient(145deg, #FBBF24 0%, #D97706 75%, #B45309 100%)",
                  border: isSelected
                    ? "2px solid #10B981"
                    : isSold
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1.5px solid rgba(253, 230, 138, 0.75)",
                  boxShadow: isSold
                    ? "inset 0 2px 6px rgba(0,0,0,0.9)"
                    : "0 4px 10px rgba(217, 119, 6, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isSold ? "not-allowed" : "pointer",
                  overflow: "hidden",
                  userSelect: "none",
                }}
              >
                {node.logo_url ? (
                  <>
                    <span
                      style={{
                        position: "absolute",
                        top: "4px",
                        left: "6px",
                        fontSize: "0.58rem",
                        fontWeight: 800,
                        color: isSold ? "#6B7280" : "#111827",
                      }}
                    >
                      {node.id}
                    </span>
                    <img
                      src={node.logo_url}
                      alt={node.sponsor_name || `Node ${node.id}`}
                      loading="lazy"
                      style={{
                        width: "28px",
                        height: "28px",
                        objectFit: "contain",
                        borderRadius: "6px",
                        marginTop: "6px",
                        opacity: isSold ? 0.8 : 1,
                        filter: isSold ? "brightness(0.85)" : "none",
                      }}
                    />
                    {node.sponsor_name && (
                      <span
                        style={{
                          fontSize: "0.5rem",
                          fontWeight: 900,
                          marginTop: "3px",
                          color: isSold ? "#9CA3AF" : "#111827",
                          maxWidth: "90%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {node.sponsor_name}
                      </span>
                    )}
                  </>
                ) : (
                  <span
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: 800,
                      color: isSold ? "#374151" : "#FFFFFF",
                      textShadow: isSold ? "none" : "0 1px 2px rgba(0,0,0,0.35)",
                    }}
                  >
                    {node.id}
                  </span>
                )}
              </div>
            );
          })}
        </section>

        {/* 7. LOAD NEXT 100 BUTTON */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <button
            onClick={handleLoadNext100}
            style={{
              backgroundColor: "#111624",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#FFFFFF",
              padding: "13px 28px",
              borderRadius: "999px",
              fontSize: "0.88rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ↓ Load Next 100
          </button>
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "24px",
          }}
        />

        {/* 8. BRAND YOUR OWN NODE CARD (adminpixelvest@gmail.com) */}
        <section
          style={{
            backgroundColor: "#0D121F",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "18px",
            padding: "22px 18px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px 0",
              fontSize: "0.95rem",
              fontWeight: 900,
              color: "#FBBF24",
              letterSpacing: "0.5px",
            }}
          >
            💼 BRAND YOUR OWN NODE
          </h3>
          <p
            style={{
              margin: "0 0 12px 0",
              fontSize: "0.85rem",
              lineHeight: 1.5,
              color: "#9CA3AF",
            }}
          >
            Purchase a custom node for your brand.
            <br />
            Send a message for ad placements:
          </p>
          <a
            href="mailto:adminpixelvest@gmail.com"
            style={{
              color: "#10B981",
              fontWeight: 800,
              fontSize: "0.95rem",
              textDecoration: "none",
            }}
          >
            adminpixelvest@gmail.com
          </a>
        </section>

        {/* 9. SHARE TO GET A FREE TRIAL BUTTON */}
        <button
          onClick={handleShareReferral}
          style={{
            width: "100%",
            backgroundColor: "rgba(16, 185, 129, 0.14)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            color: "#10B981",
            padding: "16px",
            borderRadius: "16px",
            fontSize: "0.9rem",
            fontWeight: 900,
            cursor: "pointer",
            letterSpacing: "0.4px",
            marginBottom: "28px",
          }}
        >
          🎁 SHARE TO GET A FREE TRIAL
        </button>

        {/* 10. GOOGLE ADSENSE & AI CRAWLER COMPLIANCE FOOTER */}
        <footer
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "18px",
            fontSize: "0.74rem",
            lineHeight: 1.6,
            color: "#6B7280",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 6px 0", fontWeight: 700, color: "#9CA3AF" }}>
            About The Pixel Vest (thepixelvest.com.ng)
          </p>
          <p style={{ margin: "0 0 10px 0" }}>
            The Pixel Vest is Nigeria’s interactive 1,000,000-node digital advertising grid and
            promotional brand bounty platform powered by O.G. Africa Multi-Links Services.
            Brands sponsor custom digital nodes while users unlock instant rewards and cashback.
            For sponsorship and media inquiries: <strong>adminpixelvest@gmail.com</strong>.
          </p>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} The Pixel Vest • Terms of Service • Privacy Policy
          </p>
        </footer>
      </div>

      {/* ========================================== */}
      {/* MODALS (AUTH, WALLET, PIN, NODE RESULT)    */}
      {/* ========================================== */}
      {modal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.82)",
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
              maxWidth: "410px",
              backgroundColor: "#0F172A",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "22px",
              padding: "22px",
            }}
          >
            {/* AUTH MODAL */}
            {modal.type === "auth" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
                    {authMode === "login" ? "Login to Vault" : "Create Account"}
                  </h3>
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
                    display: "flex",
                    gap: "6px",
                    marginBottom: "16px",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    padding: "4px",
                    borderRadius: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    style={{
                      flex: 1,
                      padding: "9px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 800,
                      cursor: "pointer",
                      backgroundColor: authMode === "login" ? "#10B981" : "transparent",
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
                      padding: "9px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 800,
                      cursor: "pointer",
                      backgroundColor: authMode === "register" ? "#10B981" : "transparent",
                      color: authMode === "register" ? "#000" : "#9CA3AF",
                    }}
                  >
                    Register
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
                          padding: "13px",
                          marginBottom: "10px",
                          borderRadius: "12px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                          boxSizing: "border-box",
                        }}
                      />
                      <input
                        type="email"
                        placeholder="Email Address (for Paystack)"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "13px",
                          marginBottom: "10px",
                          borderRadius: "12px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
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
                      padding: "13px",
                      marginBottom: "10px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      boxSizing: "border-box",
                    }}
                  />

                  <div style={{ position: "relative", marginBottom: "10px" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "13px 44px 13px 13px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                      }}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {authMode === "register" && (
                    <>
                      <div style={{ position: "relative", marginBottom: "10px" }}>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "13px 44px 13px 13px",
                            borderRadius: "12px",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#fff",
                            boxSizing: "border-box",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "1.1rem",
                          }}
                        >
                          {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                      </div>

                      <input
                        type="password"
                        maxLength={4}
                        placeholder="Set 4-Digit Withdrawal PIN"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                        style={{
                          width: "100%",
                          padding: "13px",
                          marginBottom: "14px",
                          borderRadius: "12px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
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
                      padding: "14px",
                      borderRadius: "12px",
                      backgroundColor: "#10B981",
                      color: "#000",
                      fontWeight: 900,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {isSubmittingAuth
                      ? "PROCESSING..."
                      : authMode === "login"
                      ? "LOGIN NOW"
                      : "CREATE ACCOUNT"}
                  </button>
                </form>
              </div>
            )}

            {/* WALLET MODAL */}
            {modal.type === "wallet" && user && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>
                    Vault Wallet ({user.phone})
                  </h3>
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
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>Cash Wallet</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#10B981" }}>
                      ₦{walletBalance.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.3)",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", color: "#FBBF24" }}>Free Play Bonus</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#FBBF24" }}>
                      ₦{bonusBalance.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginBottom: "14px",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    padding: "4px",
                    borderRadius: "10px",
                  }}
                >
                  <button
                    onClick={() => setWalletTab("deposit")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 800,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      backgroundColor: walletTab === "deposit" ? "#10B981" : "transparent",
                      color: walletTab === "deposit" ? "#000" : "#9CA3AF",
                    }}
                  >
                    Fund Wallet
                  </button>
                  <button
                    onClick={() => setWalletTab("withdraw")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 800,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      backgroundColor: walletTab === "withdraw" ? "#10B981" : "transparent",
                      color: walletTab === "withdraw" ? "#000" : "#9CA3AF",
                    }}
                  >
                    Cash Out
                  </button>
                  <button
                    onClick={() => setWalletTab("referral")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 800,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      backgroundColor: walletTab === "referral" ? "#FBBF24" : "transparent",
                      color: walletTab === "referral" ? "#000" : "#9CA3AF",
                    }}
                  >
                    Earn ₦50
                  </button>
                </div>

                {walletTab === "deposit" && (
                  <div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        marginBottom: "10px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setFundAmount("1000")}
                        style={{
                          padding: "9px",
                          borderRadius: "10px",
                          border: "1px solid #10B981",
                          backgroundColor: "rgba(16,185,129,0.12)",
                          color: "#10B981",
                          fontSize: "0.74rem",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        ⚡ ₦1,000 (10 + 1 Free)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFundAmount("2000")}
                        style={{
                          padding: "9px",
                          borderRadius: "10px",
                          border: "1px solid #FBBF24",
                          backgroundColor: "rgba(245,158,11,0.12)",
                          color: "#FBBF24",
                          fontSize: "0.74rem",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        🔥 ₦2,000 (20 + 2 Free)
                      </button>
                    </div>

                    <input
                      type="number"
                      placeholder="Amount in Naira (Min ₦100)"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "13px",
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
                      PAY WITH PAYSTACK
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
                        borderRadius: "10px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        marginBottom: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Bank Name (OPay, PalmPay, GTB...)"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        marginBottom: "8px",
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
                        borderRadius: "10px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        marginBottom: "8px",
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
                        borderRadius: "10px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        marginBottom: "12px",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      onClick={initiateWithdrawalRequest}
                      style={{
                        width: "100%",
                        padding: "13px",
                        borderRadius: "12px",
                        backgroundColor: "#FBBF24",
                        color: "#000",
                        fontWeight: 900,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      WITHDRAW TO BANK
                    </button>
                  </div>
                )}

                {walletTab === "referral" && (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "0.82rem", color: "#D1D5DB", lineHeight: 1.5 }}>
                      Share your referral link. When your friend registers and makes their
                      first deposit, you get <strong style={{ color: "#10B981" }}>₦50 Free Play Credit</strong>!
                    </p>
                    <input
                      type="text"
                      readOnly
                      value={`https://thepixelvest.com.ng?ref=${user.phone}`}
                      style={{
                        width: "100%",
                        padding: "11px",
                        borderRadius: "10px",
                        backgroundColor: "#000",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#FBBF24",
                        fontSize: "0.78rem",
                        marginBottom: "10px",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      onClick={handleShareReferral}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        backgroundColor: "#10B981",
                        color: "#000",
                        fontWeight: 900,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      COPY & SHARE LINK
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    localStorage.removeItem("pixelvest_user_phone");
                    setUser(null);
                    setWalletBalance(0);
                    setBonusBalance(0);
                    setModal({ isOpen: false, type: null });
                  }}
                  style={{
                    width: "100%",
                    marginTop: "14px",
                    padding: "9px",
                    borderRadius: "10px",
                    backgroundColor: "transparent",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#F87171",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Log Out
                </button>
              </div>
            )}

            {/* NODE RESULT MODAL */}
            {modal.type === "node_result" && modal.payload && (
              <div style={{ textAlign: "center" }}>
                {modal.payload.logoUrl && (
                  <img
                    src={modal.payload.logoUrl}
                    alt="Sponsor"
                    style={{ width: "52px", height: "52px", objectFit: "contain", marginBottom: "10px" }}
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
                <p style={{ color: "#D1D5DB", fontSize: "0.9rem", lineHeight: 1.5 }}>
                  {modal.payload.prizeWon > 0
                    ? `Instant ₦${modal.payload.prizeWon.toLocaleString()} added straight to your withdrawable wallet!`
                    : modal.payload.roastText}
                </p>
                {modal.payload.earnedFreeNode && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "8px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(16,185,129,0.15)",
                      color: "#10B981",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                    }}
                  >
                    🎁 10-Node Milestone! +₦100 Free Node Bonus Added!
                  </div>
                )}
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

            {/* PIN CONFIRMATION MODAL */}
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
                    marginBottom: "14px",
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
                    marginBottom: "8px",
                  }}
                >
                  {isWithdrawing ? "AUTHORIZING..." : "CONFIRM"}
                </button>
                <button
                  onClick={() => setModal({ isOpen: true, type: "wallet" })}
                  style={{
                    width: "100%",
                    padding: "11px",
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