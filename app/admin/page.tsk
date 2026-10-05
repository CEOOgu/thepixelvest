"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Tabs: overview, withdrawals, custom-nodes
  const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals' | 'custom-nodes'>('overview');
  const [stats, setStats] = useState({ totalNodes: 0, totalWalletFunds: 0, totalUsers: 0 });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [customNodes, setCustomNodes] = useState<any[]>([]);

  // Form state for adding/editing a custom node
  const [targetNodeId, setTargetNodeId] = useState("");
  const [customPrize, setCustomPrize] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sponsorName, setSponsorName] = useState("");

  const ADMIN_SECRET = "OGU2026";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_SECRET) {
      setIsAuthenticated(true);
      fetchAdminData();
    } else {
      alert("Unauthorized Access. Invalid Passcode.");
    }
  };

  const fetchAdminData = async () => {
    setIsProcessing(true);
    try {
      const { count: nodeCount } = await supabase.from('secured_nodes').select('*', { count: 'exact', head: true });
      const { data: userData } = await supabase.from('users').select('wallet_balance');
      const totalFunds = userData?.reduce((sum, user) => sum + (user.wallet_balance || 0), 0) || 0;
      const userCount = userData?.length || 0;

      const { data: withdrawalData } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
      const { data: customData } = await supabase.from('node_overrides').select('*').order('node_id', { ascending: true });

      setStats({ totalNodes: nodeCount || 0, totalWalletFunds: totalFunds, totalUsers: userCount });
      if (withdrawalData) setWithdrawals(withdrawalData);
      if (customData) setCustomNodes(customData);

    } catch (error: any) {
      console.error("Error fetching admin data:", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCustomNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetNodeId || !customPrize) return alert("Node ID and Custom Prize are required.");
    
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('node_overrides').upsert({
        node_id: parseInt(targetNodeId),
        custom_prize: parseFloat(customPrize),
        image_url: imageUrl || null,
        sponsor_name: sponsorName || "Custom Sponsor"
      });

      if (error) throw error;

      alert(`Node #${targetConfig(targetNodeId)} successfully customized!`);
      setTargetNodeId("");
      setCustomPrize("");
      setImageUrl("");
      setSponsorName("");
      fetchAdminData();
    } catch (err: any) {
      alert("Error saving custom node: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteCustomNode = async (nodeId: number) => {
    if (!confirm(`Remove custom settings for Node #${nodeId}? It will revert to regular game rules.`)) return;
    await supabase.from('node_overrides').delete().eq('node_id', nodeId);
    fetchAdminData();
  };

  const markAsPaid = async (id: number) => {
    if (!confirm("Mark this withdrawal as PAID?")) return;
    try {
      const { error } = await supabase.from('withdrawals').update({ status: 'paid' }).eq('id', id);
      if (error) throw error;
      fetchAdminData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <main style={{ backgroundColor: '#030712', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#0F172A', padding: '40px 24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: '900' }}>Admin Command Center</h2>
          <input 
            type="password" 
            placeholder="Enter Master Passcode" 
            value={passcode} 
            onChange={(e) => setPasscode(e.target.value)} 
            style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', marginBottom: '24px', fontSize: '16px', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '4px' }} 
          />
          <button type="submit" style={{ width: '100%', backgroundColor: '#2563EB', color: '#fff', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem', border: 'none', cursor: 'pointer' }}>
            ACCESS SYSTEM
          </button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: '#030712', minHeight: '100vh', width: '100%', maxWidth: '800px', margin: '0 auto', color: '#ffffff', fontFamily: 'system-ui, sans-serif', padding: '24px 16px', boxSizing: 'border-box' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0 }}>HQ Dashboard</h1>
          <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>The Pixel Vest Control Panel</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
          Lock System
        </button>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('overview')} style={{ flex: 1, minWidth: '100px', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', backgroundColor: activeTab === 'overview' ? '#10B981' : 'rgba(255,255,255,0.05)', color: activeTab === 'overview' ? '#000' : '#9CA3AF', cursor: 'pointer' }}>Overview</button>
        <button onClick={() => setActiveTab('withdrawals')} style={{ flex: 1, minWidth: '120px', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', backgroundColor: activeTab === 'withdrawals' ? '#10B981' : 'rgba(255,255,255,0.05)', color: activeTab === 'withdrawals' ? '#000' : '#9CA3AF', cursor: 'pointer' }}>Withdrawals</button>
        <button onClick={() => setActiveTab('custom-nodes')} style={{ flex: 1, minWidth: '130px', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', backgroundColor: activeTab === 'custom-nodes' ? '#10B981' : 'rgba(255,255,255,0.05)', color: activeTab === 'custom-nodes' ? '#000' : '#9CA3AF', cursor: 'pointer' }}>Custom Nodes</button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#0F172A', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>TOTAL NODES SOLD</p>
            <p style={{ color: '#FBBF24', fontSize: '2rem', fontWeight: '900', margin: 0 }}>{stats.totalNodes}</p>
          </div>
          <div style={{ backgroundColor: '#0F172A', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>USER WALLET LIABILITY</p>
            <p style={{ color: '#10B981', fontSize: '2rem', fontWeight: '900', margin: 0 }}>₦{stats.totalWalletFunds.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* WITHDRAWALS TAB */}
      {activeTab === 'withdrawals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {withdrawals.length === 0 ? <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px' }}>No withdrawals found.</p> :
            withdrawals.map((req, idx) => (
              <div key={idx} style={{ backgroundColor: '#0F172A', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '900' }}>₦{req.amount.toLocaleString()} ({req.type})</p>
                  <p style={{ margin: '0', color: '#9CA3AF', fontSize: '0.85rem' }}>{req.account_name} - {req.bank_name} ({req.account_number})</p>
                  <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.75rem' }}>User: {req.user_phone} | Status: <strong>{req.status || 'pending'}</strong></p>
                </div>
                {req.status !== 'paid' && (
                  <button onClick={() => markAsPaid(req.id)} style={{ backgroundColor: '#10B981', color: '#000', padding: '10px 16px', borderRadius: '10px', fontWeight: '900', border: 'none', cursor: 'pointer' }}>
                    MARK AS PAID
                  </button>
                )}
              </div>
            ))
          }
        </div>
      )}

      {/* CUSTOM NODES TAB */}
      {activeTab === 'custom-nodes' && (
        <div>
          <form onSubmit={handleSaveCustomNode} style={{ backgroundColor: '#0F172A', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#FBBF24', fontSize: '1.1rem' }}>⚙️ Set Custom Node Prize & Image</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input type="number" placeholder="Node ID (e.g. 55)" value={targetNodeId} onChange={(e) => setTargetNodeId(e.target.value)} style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
              <input type="number" placeholder="Guaranteed Prize (₦)" value={customPrize} onChange={(e) => setCustomPrize(e.target.value)} style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <input type="text" placeholder="Sponsor Brand Name" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
              <input type="text" placeholder="Logo Image URL (https://...)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
            </div>
            <button type="submit" disabled={isProcessing} style={{ width: '100%', backgroundColor: '#10B981', color: '#000', padding: '16px', borderRadius: '12px', fontWeight: '900', border: 'none', cursor: 'pointer' }}>
              {isProcessing ? "SAVING..." : "SAVE CUSTOM NODE"}
            </button>
          </form>

          <h3 style={{ fontSize: '1rem', color: '#9CA3AF', marginBottom: '12px' }}>Active Custom Nodes List</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {customNodes.length === 0 ? <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No custom nodes configured yet.</p> :
              customNodes.map((node, idx) => (
                <div key={idx} style={{ backgroundColor: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {node.image_url && <img src={node.image_url} alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />}
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>Node #{node.node_id} — <span style={{ color: '#10B981' }}>₦{node.custom_prize.toLocaleString()}</span></p>
                      <p style={{ margin: '2px 0 0 0', color: '#64748B', fontSize: '0.75rem' }}>{node.sponsor_name}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteCustomNode(node.node_id)} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Delete
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      )}

    </main>
  );
}

function targetConfig(val: string) { return val; }