"use client";

import { useState } from "react";

const NODE_COLORS = [
  'linear-gradient(135deg, #8B5CF6, #4C1D95)', // Cyber Violet
  'linear-gradient(135deg, #3B82F6, #1E3A8A)', // Royal Blue
  'linear-gradient(135deg, #EC4899, #831843)', // Neon Pink
  'linear-gradient(135deg, #F59E0B, #78350F)', // Amber Gold
  'linear-gradient(135deg, #14B8A6, #134E4A)', // Teal
  'linear-gradient(135deg, #EF4444, #7F1D1D)'  // Ruby Red
];

export default function Home() {
  // UPGRADE 1: Switched from Sets to pure Arrays for bulletproof mobile rendering
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [soldSessionNodes, setSoldSessionNodes] = useState<number[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [currentSectorStart, setCurrentSectorStart] = useState(1);
  const NODES_PER_PAGE = 100;
  const TOTAL_NODES = 1000000;
  const COLS = 5; 
  
  const [userPhone, setUserPhone] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [modal, setModal] = useState({ 
    isOpen: false, 
    type: 'none', 
    payload: [] as any[]
  });

  const [tempPhoneInput, setTempPhoneInput] = useState("");

  const isNodeSold = (id: number) => soldSessionNodes.includes(id); 

  const toggleNode = (nodeId: number) => {
    if (isNodeSold(nodeId)) {
      alert(`Node ${nodeId} is already secured.`);
      return;
    }
    // Instant Array manipulation triggers guaranteed re-renders
    setSelectedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId) 
        : [...prev, nodeId]
    );
  };

  const handleSearch = () => {
    const node = parseInt(searchQuery);
    if (isNaN(node) || node < 1 || node > TOTAL_NODES) {
      alert("Enter a valid node between 1 and 1,000,000");
      return;
    }
    
    setCurrentSectorStart(node);
    
    if (isNodeSold(node)) {
      alert("This node is already sold!");
    } else {
      setSelectedNodes(prev => prev.includes(node) ? prev : [...prev, node]);
    }
    
    setSearchQuery("");
  };

  const triggerCheckout = (useWallet: boolean = false) => {
    if (selectedNodes.length === 0) return;
    const cost = selectedNodes.length * 100;

    if (!userPhone) {
      setModal({ isOpen: true, type: 'login', payload: [] });
      return;
    }

    if (useWallet) {
      if (walletBalance < cost) {
        alert("Insufficient Wallet Balance!");
        return;
      }
      setWalletBalance(prev => prev - cost); 
    }

    processCheckout();
  };

  const processCheckout = async () => {
    setIsProcessing(true);
    setModal({ isOpen: false, type: 'none', payload: [] });

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: selectedNodes })
      });

      const data = await response.json();
      if (data.error || !data.results) {
        alert("Backend Alert: " + (data.error || "Could not read database."));
        return;
      }
      
      const sessionWon = data.results.reduce((total: number, item: any) => {
        if (item.type === 'win') {
          const match = item.result.match(/₦([\d,]+)/);
          return match ? total + parseInt(match[1].replace(/,/g, '')) : total;
        }
        return total;
      }, 0);

      setSoldSessionNodes(prev => [...prev, ...selectedNodes]);
      setWalletBalance(prev => prev + sessionWon);
      setModal({ isOpen: true, type: 'reveal', payload: data.results });
      setSelectedNodes([]); 

    } catch (error) {
      alert("Network error: Make sure the local API is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  const sectorNodes = [];
  for (let i = 0; i < NODES_PER_PAGE; i++) {
    const nodeId = currentSectorStart + i;
    if (nodeId > TOTAL_NODES) break;

    const sold = isNodeSold(nodeId);
    const isSelected = selectedNodes.includes(nodeId);
    const baseColor = NODE_COLORS[nodeId % NODE_COLORS.length];
    
    let bgStyle = baseColor;
    let textColor = '#FFFFFF';
    
    if (sold) {
      bgStyle = '#000000';
      textColor = '#334155';
    } else if (isSelected) {
      bgStyle = '#FFFFFF'; 
      textColor = '#000000';
    }

    sectorNodes.push(
      <button 
        key={nodeId}
        type="button"
        onClick={() => toggleNode(nodeId)}
        style={{ 
          width: '60px', height: '60px', background: bgStyle, color: textColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold',
          borderRadius: '16px', cursor: sold ? 'not-allowed' : 'pointer', opacity: sold ? 0.6 : 1,
          textDecoration: sold ? 'line-through' : 'none',
          border: isSelected ? '4px solid #10B981' : (sold ? '1px solid #1e293b' : '1px solid rgba(255,255,255,0.1)'),
          transform: isSelected ? 'scale(0.92)' : 'scale(1)', transition: 'all 0.15s ease',
          boxShadow: isSelected ? '0 0 20px rgba(16,185,129,0.5)' : 'none',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation' // UPGRADE 2: Forces instant response on Android touchscreens
        }}
      >
        {nodeId}
      </button>
    );
  }

  const visibleRows = [];
  for (let i = 0; i < sectorNodes.length; i += COLS) {
    visibleRows.push(
      <div key={i} style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
        {sectorNodes.slice(i, i + COLS)}
      </div>
    );
  }

  const cartCost = selectedNodes.length * 100;
  const canPayWithWallet = walletBalance >= cartCost;

  return (
    <main style={{ backgroundColor: '#030712', minHeight: '100vh', width: '100%', maxWidth: '480px', margin: '0 auto', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '120px' }}>
      
      <div style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: 'rgba(3, 7, 18, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px', paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>The Pixel Vest</h1>
          
          <button 
            type="button"
            onClick={() => setModal({ isOpen: true, type: 'withdraw', payload: [] })}
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10B981', padding: '8px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            ₦{walletBalance.toLocaleString()}
          </button>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          style={{ display: 'flex', gap: '8px', margin: 0 }}
        >
          <input 
            type="number" 
            placeholder="Search Node (1 - 1M)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '16px' }}
          />
          <button type="submit" style={{ padding: '0 20px', borderRadius: '12px', backgroundColor: '#ffffff', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.95rem', touchAction: 'manipulation' }}>
            FIND
          </button>
        </form>
      </div>

      <div style={{ padding: '24px 20px 10px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10B981', margin: '0 0 8px 0' }}>₦100 Per Node</h2>
        <p style={{ color: '#9CA3AF', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
          Select a mystery square. Uncover hidden cash prizes or get roasted by the system.
        </p>
      </div>

      <div style={{ padding: '16px 0' }}>
        
        {currentSectorStart > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <button 
              type="button"
              onClick={() => {
                setCurrentSectorStart(Math.max(1, currentSectorStart - NODES_PER_PAGE));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', touchAction: 'manipulation' }}
            >
              ↑ Load Previous 100
            </button>
          </div>
        )}

        {visibleRows}

        {currentSectorStart + NODES_PER_PAGE <= TOTAL_NODES && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <button 
              type="button"
              onClick={() => {
                setCurrentSectorStart(currentSectorStart + NODES_PER_PAGE);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', touchAction: 'manipulation' }}
            >
              ↓ Load Next 100
            </button>
          </div>
        )}
      </div>

      {selectedNodes.length > 0 && (
        <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', zIndex: 50, padding: '16px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: '100%', maxWidth: '448px', backgroundColor: 'rgba(17, 24, 39, 0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', pointerEvents: 'auto' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9CA3AF', margin: 0 }}>CART</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '900', margin: '4px 0 0 0' }}>{selectedNodes.length} Nodes • ₦{cartCost.toLocaleString()}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {canPayWithWallet && (
                <button type="button" onClick={() => triggerCheckout(true)} disabled={isProcessing} style={{ padding: '14px 16px', borderRadius: '20px', backgroundColor: '#F59E0B', color: '#000', fontWeight: '900', fontSize: '0.85rem', border: 'none', cursor: 'pointer', opacity: isProcessing ? 0.5 : 1, touchAction: 'manipulation' }}>
                  PAY (WALLET)
                </button>
              )}
              <button type="button" onClick={() => triggerCheckout(false)} disabled={isProcessing} style={{ padding: '14px 20px', borderRadius: '20px', backgroundColor: '#10B981', color: '#000', fontWeight: '900', fontSize: '0.85rem', border: 'none', cursor: 'pointer', opacity: isProcessing ? 0.5 : 1, touchAction: 'manipulation' }}>
                {isProcessing ? '...' : (canPayWithWallet ? '+ NEW' : 'CHECKOUT')}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            
            {modal.type === 'login' && (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: '900' }}>Create Wallet</h2>
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>Enter your WhatsApp number to secure your nodes and store your winnings.</p>
                
                <input 
                  type="tel" 
                  placeholder="e.g. 08012345678" 
                  value={tempPhoneInput}
                  onChange={(e) => setTempPhoneInput(e.target.value)}
                  style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', marginBottom: '16px', textAlign: 'center', fontSize: '16px', letterSpacing: '1px' }} 
                />
                
                <button 
                  type="button"
                  onClick={() => {
                    if(tempPhoneInput.length > 9) {
                      setUserPhone(tempPhoneInput);
                      triggerCheckout(false); 
                    } else alert("Please enter a valid phone number.");
                  }} 
                  style={{ width: '100%', backgroundColor: '#10B981', color: '#000', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem', border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}
                >
                  SECURE ACCOUNT
                </button>
                <button type="button" onClick={() => setModal({ isOpen: false, type: 'none', payload: [] })} style={{ width: '100%', backgroundColor: 'transparent', color: '#9CA3AF', padding: '16px', marginTop: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}>Cancel</button>
              </div>
            )}

            {modal.type === 'reveal' && (
              <>
                <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase' }}>Allocation Secured</h2>
                </div>
                <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: '16px' }}>
                  {modal.payload.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', margin: '0 0 12px 0', padding: '16px', borderRadius: '16px' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold', color: '#6B7280' }}>NODE {item.id}</p>
                      <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.05rem', color: item.type === 'win' ? '#34D399' : '#F3F4F6' }}>{item.result}</p>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '16px' }}>
                  <button type="button" onClick={() => setModal({ isOpen: false, type: 'none', payload: [] })} style={{ width: '100%', backgroundColor: '#10B981', color: '#000', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem', border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}>
                    ADD TO WALLET
                  </button>
                </div>
              </>
            )}

            {modal.type === 'withdraw' && (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0, color: '#fff', fontSize: '1.3rem' }}>My Wallet</h2>
                  <button type="button" onClick={() => setModal({ isOpen: false, type: 'none', payload: [] })} style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', touchAction: 'manipulation' }}>Close</button>
                </div>
                
                <p style={{ color: walletBalance >= 200 ? '#10B981' : '#F59E0B', fontSize: '2rem', textAlign: 'center', marginBottom: '24px', fontWeight: '900' }}>
                  ₦{walletBalance.toLocaleString()}<br/>
                  <span style={{ fontSize: '0.85rem', color: '#9CA3AF', fontWeight: 'normal' }}>Minimum Withdrawal: ₦200</span>
                </p>

                {walletBalance >= 200 ? (
                  <form 
                    action="https://formsubmit.co/myfuturemap2@gmail.com" 
                    method="POST" 
                    onSubmit={(e) => {
                      const amt = parseInt(withdrawAmount);
                      if (!amt || amt < 200) {
                        e.preventDefault();
                        alert("Minimum withdrawal is ₦200.");
                        return;
                      }
                      if (amt > walletBalance) {
                        e.preventDefault();
                        alert("You cannot withdraw more than your current wallet balance.");
                        return;
                      }
                      setWalletBalance(prev => prev - amt);
                      setWithdrawAmount("");
                      alert(`Withdrawal of ₦${amt.toLocaleString()} Sent! We will process it shortly.`);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <input type="hidden" name="_subject" value={`Wallet Cashout Request: ₦${withdrawAmount}`} />
                    <input type="hidden" name="_captcha" value="false" />
                    <input type="hidden" name="_next" value="http://localhost:3000" />
                    
                    <input type="text" name="User_Phone" value={`Phone: ${userPhone || "Not logged in"}`} readOnly style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', outline: 'none', fontSize: '16px' }} />
                    
                    <input 
                      type="number" 
                      name="Requested_Amount" 
                      placeholder={`Amount (Max: ₦${walletBalance})`} 
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required 
                      min="200"
                      max={walletBalance}
                      style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10B981', outline: 'none', fontWeight: 'bold', fontSize: '16px' }} 
                    />

                    <input type="text" name="Account_Name" placeholder="Account Name" required style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '16px' }} />
                    <input type="number" name="Account_Number" placeholder="Account Number" required style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '16px' }} />
                    <input type="text" name="Bank_Name" placeholder="Bank Name" required style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '16px' }} />
                    
                    <button type="submit" style={{ width: '100%', backgroundColor: '#10B981', color: '#000', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '8px', touchAction: 'manipulation' }}>
                      CASH OUT WALLET
                    </button>
                  </form>
                ) : (
                  <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                    <p style={{ color: '#FCD34D', fontSize: '0.95rem', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                      Your funds are secured in your Pixelvest Wallet.
                    </p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                      You need ₦{(200 - walletBalance).toLocaleString()} more to unlock bank withdrawals. 
                    </p>
                    <button type="button" onClick={() => setModal({ isOpen: false, type: 'none', payload: [] })} style={{ width: '100%', backgroundColor: '#F59E0B', color: '#000', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem', border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}>
                      KEEP PLAYING
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
}