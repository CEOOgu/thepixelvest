"use client";

import { useState } from "react";
import { supabase } from "./lib/supabase";

// --- SYSTEM CONSTANTS & B2B FRAMEWORK ---
const NODES_PER_PAGE = 100;
const TOTAL_NODES = 1000000;

// The B2B Ad Framework: Map node IDs to image URLs with a highlight flag
const SPONSORED_NODES: Record<number, { url: string; highlight?: string }> = {
  15: { 
    url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", 
    highlight: "0 0 0 2px #FFFFFF, 0 0 15px rgba(255,255,255,0.6)" // Crisp white border glow
  },
  45: { 
    url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" 
  },
};
// --- NAIJA STREET & ROAST ARRAY (100 ITEMS) ---
const ROASTS = [
  // The Street & Sapa Roasts
  "Sapa choke! Nothing for this node.", "Omo, you just bought an empty plot in the cloud.",
  "Premium tears. Try another node.", "Fund missing. The system swallowed it.",
  "Village people are currently pressing your remote.", "You dey find 10k inside 100 naira node? Dey play.",
  "Just go and drink garri, this node is empty.", "Your eyes clear now? No funds here.",
  "Breakfast served hot! No money in this grid.", "You just donated 100 naira to the national grid.",
  "This node is as empty as a politician's promise.", "Wotowoto! You missed the target.",
  "Even your ancestors are shaking their heads right now.", "Is this playing? What type of playing is this?",
  "Tough times never last, but this empty node is forever.", "You expected a vault, but you found a vacuum.",
  "Sapa nicely formatted in a digital square.",
  
  // The Crypto & Tech Bro Roasts
  "Error 404: Funds not found.", "You bought the dip, but the dip kept dipping.",
  "Your portfolio just took a screenshot.", "Market is red. This node is too.",
  "Investor, your investment just entered voicemail.", "Liquidity zero. Try again.",
  "This node was hacked by your village people.", "Insufficient luck. Please recharge your destiny.",
  "Your Wi-Fi is strong, but your luck is weak.", "Tech bro, you just debugged an empty array.",
  "This sector has been wiped clean.", "Ping timeout. The money did not respond.",
  "Transaction successful: You bought premium air.",
  
  // Sarcastic Motivation & Quotes
  "They say money cannot buy happiness. This node cannot buy anything either.",
  "Rome wasn't built in a day, and your wealth won't be built on this node.",
  "The reward for hard work is more work. Click another node.",
  "Don't give up! The 10k node is laughing at you from afar.",
  "Patience is a virtue, but this node is just empty.",
  "You are one node closer to winning... or going broke.",
  "Every disappointment is a blessing. Consider yourself blessed.",
  "Shoot for the moon! But you landed on an empty digital square.",
  "Believe in yourself, because this node definitely doesn't.",
  "A journey of a thousand miles begins with a single lost node.",
  
  // Direct & Ruthless
  "Nothing here. Move on.", "Absolutely zero naira.", "Ouch. That was a waste of 100 bucks.",
  "Better luck next time. Or maybe not.", "The vault is locked. You don't have the key.",
  "You just bought a 1x1 pixel of disappointment.", "Nothing to see here, CEO.",
  "Grid says no.", "Try again. The system is hungry.", "Mission failed. We'll get 'em next time.",
  
  // University & Student Roasts
  "Carryover loaded. No funds here.", "Your CGPA is crying, and this node is empty too.",
  "Lecturer said no. The grid says no too.", "This node is as empty as a 100L student's pocket on a Friday.",
  "You thought this was a scholarship? Dey play.", "Read your books! You are here looking for 10k.",
  "Sorting failed. You can't bribe this grid.", "Exam week sapa has entered the chat.",
  "Hostel rent is due, but this node won't help you pay it.", "You just submitted an empty assignment to the grid.",
  "Expulsion from the vault! No cash for you.", "This node has gone on strike. ASUU style.",
  "Missing script! Your money cannot be found.", "You studied for the wrong course. Empty node.",
  "First class in spending 100 naira, third class in winning.",
  
  // Relationship & Heartbreak Roasts
  "She served you breakfast, now the grid is serving you too.", "This node is as empty as your ex's promises.",
  "You got ghosted by the vault.", "Red flag! Do not expect money from this square.",
  "It's not you, it's the node. Actually, it's you.", "Your crush doesn't like you, and this grid doesn't either.",
  "You are in the friendzone of wealth.", "Heartbreak is free, this node cost you 100 naira.",
  "She said she needs space, so the grid gave you an empty one.", "Stop texting her and stop clicking empty nodes.",
  "Another talking stage that led to nowhere.", "You gave the grid your heart, it gave you zero naira.",
  "Even your ex wouldn't want this node.",
  
  // Naija Pop Culture & Street Slang
  "Idan doesn't beg, but Idan just lost 100 naira.", "Who goes you? Not this node.",
  "You have been restricted from enjoying this wealth.", "No evidence, you go explain tire.",
  "Let the poor breathe! But this node is choking.", "E choke! But no money drop.",
  "Wahala for who no win 10k.", "Just dey play. Play play 100 naira don go.",
  "Odogwu, your funds have been intercepted.", "You never see anything. Click another one.",
  "Tears in the metaverse.", "Agba baller just kicked the ball into the bush.",
  
  // Hardcore Finance & Business
  "Margin call! Your account has been liquidated.", "Bear market activated on this specific node.",
  "This node was audited and found completely bankrupt.", "Venture capital denied. Try bootstrapping.",
  "Your ROI on this node is exactly zero.", "Server maintenance: We removed the money.",
  "Your API request for wealth timed out.", "404 Wealth Not Found.",
  "You deployed to production but forgot the database.", "Insufficient gas fees. Transaction failed."
];

export default function Home() {
  // --- CORE GAME STATE ---
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [soldSessionNodes, setSoldSessionNodes] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSectorStart, setCurrentSectorStart] = useState(1);
  
  // --- AUTH & WALLET STATE ---
  const [userIdentifier, setUserIdentifier] = useState(""); 
  const [userPassword, setUserPassword] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  
  // --- SECURITY PIN STATE ---
  const [hasPin, setHasPin] = useState(false); 
  const [savedPin, setSavedPin] = useState(""); 
  const [tempPin, setTempPin] = useState("");
  
  // --- WITHDRAWAL STATE ---
  const [withdrawType, setWithdrawType] = useState<'bank' | 'airtime'>('bank');
  const [withdrawBank, setWithdrawBank] = useState("");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawName, setWithdrawName] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [airtimePhone, setAirtimePhone] = useState("");
  const [airtimeNetwork, setAirtimeNetwork] = useState("MTN");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // --- MODAL STATE ---
  const [modal, setModal] = useState({ 
    isOpen: false, 
    type: 'none', 
    payload: [] as any[]
  });

  const [tempAuthInput, setTempAuthInput] = useState("");
  const [tempPassInput, setTempPassInput] = useState("");

  // --- LOGIC: BULK DISCOUNT ---
  const calculateCost = (count: number) => {
    if (count >= 20) return count * 80; 
    if (count >= 10) return count * 90; 
    return count * 100; 
  };

  const cartCost = calculateCost(selectedNodes.length);
  const canPayWithWallet = walletBalance >= cartCost;

  // --- LOGIC: VIRAL SHARE ---
  const handleShare = async () => {
    const text = `I just secured nodes on The Pixel Vest digital grid! Claim your territory and extract the vault.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'The Pixel Vest', text: text, url: window.location.href });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      alert("Copy this link to share: " + window.location.href);
    }
  };

  // --- LOGIC: EXACT PROBABILITY ENGINE (₦15.5M Pool) ---
  const determineNodeOutcome = () => {
    const r = Math.random();
    // 100 / 1,000,000 = 0.0001
    if (r < 0.00010) return { type: 'win', result: '₦10,000', value: 10000 };
    // 80 / 1,000,000 = 0.00008 (Cumulative: 0.00018)
    if (r < 0.00018) return { type: 'win', result: '₦5,000', value: 8000 };
    // 500 / 1,000,000 = 0.0005 (Cumulative: 0.00068)
    if (r < 0.00068) return { type: 'win', result: '₦3,000', value: 5000 };
    // 2500 / 1,000,000 = 0.0025 (Cumulative: 0.00318)
    if (r < 0.00318) return { type: 'win', result: '₦1,000', value: 6000 };
    // 30,000 / 1,000,000 = 0.03 (Cumulative: 0.03318)
    if (r < 0.03318) return { type: 'win', result: '₦100', value: 100 };
    // 15,000 / 1,000,000 = 0.015 (Cumulative: 0.04818)
    if (r < 0.04818) return { type: 'win', result: '₦70', value: 70 };
    // 45,000 / 1,000,000 = 0.045 (Cumulative: 0.09318)
    if (r < 0.09318) return { type: 'win', result: '₦60', value: 60 };
    // 45,000 / 1,000,000 = 0.045 (Cumulative: 0.13818)
    if (r < 0.13818) return { type: 'win', result: '₦50', value: 50 };
    // 20,000 / 1,000,000 = 0.02 (Cumulative: 0.15818)
    if (r < 0.15818) return { type: 'win', result: '₦30', value: 30 };
    // 5,000 / 1,000,000 = 0.005 (Cumulative: 0.16318)
    if (r < 0.16318) return { type: 'win', result: '₦25', value: 25 };
    // 15,000 / 1,000,000 = 0.015 (Cumulative: 0.17818)
    if (r < 0.17818) return { type: 'win', result: '₦20', value: 20 };
    // 15,000 / 1,000,000 = 0.015 (Cumulative: 0.19318)
    if (r < 0.19318) return { type: 'win', result: '₦10', value: 10 };
    
    // Remaining ~80.68% Loss
    return { 
      type: 'loss', 
      result: ROASTS[Math.floor(Math.random() * ROASTS.length)], 
      value: 0 
    };
  };

  // --- LOGIC: CHECKOUT & PROCESSING ---
  const processCheckout = async () => {
    setIsProcessing(true);
    setModal({ isOpen: false, type: 'none', payload: [] });

    try {
      const results = selectedNodes.map(nodeId => {
        const outcome = determineNodeOutcome();
        return {
          id: nodeId,
          type: outcome.type,
          result: outcome.result,
          value: outcome.value
        };
      });

      const sessionWon = results.reduce((total: number, item: any) => total + item.value, 0);

      setSoldSessionNodes(prev => [...prev, ...selectedNodes]);
      setWalletBalance(prev => prev + sessionWon);
      setModal({ isOpen: true, type: 'reveal', payload: results });
      setSelectedNodes([]); 
    } catch (error) {
      alert("Network error processing transaction.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerCheckout = (useWallet: boolean = false) => {
    if (selectedNodes.length === 0) return;
    if (!userIdentifier) {
      setModal({ isOpen: true, type: 'login', payload: [] });
      return;
    }
    if (useWallet) {
      if (walletBalance < cartCost) {
        alert("Insufficient Wallet Balance!");
        return;
      }
      setWalletBalance(prev => prev - cartCost); 
    }
    processCheckout();
  };

  // --- LOGIC: WITHDRAWALS & SECURITY ---
  const initiateWithdrawal = () => {
    if (!hasPin) setModal({ isOpen: true, type: 'pin-setup', payload: [] });
    else setModal({ isOpen: true, type: 'pin-confirm', payload: [] });
  };

  const executeWithdrawal = async () => {
    const amt = parseInt(withdrawAmount) || walletBalance; 
    setIsWithdrawing(true);

    const payload = withdrawType === 'bank' 
      ? { user_phone: userIdentifier, bank_name: withdrawBank, account_number: withdrawAccount, account_name: withdrawName, amount: amt, type: 'bank' }
      : { user_phone: userIdentifier, bank_name: airtimeNetwork, account_number: airtimePhone, account_name: "AIRTIME VTU", amount: amt, type: 'airtime' };

    const { error } = await supabase.from('withdrawals').insert(payload);

    if (error) {
      alert("Error submitting request: " + error.message);
      setIsWithdrawing(false);
      return;
    }

    alert(`Withdrawal request for ₦${amt.toLocaleString()} sent successfully!`);
    setWalletBalance(prev => prev - amt);
    setWithdrawBank(""); setWithdrawAccount(""); setWithdrawName(""); setWithdrawAmount(""); setAirtimePhone("");
    setModal({ isOpen: false, type: 'none', payload: [] });
    setIsWithdrawing(false);
  };

  // --- GRID RENDER ENGINE ---
  const isNodeSold = (id: number) => soldSessionNodes.includes(id); 
  const toggleNode = (nodeId: number) => {
    if (isNodeSold(nodeId)) {
      alert(`Node ${nodeId} is already secured.`);
      return;
    }
    setSelectedNodes(prev => prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]);
  };

  const handleSearch = () => {
    const node = parseInt(searchQuery);
    if (isNaN(node) || node < 1 || node > TOTAL_NODES) return alert("Enter a valid node between 1 and 1,000,000");
    setCurrentSectorStart(node);
    if (isNodeSold(node)) alert("This node is already sold!");
    else setSelectedNodes(prev => prev.includes(node) ? prev : [...prev, node]);
    setSearchQuery("");
  };

  const sectorNodes = [];
  for (let i = 0; i < NODES_PER_PAGE; i++) {
    const nodeId = currentSectorStart + i;
    if (nodeId > TOTAL_NODES) break;

    const sold = isNodeSold(nodeId);
    const isSelected = selectedNodes.includes(nodeId);
    
    // 👇 PASTE THE UPDATED SPONSOR & STYLE LOGIC HERE 👇
    const sponsor = SPONSORED_NODES[nodeId];
    const sponsorImg = sponsor?.url;
    
    let bgStyle = 'linear-gradient(145deg, #FBBF24, #B45309)'; 
    let textColor = '#FEF3C7'; 
    let borderColor = 'rgba(255,255,255,0.2)';
    let shadow = 'inset 0 2px 4px rgba(255,255,255,0.2)';
    
    if (sold) {
      bgStyle = '#000000'; 
      textColor = '#333333'; 
      borderColor = sponsor?.highlight ? '#FFFFFF' : '#111111';
      shadow = sponsor?.highlight || 'none';
    } else if (isSelected) {
      bgStyle = 'linear-gradient(145deg, #064E3B, #022C22)'; 
      textColor = '#10B981'; 
      borderColor = '#10B981';
      shadow = '0 0 15px rgba(16,185,129,0.4)';
    }
    // 👆 END OF STYLE LOGIC 👆

    sectorNodes.push(
      <button 
        key={nodeId}
        type="button"
        onClick={() => toggleNode(nodeId)}
        style={{ 
          width: '100%', aspectRatio: '1/1', background: bgStyle, color: textColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: 'clamp(11px, 3.5vw, 14px)', fontWeight: '900', borderRadius: '12px', 
          cursor: sold ? 'not-allowed' : 'pointer', border: `2px solid ${borderColor}`,
          transform: isSelected ? 'scale(0.92)' : 'scale(1)', transition: 'all 0.2s ease',
          boxShadow: shadow, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
          position: 'relative', overflow: 'hidden', padding: sponsorImg ? '6px' : '0' 
        }}
      >
        {sponsorImg ? (
          <img src={sponsorImg} alt={`Sponsor ${nodeId}`} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: sold ? 0.9 : 1 }} />
        ) : ( nodeId )}
      </button>
    );
  }

  return (
    <main style={{ backgroundColor: '#030712', minHeight: '100vh', width: '100%', maxWidth: '480px', margin: '0 auto', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '120px', position: 'relative' }}>
      
      {/* HEADER */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: 'rgba(3, 7, 18, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px', paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>The Pixel Vest</h1>
          <button 
            type="button"
            onClick={() => setModal({ isOpen: true, type: 'withdraw', payload: [] })}
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10B981', padding: '8px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            ₦{walletBalance.toLocaleString()}
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ display: 'flex', gap: '8px', margin: 0 }}>
          <input 
            type="number" placeholder="Search Node (1 - 1M)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '16px' }}
          />
          <button type="submit" style={{ padding: '0 20px', borderRadius: '12px', backgroundColor: '#FBBF24', color: '#000', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>
            FIND
          </button>
        </form>
      </div>

      {/* SALES HOOK */}
      <div style={{ padding: '32px 20px 24px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '6px 12px', borderRadius: '20px', marginBottom: '16px' }}>
          <p style={{ color: '#FBBF24', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px', margin: 0, textTransform: 'uppercase' }}>Live Grid • 1,000,000 Nodes</p>
        </div>
        
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 12px 0', lineHeight: '1.2' }}>
          Be Among The Lucky Investors. <br/>
          <span style={{ color: '#9CA3AF' }}>Secure Your Digital Fortune.</span>
        </h2>
        
        <p style={{ color: '#9CA3AF', fontSize: '0.95rem', margin: '0 0 24px 0', lineHeight: '1.6' }}>
          Secure an exclusive digital node for <strong>₦100</strong>. Uncover hidden cash bounties instantly, or hold your plot. Cash out directly to your bank or as airtime. 
        </p>
        <p style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 'bold' }}>⚡ Bulk Buy: 10+ (10% Off) | 20+ (20% Off)</p>
      </div>

      {/* RESPONSIVE CSS GRID */}
      <div style={{ padding: '0 16px 16px 16px' }}>
        {currentSectorStart > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <button onClick={() => { setCurrentSectorStart(Math.max(1, currentSectorStart - NODES_PER_PAGE)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>↑ Load Previous 100</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', width: '100%' }}>
          {sectorNodes}
        </div>

        {currentSectorStart + NODES_PER_PAGE <= TOTAL_NODES && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <button onClick={() => { setCurrentSectorStart(currentSectorStart + NODES_PER_PAGE); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>↓ Load Next 100</button>
          </div>
        )}
      </div>

      {/* B2B & REWARDS FOOTER */}
      <div style={{ padding: '24px 16px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '32px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '1px' }}>💼 Brand Your Own Node</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#9CA3AF', lineHeight: '1.6' }}>
            Want to display your logo on the grid permanently? Purchase a custom node for your brand, business, or personal use.<br/><br/>
            Send a message for ad placements: <br/>
            <a href="mailto:emmaoguogu@gmail.com" style={{ color: '#10B981', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', marginTop: '4px', fontSize: '0.95rem' }}>emmaoguogu@gmail.com</a>
          </p>
        </div>
        <button onClick={handleShare} style={{ width: '100%', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10B981', padding: '16px', borderRadius: '16px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>
          🎁 SHARE TO GET A FREE TRIAL
        </button>
      </div>

      {/* CART OVERLAY */}
      {selectedNodes.length > 0 && (
        <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', zIndex: 50, padding: '16px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: '100%', maxWidth: '448px', backgroundColor: 'rgba(15, 23, 42, 0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -10px 40px rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)', pointerEvents: 'auto' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9CA3AF', margin: 0 }}>CART {selectedNodes.length >= 10 && <span style={{color: '#10B981'}}> (DISCOUNT APPLIED)</span>}</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '900', margin: '4px 0 0 0' }}>{selectedNodes.length} Nodes • ₦{cartCost.toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {canPayWithWallet && <button type="button" onClick={() => triggerCheckout(true)} disabled={isProcessing} style={{ padding: '14px 16px', borderRadius: '20px', backgroundColor: '#F59E0B', color: '#000', fontWeight: '900', fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>PAY (WALLET)</button>}
              <button type="button" onClick={() => triggerCheckout(false)} disabled={isProcessing} style={{ padding: '14px 20px', borderRadius: '20px', backgroundColor: '#10B981', color: '#000', fontWeight: '900', fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>{isProcessing ? '...' : (canPayWithWallet ? '+ NEW' : 'CHECKOUT')}</button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL MODALS */}
      {modal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}>
            
            {/* LOGIN MODAL */}
            {modal.type === 'login' && (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: '900' }}>Authentication</h2>
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>Enter your Phone or Email to secure your nodes.</p>
                <input type="text" placeholder="Email or Phone Number" value={tempAuthInput} onChange={(e) => setTempAuthInput(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', marginBottom: '12px', fontSize: '16px' }} />
                <input type="password" placeholder="Password (Optional)" value={tempPassInput} onChange={(e) => setTempPassInput(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', marginBottom: '24px', fontSize: '16px' }} />
                <button onClick={() => { if(tempAuthInput.length > 5) { setUserIdentifier(tempAuthInput); setUserPassword(tempPassInput); triggerCheckout(false); } else alert("Please enter a valid Phone or Email."); }} style={{ width: '100%', backgroundColor: '#10B981', color: '#000', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem', border: 'none', cursor: 'pointer' }}>SECURE ACCOUNT</button>
                <button onClick={() => setModal({ isOpen: false, type: 'none', payload: [] })} style={{ width: '100%', backgroundColor: 'transparent', color: '#9CA3AF', padding: '16px', marginTop: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            )}

            {/* REVEAL MODAL */}
            {modal.type === 'reveal' && (
              <>
                <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase' }}>Allocation Secured</h2>
                </div>
                <div style={{ maxHeight: '40vh', overflowY: 'auto', padding: '16px' }}>
                  {modal.payload.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', margin: '0 0 12px 0', padding: '16px', borderRadius: '16px' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold', color: '#6B7280' }}>NODE {item.id}</p>
                      <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.05rem', color: item.type === 'win' ? '#34D399' : '#F3F4F6' }}>{item.result}</p>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                  <button onClick={handleShare} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}>SHARE</button>
                  <button onClick={() => setModal({ isOpen: false, type: 'none', payload: [] })} style={{ flex: 2, backgroundColor: '#10B981', color: '#000', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}>ADD TO WALLET</button>
                </div>
              </>
            )}

            {/* PREMIUM WALLET / WITHDRAW MODAL WITH B2B */}
            {modal.type === 'withdraw' && (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0, color: '#fff', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>Vault <span style={{fontSize: '0.7rem', backgroundColor: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '4px 8px', borderRadius: '12px'}}>VERIFIED</span></h2>
                  <button onClick={() => setModal({ isOpen: false, type: 'none', payload: [] })} style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
                </div>
                
                <div style={{ textAlign: 'center', padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
                  <p style={{ color: '#10B981', fontSize: '2.5rem', fontWeight: '900', margin: '0' }}>₦{walletBalance.toLocaleString()}</p>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '8px 0 0 0' }}>Available Balance</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  <button onClick={() => setWithdrawType('bank')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', backgroundColor: withdrawType === 'bank' ? 'rgba(255,255,255,0.1)' : 'transparent', color: withdrawType === 'bank' ? '#fff' : '#64748B', cursor: 'pointer' }}>Bank</button>
                  <button onClick={() => setWithdrawType('airtime')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', backgroundColor: withdrawType === 'airtime' ? 'rgba(255,255,255,0.1)' : 'transparent', color: withdrawType === 'airtime' ? '#fff' : '#64748B', cursor: 'pointer' }}>Airtime</button>
                </div>

                {withdrawType === 'bank' && (
                  walletBalance >= 200 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                      <input type="text" placeholder="Bank Name (e.g. OPay, Moniepoint)" value={withdrawBank} onChange={(e) => setWithdrawBank(e.target.value)} style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '16px' }} />
                      <input type="text" placeholder="10-Digit Account Number" value={withdrawAccount} onChange={(e) => setWithdrawAccount(e.target.value)} style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '16px' }} />
                      <input type="text" placeholder="Account Name" value={withdrawName} onChange={(e) => setWithdrawName(e.target.value)} style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '16px' }} />
                      <input type="number" placeholder={`Amount (Max: ₦${walletBalance})`} value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '16px' }} />
                      <button onClick={initiateWithdrawal} style={{ width: '100%', backgroundColor: '#10B981', color: '#000', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '8px' }}>TRANSFER FUNDS</button>
                    </div>
                  ) : (
                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '32px' }}>
                      <p style={{ color: '#FCD34D', fontSize: '0.9rem', margin: '0 0 16px 0', lineHeight: '1.5' }}>Bank transfers require a minimum of ₦200. Switch to the <strong>Airtime</strong> tab to withdraw micro-balances instantly.</p>
                    </div>
                  )
                )}

                {withdrawType === 'airtime' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                    <select value={airtimeNetwork} onChange={(e) => setAirtimeNetwork(e.target.value)} style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '16px', appearance: 'none' }}>
                      <option value="MTN">MTN NG</option>
                      <option value="AIRTEL">AIRTEL NG</option>
                      <option value="GLO">GLO NG</option>
                      <option value="9MOBILE">9MOBILE NG</option>
                    </select>
                    <input type="tel" placeholder="Destination Phone (e.g. 080...)" value={airtimePhone} onChange={(e) => setAirtimePhone(e.target.value)} style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '16px' }} />
                    <input type="number" placeholder={`Amount (Max: ₦${walletBalance})`} value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '16px' }} />
                    <button onClick={initiateWithdrawal} disabled={walletBalance === 0} style={{ width: '100%', backgroundColor: '#F59E0B', color: '#000', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem', border: 'none', cursor: walletBalance === 0 ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: walletBalance === 0 ? 0.5 : 1 }}>SEND AIRTIME</button>
                  </div>
                )}

                {/* VIP B2B & AFFILIATE CARD INSIDE WALLET */}
                <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '1px' }}>👑 VIP & Affiliates</h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#D1D5DB', lineHeight: '1.6' }}>
                    Join our affiliate program, get free trials, or purchase a personalized node to display your brand permanently on the global grid.
                  </p>
                  <a href="mailto:emmaoguogu@gmail.com" style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Contact: emmaoguogu@gmail.com
                  </a>
                </div>

              </div>
            )}

            {/* PIN SETUP MODAL */}
            {modal.type === 'pin-setup' && (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: '900' }}>Setup Security PIN</h2>
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>Create a 4-digit PIN to secure your withdrawals.</p>
                <input type="password" maxLength={4} placeholder="••••" value={tempPin} onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ''))} style={{ width: '120px', padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none', marginBottom: '24px', fontSize: '24px', textAlign: 'center', letterSpacing: '8px' }} />
                <button onClick={() => { if(tempPin.length === 4) { setSavedPin(tempPin); setHasPin(true); setTempPin(""); setModal({ isOpen: true, type: 'pin-confirm', payload: [] }); } else alert("PIN must be exactly 4 digits."); }} style={{ width: '100%', backgroundColor: '#10B981', color: '#000', padding: '18px', borderRadius: '16px', fontWeight: '900', border: 'none', cursor: 'pointer' }}>SAVE & CONTINUE</button>
                <button onClick={() => { setTempPin(""); setModal({ isOpen: true, type: 'withdraw', payload: [] }); }} style={{ width: '100%', backgroundColor: 'transparent', color: '#9CA3AF', padding: '16px', marginTop: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            )}

            {/* PIN CONFIRM MODAL */}
            {modal.type === 'pin-confirm' && (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: '900' }}>Enter PIN</h2>
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>Authorize this transaction.</p>
                <input type="password" maxLength={4} placeholder="••••" value={tempPin} onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ''))} style={{ width: '120px', padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none', marginBottom: '24px', fontSize: '24px', textAlign: 'center', letterSpacing: '8px' }} />
                <button onClick={() => { if(tempPin === savedPin) { setTempPin(""); executeWithdrawal(); } else alert("Incorrect PIN."); }} disabled={isWithdrawing} style={{ width: '100%', backgroundColor: '#F59E0B', color: '#000', padding: '18px', borderRadius: '16px', fontWeight: '900', border: 'none', cursor: 'pointer' }}>{isWithdrawing ? "AUTHORIZING..." : "CONFIRM"}</button>
                <button onClick={() => { setTempPin(""); setModal({ isOpen: true, type: 'withdraw', payload: [] }); }} disabled={isWithdrawing} style={{ width: '100%', backgroundColor: 'transparent', color: '#9CA3AF', padding: '16px', marginTop: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
}