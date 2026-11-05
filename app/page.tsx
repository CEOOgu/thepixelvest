"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Live Paystack Key
const PAYSTACK_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
  "pk_live_4f604b2d9d9689f50eba439e704600844f7dfd01";

const TOTAL_NODES = 1000000;
const NODES_PER_SECTOR = 100;
const TOTAL_SECTORS = TOTAL_NODES / NODES_PER_SECTOR; // 10,000 Sectors

const LIVE_TICKER_MESSAGES = [
  "💎 0901***552 unlocked ₦10,000 Mega Vault on Node #314!",
  "💎 0803***119 unlocked ₦5,000 Super Vault on Node #500,012!",
  "💎 0706***884 earned ₦50 Referral Bonus from an active player!",
  "💎 0814***902 unlocked ₦1,500 Cash Bounty on Node #1,208!",
  "💎 0905***337 unlocked ₦25,000 Gold Jackpot on Node #77,400!",
];

// Deterministic reward logic unless overridden by Admin in `node_overrides`
function getDeterministicNodeReward(nodeId: number): number {
  const hash = (nodeId * 2654435761) % 1000;
  if (hash === 777) return 10000;
  if (hash % 250 === 0) return 2500;
  if (hash % 50 === 0) return 500;
  if (hash % 10 === 0) return 200;
  if (hash % 4 === 0) return 100;
  return 0;
}

export default function PixelVestApp() {
  // Sector & Navigation State
  const [currentSector, setCurrentSector] = useState<number>(1);
  const [sectorInput, setSectorInput] = useState<string>("1");
  const [searchNodeInput, setSearchNodeInput] = useState<string>("");

  // User & Auth State
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authPhone, setAuthPhone] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authPin, setAuthPin] = useState<string>("");
  const [authReferral, setAuthReferral] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Wallet & Modals State
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [walletTab, setWalletTab] = useState<"fund" | "withdraw">("fund");
  const [fundAmount, setFundAmount] = useState<string>("500");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [withdrawPinInput, setWithdrawPinInput] = useState<string>("");
  const [walletSource, setWalletSource] = useState<"main" | "bonus">("main");

  // Grid Data State (Sold Nodes + Custom Admin Overrides)
  const [soldNodesMap, setSoldNodesMap] = useState<Record<number, any>>({});
  const [nodeOverridesMap, setNodeOverridesMap] = useState<Record<number, any>>({});
  const [boardLoading, setBoardLoading] = useState<boolean>(false);

  // Active Node Unlock Modal
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [unlockLoading, setUnlockLoading] = useState<boolean>(false);
  const [rewardResult, setRewardResult] = useState<{
    nodeId: number;
    amount: number;
    brandName?: string;
  } | null>(null);

  // Legal / Policy Modal for Google AdSense Compliance
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  // PWA APK Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallHelp, setShowInstallHelp] = useState<boolean>(false);

  // Ticker & Toast
  const [tickerIndex, setTickerIndex] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Rotate Top Payout Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_TICKER_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Load Paystack Script, PWA Service Worker, Referral Param & Saved User
  useEffect(() => {
    // Load Paystack inline script
    if (!document.getElementById("paystack-script")) {
      const script = document.createElement("script");
      script.id = "paystack-script";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Register Service Worker for APK Installability
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Listen for APK install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check URL for ?ref=...
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get("ref");
      if (refCode) {
        setAuthReferral(refCode);
        localStorage.setItem("pixelvest_ref", refCode);
      } else {
        const savedRef = localStorage.getItem("pixelvest_ref");
        if (savedRef) setAuthReferral(savedRef);
      }
    }

    // Restore Logged In User Session
    const savedPhone = localStorage.getItem("pixelvest_user_phone");
    if (savedPhone) {
      refreshUserProfile(savedPhone);
    }

    fetchSectorBoardData(1);

    // Trigger Google AdSense slot rendering safely
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {}

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Fetch User Profile from Supabase
  const refreshUserProfile = async (phone: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone.trim())
        .maybeSingle();

      if (data && !error) {
        setUser(data);
        localStorage.setItem("pixelvest_user_phone", data.phone);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  // Fetch Sold Nodes & Admin Editable Node Overrides for Current Sector
  const fetchSectorBoardData = async (sector: number) => {
    if (!supabase) return;
    setBoardLoading(true);
    const startNode = (sector - 1) * NODES_PER_SECTOR + 1;
    const endNode = sector * NODES_PER_SECTOR;

    try {
      // 1. Fetch Sold Nodes in this sector
      const { data: soldData } = await supabase
        .from("grid_nodes")
        .select("*")
        .gte("node_id", startNode)
        .lte("node_id", endNode);

      const newSoldMap: Record<number, any> = {};
      if (soldData) {
        soldData.forEach((item: any) => {
          newSoldMap[Number(item.node_id)] = item;
        });
      }
      setSoldNodesMap(newSoldMap);

      // 2. Fetch Admin Custom Node Overrides (Custom Name, Picture, Gift Amount)
      const { data: overrideData } = await supabase
        .from("node_overrides")
        .select("*")
        .gte("node_id", startNode)
        .lte("node_id", endNode);

      const newOverrideMap: Record<number, any> = {};
      if (overrideData) {
        overrideData.forEach((item: any) => {
          newOverrideMap[Number(item.node_id)] = item;
        });
      }
      setNodeOverridesMap(newOverrideMap);
    } catch (err) {
      console.error("Error loading board:", err);
    } finally {
      setBoardLoading(false);
    }
  };

  // Change Sector
  const changeSector = (newSector: number) => {
    const clamped = Math.max(1, Math.min(TOTAL_SECTORS, newSector));
    setCurrentSector(clamped);
    setSectorInput(String(clamped));
    fetchSectorBoardData(clamped);
  };

  // Jump to Specific Node # (1 - 1,000,000)
  const handleJumpToNode = () => {
    const nodeNum = parseInt(searchNodeInput.replace(/,/g, ""), 10);
    if (isNaN(nodeNum) || nodeNum < 1 || nodeNum > TOTAL_NODES) {
      triggerToast("Enter a valid Node number between 1 and 1,000,000");
      return;
    }
    const targetSector = Math.ceil(nodeNum / NODES_PER_SECTOR);
    changeSector(targetSector);
    setSelectedNode(nodeNum);
  };

  // Handle APK Install Button
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        triggerToast("Installing The Pixel Vest App...");
      }
    } else {
      setShowInstallHelp(true);
    }
  };

  // FIXED AUTHENTICATION: Register & Login matching exact Supabase `users` schema
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      triggerToast("Database connection missing. Check Vercel env vars.");
      return;
    }

    const cleanPhone = authPhone.trim();
    const cleanPassword = authPassword.trim();

    if (!cleanPhone || !cleanPassword) {
      triggerToast("Please enter your phone number and password.");
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === "login") {
        const { data: existingUser, error } = await supabase
          .from("users")
          .select("*")
          .eq("phone", cleanPhone)
          .maybeSingle();

        if (error || !existingUser) {
          triggerToast("Account not found. Please switch to Register.");
          setAuthLoading(false);
          return;
        }

        if (String(existingUser.password) !== cleanPassword) {
          triggerToast("Incorrect password. Please try again.");
          setAuthLoading(false);
          return;
        }

        setUser(existingUser);
        localStorage.setItem("pixelvest_user_phone", existingUser.phone);
        setShowAuthModal(false);
        triggerToast(`Welcome back, ${existingUser.full_name || existingUser.phone}!`);
      } else {
        // REGISTER MODE
        if (!authName.trim()) {
          triggerToast("Please enter your Full Name.");
          setAuthLoading(false);
          return;
        }
        if (!authPin.trim() || authPin.trim().length < 4) {
          triggerToast("Please set a 4-digit Withdrawal PIN.");
          setAuthLoading(false);
          return;
        }

        // Check if phone already exists
        const { data: checkUser } = await supabase
          .from("users")
          .select("phone")
          .eq("phone", cleanPhone)
          .maybeSingle();

        if (checkUser) {
          triggerToast("Phone number already registered! Please login.");
          setAuthMode("login");
          setAuthLoading(false);
          return;
        }

        const cleanRef =
          authReferral.trim() && authReferral.trim() !== cleanPhone
            ? authReferral.trim()
            : null;

        // Insert exact columns supported by your Supabase `users` table
        const newUserPayload: Record<string, any> = {
          phone: cleanPhone,
          full_name: authName.trim(),
          password: cleanPassword,
          withdrawal_pin: authPin.trim(),
          wallet_balance: 0,
          bonus_balance: 0,
        };
        if (cleanRef) {
          newUserPayload.referred_by = cleanRef;
        }

        const { data: createdUser, error: insertError } = await supabase
          .from("users")
          .insert([newUserPayload])
          .select()
          .single();

        if (insertError) {
          console.error("Signup error:", insertError);
          triggerToast(insertError.message || "Registration failed. Try again.");
          setAuthLoading(false);
          return;
        }

        setUser(createdUser);
        localStorage.setItem("pixelvest_user_phone", createdUser.phone);
        setShowAuthModal(false);
        triggerToast("Account created! Welcome to The Pixel Vest.");
      }
    } catch (err: any) {
      triggerToast("Network error. Please check your connection.");
    } finally {
      setAuthLoading(false);
    }
  };

  // FUND WALLET VIA PAYSTACK LIVE KEY
  const handleFundWallet = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const amt = Number(fundAmount);
    if (isNaN(amt) || amt < 100) {
      triggerToast("Minimum deposit is ₦100");
      return;
    }

    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) {
      triggerToast("Paystack is loading... Please tap again in 2 seconds.");
      return;
    }

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: `${user.phone}@thepixelvest.com.ng`,
      amount: amt * 100, // Kobo
      currency: "NGN",
      ref: `PV_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      callback: async function (response: any) {
        if (!supabase) return;
        const newBalance = Number(user.wallet_balance || 0) + amt;
        await supabase
          .from("users")
          .update({ wallet_balance: newBalance })
          .eq("phone", user.phone);

        await supabase.from("transactions").insert([
          {
            user_phone: user.phone,
            type: "deposit",
            amount: amt,
            status: "completed",
            reference: response.reference,
          },
        ]);

        await refreshUserProfile(user.phone);
        setShowWalletModal(false);
        triggerToast(`₦${amt.toLocaleString()} added to your Main Wallet!`);
      },
      onClose: function () {
        triggerToast("Payment window closed.");
      },
    });

    handler.openIframe();
  };

  // WITHDRAW REQUEST
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    const amt = Number(withdrawAmount);
    if (isNaN(amt) || amt < 500) {
      triggerToast("Minimum cash out is ₦500.");
      return;
    }
    if (amt > Number(user.wallet_balance || 0)) {
      triggerToast("Insufficient Main Wallet balance.");
      return;
    }
    if (String(user.withdrawal_pin) !== withdrawPinInput.trim()) {
      triggerToast("Invalid Withdrawal PIN!");
      return;
    }

    const updatedMain = Number(user.wallet_balance || 0) - amt;
    const { error } = await supabase
      .from("users")
      .update({ wallet_balance: updatedMain })
      .eq("phone", user.phone);

    if (!error) {
      await supabase.from("withdrawals").insert([
        {
          user_phone: user.phone,
          amount: amt,
          bank_name: bankName.trim(),
          account_number: accountNumber.trim(),
          account_name: accountName.trim(),
          status: "pending",
        },
      ]);
      await refreshUserProfile(user.phone);
      setShowWalletModal(false);
      setWithdrawAmount("");
      setWithdrawPinInput("");
      triggerToast("Cash out request submitted! Processing to your bank.");
    }
  };

  // UNLOCK A GOLDEN NODE (₦100) + TRIGGER ₦50 REFERRAL BONUS TO REFERRER
  const handleUnlockNode = async () => {
    if (!selectedNode) return;
    if (!user) {
      setSelectedNode(null);
      setShowAuthModal(true);
      return;
    }
    if (!supabase) return;

    const nodePrice = 100;
    const mainBal = Number(user.wallet_balance || 0);
    const bonusBal = Number(user.bonus_balance || 0);

    // Check selected wallet balance
    if (walletSource === "main" && mainBal < nodePrice) {
      triggerToast("Insufficient Main Wallet (₦100 needed). Fund Wallet first!");
      setSelectedNode(null);
      setWalletTab("fund");
      setShowWalletModal(true);
      return;
    }
    if (walletSource === "bonus" && bonusBal < nodePrice) {
      triggerToast("Insufficient Referral Bonus (₦100 needed). Switch to Main Wallet!");
      return;
    }

    setUnlockLoading(true);
    try {
      // Check if already sold
      if (soldNodesMap[selectedNode]?.is_sold) {
        triggerToast("This Node was just unlocked by another player!");
        setUnlockLoading(false);
        return;
      }

      // Determine prize: Admin custom override takes priority over default deterministic reward
      const customOverride = nodeOverridesMap[selectedNode];
      const prizeWon =
        customOverride && customOverride.custom_prize !== undefined && customOverride.custom_prize !== null
          ? Number(customOverride.custom_prize)
          : getDeterministicNodeReward(selectedNode);

      // Calculate new user wallet balances (winnings always go to withdrawable Main Wallet)
      const newMainBalance =
        walletSource === "main"
          ? mainBal - nodePrice + prizeWon
          : mainBal + prizeWon;
      const newBonusBalance =
        walletSource === "bonus" ? bonusBal - nodePrice : bonusBal;

      // 1. Update User Balance
      const { error: userErr } = await supabase
        .from("users")
        .update({
          wallet_balance: newMainBalance,
          bonus_balance: newBonusBalance,
        })
        .eq("phone", user.phone);

      if (userErr) throw userErr;

      // 2. Mark Node as Sold in `grid_nodes`
      await supabase.from("grid_nodes").upsert([
        {
          node_id: selectedNode,
          owner_phone: user.phone,
          owner_name: user.full_name || user.phone,
          is_sold: true,
          prize_won: prizeWon,
          unlocked_at: new Date().toISOString(),
        },
      ]);

      // 3. CREDIT ₦50 REFERRAL BONUS TO REFERRER WHEN REFERRED USER PLAYS A GAME
      if (user.referred_by) {
        const { data: referrerData } = await supabase
          .from("users")
          .select("phone, bonus_balance")
          .eq("phone", user.referred_by)
          .maybeSingle();

        if (referrerData) {
          const updatedRefBonus = Number(referrerData.bonus_balance || 0) + 50;
          await supabase
            .from("users")
            .update({ bonus_balance: updatedRefBonus })
            .eq("phone", referrerData.phone);
        }
      }

      // Refresh local state
      await refreshUserProfile(user.phone);
      await fetchSectorBoardData(currentSector);

      const unlockedId = selectedNode;
      setSelectedNode(null);
      setRewardResult({
        nodeId: unlockedId,
        amount: prizeWon,
        brandName: customOverride?.brand_name || "Golden Vault Node",
      });
    } catch (err) {
      console.error("Unlock error:", err);
      triggerToast("Could not unlock node. Please try again.");
    } finally {
      setUnlockLoading(false);
    }
  };

  // Compute the 100 Nodes for the current sector in 0.01s
  const sectorNodes = useMemo(() => {
    const start = (currentSector - 1) * NODES_PER_SECTOR + 1;
    return Array.from({ length: NODES_PER_SECTOR }, (_, idx) => start + idx);
  }, [currentSector]);

  const startNodeNum = (currentSector - 1) * NODES_PER_SECTOR + 1;
  const endNodeNum = currentSector * NODES_PER_SECTOR;

  const copyReferralLink = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const link = `https://thepixelvest.com.ng/?ref=${user.phone}`;
    navigator.clipboard.writeText(link);
    triggerToast("Referral link copied! Earn ₦50 whenever friends play!");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black font-bold px-5 py-3 rounded-xl shadow-2xl border border-emerald-300 text-sm text-center max-w-xs w-full animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Main Mobile-First Container matching Screenshot */}
      <div className="max-w-md mx-auto px-3.5 pt-3">
        {/* 1. TOP GREEN PAYOUT TICKER BOX */}
        <div className="w-full bg-[#071f14] border border-emerald-500/40 rounded-xl px-3 py-2.5 mb-3 text-center shadow-md">
          <p className="text-amber-400 font-bold text-xs sm:text-sm leading-snug">
            {LIVE_TICKER_MESSAGES[tickerIndex]}
          </p>
        </div>

        {/* 2. BRAND HEADER WITH LOGO (/icon.png) + APK INSTALL BUTTON */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <img
              src="/icon.png"
              alt="The Pixel Vest"
              className="w-8 h-8 rounded-lg object-contain bg-amber-500/10 border border-amber-400/40 p-0.5"
              onError={(e) => {
                // Fallback golden triangle if icon.png hasn't loaded yet
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-400 flex items-center gap-1.5">
              <span className="text-amber-400 text-lg">▲</span> THE PIXEL VEST
            </h1>
          </div>

          <button
            onClick={handleInstallClick}
            className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition"
          >
            📲 Install App
          </button>
        </div>

        {/* 3. SUBTITLE */}
        <p className="text-zinc-400 text-xs sm:text-sm mb-3 leading-relaxed">
          1,000,000 Nodes • ₦22,000,000 Prize Vault • Tap a Golden Node (₦100)
        </p>

        {/* 4. TWO WALLET BALANCES SIDE-BY-SIDE (MAIN WALLET + REFERRAL BONUS) */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div className="bg-[#081c15] border border-emerald-500/40 rounded-xl p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              MAIN WALLET
            </p>
            <p className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">
              ₦{Number(user?.wallet_balance || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-[#1f1608] border border-amber-500/40 rounded-xl p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-200/80">
              REFERRAL BONUS
            </p>
            <p className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">
              ₦{Number(user?.bonus_balance || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 5. ACTION BUTTONS (+ FUND / CASH OUT & LOGIN / LOGOUT + REFER) */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {user ? (
            <>
              <button
                onClick={() => {
                  setWalletTab("fund");
                  setShowWalletModal(true);
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-500/10"
              >
                + FUND / CASH OUT
              </button>
              <button
                onClick={copyReferralLink}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition"
              >
                Refer (+₦50)
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("pixelvest_user_phone");
                  setUser(null);
                  triggerToast("Logged out successfully.");
                }}
                className="bg-[#2a1215] hover:bg-[#3b181c] text-rose-300 border border-rose-500/30 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setAuthMode("login");
                  setShowAuthModal(true);
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition"
              >
                LOGIN / REGISTER TO PLAY
              </button>
              <button
                onClick={() => {
                  setAuthMode("register");
                  setShowAuthModal(true);
                }}
                className="bg-[#1f1608] text-amber-400 border border-amber-500/40 font-bold py-2.5 px-3.5 rounded-xl text-xs sm:text-sm"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        <hr className="border-zinc-800/80 my-3" />

        {/* 6. AVAILABLE & SOLD NODE LEGEND */}
        <div className="space-y-1.5 mb-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-amber-300 to-amber-600 inline-block border border-amber-200" />
            <span className="text-white font-medium">Available Node (₦100)</span>
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
            placeholder="Search Node # (e.g. 500052)"
            className="flex-1 bg-[#111318] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleJumpToNode}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-4 py-2 rounded-xl text-sm transition"
          >
            Go
          </button>
        </div>

        <button
          onClick={() => fetchSectorBoardData(currentSector)}
          className="bg-[#111318] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold px-3.5 py-2 rounded-xl mb-3 inline-flex items-center gap-1.5 transition"
        >
          ↻ {boardLoading ? "Refreshing..." : "Refresh Live Board"}
        </button>

        {/* 8. GOOGLE ADSENSE BANNER AD SPACE (WITH ANTI-BAN BUFFER) */}
        <div className="my-3 p-2 bg-[#0b0d10] border border-zinc-800/80 rounded-xl text-center overflow-hidden">
          <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">
            Sponsored Advertisement
          </p>
          <ins
            className="adsbygoogle"
            style={{ display: "block", minHeight: "60px" }}
            data-ad-client="ca-pub-9204985294084444"
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>

        {/* 9. SECTOR INDICATOR & PAGINATION CONTROLS */}
        <div className="mb-3">
          <p className="text-xs sm:text-sm text-zinc-400 mb-2">
            <span className="text-amber-400 font-bold">
              Viewing Sector #{currentSector.toLocaleString()} of{" "}
              {TOTAL_SECTORS.toLocaleString()}
            </span>{" "}
            • Nodes #{startNodeNum.toLocaleString()} – #{endNodeNum.toLocaleString()}
          </p>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => changeSector(currentSector - 1)}
              disabled={currentSector <= 1}
              className="bg-[#111318] hover:bg-zinc-800 disabled:opacity-40 border border-zinc-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs leading-tight text-center min-w-[76px]"
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
              className="bg-[#111318] hover:bg-zinc-800 disabled:opacity-40 border border-zinc-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs leading-tight text-center min-w-[76px]"
            >
              Next 100
              <br />→
            </button>
          </div>
        </div>

        {/* 10. EXACT 3-COLUMN GOLDEN DIAMOND GRID (MATCHING SCREENSHOT) */}
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          {sectorNodes.map((nodeId) => {
            const soldInfo = soldNodesMap[nodeId];
            const isSold = Boolean(soldInfo?.is_sold);
            const override = nodeOverridesMap[nodeId];
            const customBrand = override?.brand_name;
            const customLogo = override?.logo_url;

            return (
              <button
                key={nodeId}
                onClick={() => setSelectedNode(nodeId)}
                className={`relative aspect-square rounded-2xl p-2.5 flex flex-col justify-between items-center text-left transition transform active:scale-95 ${
                  isSold
                    ? "bg-[#111317] border border-zinc-800 opacity-75"
                    : "bg-gradient-to-b from-[#fcd34d] via-[#f59e0b] to-[#d97706] border border-amber-200 shadow-md shadow-amber-500/10"
                }`}
              >
                {/* Top-Left Node Number (#500001) */}
                <div className="w-full flex justify-between items-start">
                  <span
                    className={`text-[11px] font-black tracking-tight ${
                      isSold ? "text-zinc-400" : "text-black"
                    }`}
                  >
                    #{nodeId}
                  </span>
                  {customBrand && (
                    <span
                      className={`text-[8px] font-bold px-1 rounded truncate max-w-[48px] ${
                        isSold
                          ? "bg-zinc-800 text-zinc-300"
                          : "bg-black/20 text-black"
                      }`}
                    >
                      {customBrand}
                    </span>
                  )}
                </div>

                {/* Center Custom Picture OR Diamond Icon (💎) */}
                <div className="my-auto flex items-center justify-center">
                  {customLogo ? (
                    <img
                      src={customLogo}
                      alt={customBrand || `Node #${nodeId}`}
                      className="w-9 h-9 rounded-lg object-contain bg-white/90 p-0.5 shadow"
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

        {/* 11. GOOGLE ADSENSE COMPLIANT EDITORIAL & FAQ SECTION */}
        <section className="mt-10 bg-[#0b0d10] border border-zinc-800/80 rounded-2xl p-4 text-xs text-zinc-400 space-y-2.5 leading-relaxed">
          <h2 className="text-sm font-bold text-white">
            About The Pixel Vest Digital Node Grid
          </h2>
          <p>
            The Pixel Vest is Nigeria&apos;s premier 1,000,000-node interactive digital
            advertising and promotional reward grid. Brands, creators, and users can
            claim digital real estate sectors, showcase custom logos, and unlock
            sponsored promotional bounties seamlessly.
          </p>
          <p>
            <strong className="text-emerald-400">Referral Program:</strong> Share your
            unique referral link with friends. Whenever an invited user unlocks a node
            on the live board, <strong>₦50</strong> is credited directly to your
            Referral Bonus wallet.
          </p>
        </section>

        {/* 12. INDEPENDENT STUDIO FOOTER (NO O.G. AFRICA REFERENCE) */}
        <footer className="mt-8 pt-6 border-t border-zinc-900 text-center text-xs text-zinc-500 space-y-2">
          <p className="font-semibold text-zinc-400">
            © {new Date().getFullYear()} The Pixel Vest • Powered by PixelVest Digital
            Studios Ltd
          </p>
          <p>
            Official Support & Inquiries:{" "}
            <a
              href="mailto:adminpixelvest@gmail.com"
              className="text-emerald-400 underline"
            >
              adminpixelvest@gmail.com
            </a>
          </p>
          <div className="flex justify-center gap-4 pt-1 text-[11px] text-zinc-400">
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
          </div>
        </footer>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: UNLOCK NODE MODAL (SHOWS CUSTOM PICTURE & NAME)  */}
      {/* ========================================================= */}
      {selectedNode !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-700 rounded-2xl max-w-sm w-full p-5 text-center space-y-4">
            {(() => {
              const soldInfo = soldNodesMap[selectedNode];
              const isSold = Boolean(soldInfo?.is_sold);
              const override = nodeOverridesMap[selectedNode];

              return (
                <>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
                    {override?.logo_url ? (
                      <img
                        src={override.logo_url}
                        alt="Node Sponsor"
                        className="w-12 h-12 object-contain rounded-lg"
                      />
                    ) : (
                      <span className="text-3xl">💎</span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">
                      Node #{selectedNode.toLocaleString()}
                    </h3>
                    <p className="text-xs text-amber-400 font-semibold mt-0.5">
                      {override?.brand_name || "Golden Vault Node"}
                    </p>
                  </div>

                  {isSold ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 space-y-1">
                      <p className="font-bold text-rose-400">
                        This Node has already been unlocked!
                      </p>
                      <p>Unlocked by: {soldInfo?.owner_name || "Player"}</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-400">
                        Unlock this Golden Node for <strong>₦100</strong> to reveal
                        its instant promotional cash bounty!
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
                          <p className="font-bold">Main Wallet</p>
                          <p className="text-emerald-400 font-black">
                            ₦{Number(user?.wallet_balance || 0).toLocaleString()}
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
                          <p className="font-bold">Referral Bonus</p>
                          <p className="text-amber-400 font-black">
                            ₦{Number(user?.bonus_balance || 0).toLocaleString()}
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

      {/* ========================================================= */}
      {/* MODAL 2: REWARD RESULT POPUP                              */}
      {/* ========================================================= */}
      {rewardResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-amber-400/50 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h3 className="text-xl font-black text-amber-400">
              Node #{rewardResult.nodeId} Unlocked!
            </h3>
            <p className="text-xs text-zinc-400">{rewardResult.brandName}</p>
            {rewardResult.amount > 0 ? (
              <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-4">
                <p className="text-xs text-emerald-300 uppercase font-bold">
                  Instant Bounty Credited
                </p>
                <p className="text-3xl font-black text-emerald-400 mt-1">
                  +₦{rewardResult.amount.toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-300">
                Node claimed! No cash vault inside this node—try another Golden
                Node!
              </div>
            )}
            <button
              onClick={() => setRewardResult(null)}
              className="w-full bg-emerald-500 text-black font-black py-3 rounded-xl text-sm"
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: FIXED LOGIN / REGISTER MODAL                     */}
      {/* ========================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-700 rounded-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-white">
                {authMode === "login"
                  ? "Login to Your Account"
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
                  placeholder="e.g. 08012345678"
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
                    placeholder="Enter your name"
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
                      placeholder="e.g. 1234"
                      value={authPin}
                      onChange={(e) => setAuthPin(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">
                      Referral Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Referrer phone number"
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
                  ? "Please wait..."
                  : authMode === "login"
                  ? "LOGIN NOW"
                  : "CREATE ACCOUNT"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: FUND WALLET (PAYSTACK) & CASH OUT MODAL          */}
      {/* ========================================================= */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-700 rounded-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-white">
                Wallet & Cash Out
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-zinc-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl">
              <button
                onClick={() => setWalletTab("fund")}
                className={`py-2 rounded-lg text-xs font-bold ${
                  walletTab === "fund"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400"
                }`}
              >
                Fund via Paystack
              </button>
              <button
                onClick={() => setWalletTab("withdraw")}
                className={`py-2 rounded-lg text-xs font-bold ${
                  walletTab === "withdraw"
                    ? "bg-amber-400 text-black"
                    : "text-zinc-400"
                }`}
              >
                Cash Out to Bank
              </button>
            </div>

            {walletTab === "fund" ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">
                  Instant deposit via Paystack (Card, Bank Transfer, or USSD).
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
                  onClick={handleFundWallet}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-sm"
                >
                  PAY ₦{Number(fundAmount || 0).toLocaleString()} WITH PAYSTACK
                </button>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-2.5">
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
                  placeholder="Bank Name (e.g. OPay, PalmPay, GTBank)"
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
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black py-3 rounded-xl text-xs"
                >
                  SUBMIT CASH OUT REQUEST
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: APK INSTALL INSTRUCTIONS FALLBACK                */}
      {/* ========================================================= */}
      {showInstallHelp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-zinc-700 rounded-2xl max-w-sm w-full p-5 space-y-3 text-xs text-zinc-300">
            <h3 className="text-base font-black text-white">
              📲 Install The Pixel Vest App
            </h3>
            <p>
              To install The Pixel Vest as a full-screen app on your phone:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>On Android (Chrome):</strong> Tap the <strong>3 dots (⋮)</strong>{" "}
                at the top right of your browser and select{" "}
                <strong>&quot;Install App&quot;</strong> or{" "}
                <strong>&quot;Add to Home screen&quot;</strong>.
              </li>
              <li>
                <strong>On iPhone (Safari):</strong> Tap the{" "}
                <strong>Share icon (↑)</strong> at the bottom and tap{" "}
                <strong>&quot;Add to Home Screen&quot;</strong>.
              </li>
            </ul>
            <button
              onClick={() => setShowInstallHelp(false)}
              className="w-full bg-emerald-500 text-black font-black py-2.5 rounded-xl text-xs mt-2"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: TERMS & PRIVACY POLICY (FOR GOOGLE ADSENSE)      */}
      {/* ========================================================= */}
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
                Welcome to The Pixel Vest, operated by PixelVest Digital Studios Ltd.
                By accessing thepixelvest.com.ng, users can purchase digital node
                display positions for ₦100 and participate in promotional brand
                bounties. Users must be 18 years or older. All deposits are processed
                securely via Paystack, and verified withdrawal requests are settled to
                Nigerian bank accounts.
              </p>
            ) : (
              <p className="leading-relaxed">
                PixelVest Digital Studios Ltd respects your privacy. We collect only
                your phone number, name, and settlement bank details to manage your
                node ownership and wallet balances. Third-party vendors, including
                Google AdSense, use cookies to serve ads based on user visits. Contact
                adminpixelvest@gmail.com for any data inquiries.
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