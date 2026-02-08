import React, { useState } from 'react';
import { Copy, Zap, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 

const PaymentView = ({ lastOrder, isDarkMode, theme, setView, copyToClipboard, setToast }) => {
  const [refNumber, setRefNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const PAYMENT_DETAILS = {
    mvola: {
      number: "038 74 226 37",
      cleanNumber: "0387422637",
      name: "JEAN CHARLES",
      color: "text-green-600",
      bg: "bg-green-600/10",
      border: "border-green-600/20",
      btnBg: "bg-green-600 hover:bg-green-700"
    },
    orange: {
      number: "037 33 073 23",
      cleanNumber: "0373307323",
      name: "FANILONIAINA CHRISTIAN",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      btnBg: "bg-orange-500 hover:bg-orange-600"
    },
    airtel: {
      number: "033 24 322 07",
      cleanNumber: "0332432207",
      name: "FANILONIAINA CHRISTIAN",
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      btnBg: "bg-red-500 hover:bg-red-600"
    }
  };

  const method = lastOrder?.paymentMethod || 'mvola';
  const details = PAYMENT_DETAILS[method] || PAYMENT_DETAILS.mvola;
  const amount = lastOrder?.totalPrice || 0;

  let ussdLink = "#";
  if (method === 'mvola') {
    ussdLink = `tel:*111*1*2*${details.cleanNumber}*${amount}*2*0*%23`;
  } else if (method === 'orange') {
    ussdLink = `tel:%23144*1*1*${details.cleanNumber}*${details.cleanNumber}*${amount}*2%23`;
  } else if (method === 'airtel') {
    ussdLink = `tel:*436*2*1*${details.cleanNumber}%23`;
  }

  // --- DYNAMIC PLACEHOLDER LOGIC ---
  let refPlaceholder = "Transaction Reference";
  if (method === 'mvola') refPlaceholder = "Ex : Ref: 5443017XX";
  else if (method === 'airtel') refPlaceholder = "Ex : ID: 260202.1712.E09XXX";
  else if (method === 'orange') refPlaceholder = "Ex : Trans ID: PP260203.1824.C73893";

  const handleSubmitProof = async () => {
    if (!refNumber) return setToast({message: "Enter Reference", type: 'error'});
    setIsUploading(true);
    try {
      await updateDoc(doc(db, "orders", lastOrder.id), { 
        proofType: 'ref', proofValue: refNumber, status: 'pending_review', createdAt: serverTimestamp()
      });
      localStorage.removeItem('ff_pending_order');
      setView('finish');
    } catch (error) { setToast({ message: "Update failed", type: "error" }); } finally { setIsUploading(false); }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${theme.bg}`}>
      <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl ${theme.card}`}>
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-black ${theme.text}`}>Paiement Requis</h2>
          <p className={theme.subText}>Finalisez votre paiement pour recevoir vos diamants.</p>
        </div>

        <div className={`${details.bg} p-4 rounded-xl mb-6 border ${details.border}`}>
           <div className="flex justify-between text-sm mb-2">
              <span className={theme.subText}>Montant à payer :</span>
              <span className={`font-black text-xl ${theme.text}`}>{amount.toLocaleString()} Ar</span>
           </div>
           <div className="flex justify-between text-sm">
              <span className={theme.subText}>Via :</span>
              <span className={`font-black uppercase ${details.color}`}>{method}</span>
           </div>
        </div>

        <div className="space-y-5">
           <div>
              <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${theme.subText}`}>1. Envoyer l'argent :</label>
              
              <a 
                href={ussdLink}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 mb-3 transition-transform active:scale-95 ${details.btnBg}`}
              >
                <Zap size={20} className="fill-white" />
                <span>Envoyer Maintenant (USSD)</span>
              </a>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3 mb-4">
                <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-yellow-800 leading-relaxed">
                  <strong>Important :</strong> Vérifiez bien que le nom affiché est <strong className="uppercase">{details.name}</strong> avant de valider le transfert.
                </p>
              </div>

              <div className="text-center mb-4">
                <span className={`text-xs bg-gray-100 px-2 py-1 rounded text-gray-500`}>ou manuellement vers le :</span>
              </div>

              <div className={`flex justify-between items-center p-3 rounded-xl border mb-2 relative overflow-hidden ${theme.input}`}>
                 <span className="font-mono font-bold text-xl tracking-wider">{details.number}</span>
                 <button onClick={() => copyToClipboard(details.number)} className={`p-2 rounded-lg hover:bg-gray-200/20 ${details.color}`}>
                   <Copy size={18} />
                 </button>
              </div>

              <div className={`flex items-center gap-2 text-xs font-bold px-2 ${theme.subText}`}>
                 <div className={`w-2 h-2 rounded-full ${details.color.replace('text', 'bg')}`}></div>
                 Nom : <span className={theme.text}>{details.name}</span>
              </div>
           </div>

           <div className={`w-full h-px ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}></div>

           <div>
              <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${theme.subText}`}>2. Entrez le numéro de référence :</label>
              
              <input 
                type="text" 
                placeholder={refPlaceholder}
                className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg ${theme.input}`}
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
              />
           </div>

           <button 
             onClick={handleSubmitProof} 
             disabled={isUploading}
             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
           >
             {isUploading ? <Loader2 className="animate-spin"/> : <>Confirmer le Paiement <CheckCircle2 size={18}/></>}
           </button>
           
           <button 
             onClick={() => setView('games')} 
             className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2 font-medium"
           >
             Annuler la commande
           </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentView;