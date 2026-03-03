import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  
  const [token, setToken] = useState(tokenFromUrl);
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!token.trim()) {
      setError("Veuillez entrer un token");
      return;
    }
    
    setLoading(true);
    setError(null);
    setClaim(null);
    
    try {
      const res = await fetch(`http://localhost:8000/api/claims/track/${token}`);
      
      if (!res.ok) {
        throw new Error("Réclamation introuvable");
      }
      
      const data = await res.json();
      setClaim(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-recherche si token dans URL
  useEffect(() => {
    if (tokenFromUrl) {
      handleSearch();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navbar */}
      <nav className="bg-[#0A1628] px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <span className="text-white font-bold text-xl">
            Nouvel<span className="text-blue-400">Air</span>
          </span>
          <a 
            href="/" 
            className="text-white hover:text-blue-400 text-sm transition"
          >
            ← Nouvelle réclamation
          </a>
        </div>
      </nav>

      {/* Contenu */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        
        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0A1628] mb-2">
            🔍 Suivre ma réclamation
          </h1>
          <p className="text-gray-600">
            Entrez votre numéro de suivi pour consulter l'état
          </p>
        </div>

        {/* Boîte de recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ex: 89994b0e7dd754c20d645adc1e7b214e"
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "⏳" : "Rechercher"}
            </button>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-3xl">❌</span>
              <div>
                <p className="text-red-800 font-semibold text-lg">{error}</p>
                <p className="text-red-600 text-sm mt-1">
                  Vérifiez votre numéro de suivi et réessayez.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Résultat */}
        {claim && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            
            {/* En-tête */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 px-6 py-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-white text-xl font-bold">
                  📋 Réclamation #{claim.public_token.substring(0, 12)}...
                </h2>
                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                  claim.statut === 'NOUVELLE' ? 'bg-blue-100 text-blue-800' :
                  claim.statut === 'EN_COURS' ? 'bg-yellow-100 text-yellow-800' :
                  claim.statut === 'TRAITEE' ? 'bg-green-100 text-green-800' :
                  claim.statut === 'FERMEE' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {claim.statut === 'NOUVELLE' ? '🆕 Nouvelle' :
                   claim.statut === 'EN_COURS' ? '⏳ En cours' :
                   claim.statut === 'TRAITEE' ? '✅ Traitée' :
                   claim.statut === 'FERMEE' ? '🔒 Fermée' :
                   claim.statut}
                </span>
              </div>
            </div>

            {/* Corps */}
            <div className="p-6">
              
              {/* Détails */}
              <div className="space-y-4 mb-6">
                
                {claim.category && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium flex items-center gap-2">
                      <span>📂</span> Catégorie
                    </span>
                    <span className="font-semibold text-[#0A1628] bg-blue-50 px-4 py-2 rounded-lg">
                      {claim.category === 'services_aeroportuaires' ? 'Services aéroportuaires' :
                       claim.category === 'bagages' ? 'Bagages et bagages à main' :
                       claim.category === 'irregularites_vol' ? 'Irrégularités de vol' :
                       claim.category === 'services_vol' ? 'Services en vol' :
                       claim.category === 'reservation_billetterie' ? 'Réservation et Billetterie' :
                       claim.category === 'besoins_speciaux' ? 'Besoins spéciaux' :
                       claim.category}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <span>📅</span> Date de soumission
                  </span>
                  <span className="font-semibold text-[#0A1628]">
                    {new Date(claim.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
               
              </div>

              {/* Réponse si disponible */}
              {claim.reponse ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">✅</span>
                    <h3 className="font-bold text-green-800 text-lg">
                      Réponse de NouvelAir
                    </h3>
                  </div>
                  <p className="text-green-900 leading-relaxed whitespace-pre-wrap">
                    {claim.reponse}
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">⏳</span>
                    <div>
                      <h3 className="font-bold text-blue-800 mb-2 text-lg">
                        Réclamation en cours de traitement
                      </h3>
                      <p className="text-blue-700 text-sm leading-relaxed mb-3">
                        Notre équipe analyse votre réclamation. Vous recevrez une réponse 
                        par email le plus tot possible.
                      </p>
                      <div className="bg-white/50 rounded-lg p-3 text-xs text-blue-600">
                        💡 <strong>Conseil :</strong> Conservez votre numéro de suivi pour 
                        consulter l'état à tout moment.
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Message d'aide */}
        {!claim && !error && !loading && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="text-center">
              <span className="text-4xl mb-3 block">💡</span>
              <p className="text-blue-800 font-semibold mb-2 text-lg">
                Où trouver mon numéro de suivi ?
              </p>
              <p className="text-blue-700 text-sm leading-relaxed">
                Votre numéro de suivi vous a été envoyé par email juste après 
                avoir soumis votre réclamation.<br/>
                Vérifiez également vos <strong>spams</strong> si vous ne le trouvez pas.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}