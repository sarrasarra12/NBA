import { Link } from "react-router-dom";
import heroImg from "../assets/avion.jpg";
import { useState, useRef } from "react";
import logoImg from "../assets/images.png";
const countries = [
  { code: "+216", flag: "🇹🇳", name: "Tunisie" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+49", flag: "🇩🇪", name: "Allemagne" },
  { code: "+39", flag: "🇮🇹", name: "Italie" },
  { code: "+34", flag: "🇪🇸", name: "Espagne" },
  { code: "+32", flag: "🇧🇪", name: "Belgique" },
  { code: "+41", flag: "🇨🇭", name: "Suisse" },
  { code: "+44", flag: "🇬🇧", name: "Royaume-Uni" },
  { code: "+31", flag: "🇳🇱", name: "Pays-Bas" },
  { code: "+212", flag: "🇲🇦", name: "Maroc" },
  { code: "+213", flag: "🇩🇿", name: "Algérie" },
  { code: "+218", flag: "🇱🇾", name: "Libye" },
];
const categories = [
  { value: "services_aeroportuaires", label: "Services aéroportuaires" },
  { value: "bagages", label: "Bagages et bagages à main" },
  { value: "irregularites_vol", label: "Irrégularités de vol" },
  { value: "services_vol", label: "Services en vol" },
  { value: "reservation_billetterie", label: "Réservation et Billetterie" },
  { value: "besoins_speciaux", label: "Besoins spéciaux" },
];

const contactTypes = [
  { value: "passager", label: "Passager" },
  { value: "avocat", label: "Avocat" },
  { value: "association", label: "Association" },
  { value: "agence", label: "Agence de voyage" },
];

export default function ClaimPage() {
  const [file, setFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [typeContact, setTypeContact] = useState("");
  const [liéAuVol, setLiéAuVol] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [completed, setCompleted] = useState({
    vol: false,
    reclamation: false,
  });
  const [formData, setFormData] = useState({
    passenger_name: "",
    email: "",
    telephone: "",
    category:"",
    description: "",
    flight_number: "",
    departure_airport: "",
    arrival_airport: "",
    departure_time: "",
    pir_ref: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAttachments = (e) => {
    const newFiles = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // ========================================
  // FONCTIONS CAMÉRA
  // ========================================

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Erreur caméra:', err);
      alert(" Impossible d'accéder à la caméra");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const capturedFile = new File([blob], "carte-embarquement.jpg", { 
        type: "image/jpeg" 
      });
      setFile(capturedFile);
      
      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
      setShowCamera(false);
    }, "image/jpeg", 0.95);
  };

  const closeCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  // ========================================
  // FIN FONCTIONS CAMÉRA
  // ========================================

  const checkVolCompleted = () => {
    if (
      formData.flight_number &&
      formData.departure_time &&
      formData.departure_airport &&
      formData.arrival_airport
    ) {
      setCompleted((prev) => ({ ...prev, vol: true }));
    } else {
      setCompleted((prev) => ({ ...prev, vol: false }));
    }
  };

  const checkReclamationCompleted = () => {
    if (
      formData.passenger_name &&
      formData.email &&
      formData.telephone &&
      formData.description &&
      typeContact
    ) {
      setCompleted((prev) => ({ ...prev, reclamation: true }));
    } else {
      setCompleted((prev) => ({ ...prev, reclamation: false }));
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("passenger_name", formData.passenger_name);
    data.append("email", formData.email);
    data.append("telephone", `${selectedCountry.code} ${formData.telephone}`);
    data.append("description", formData.description);
    data.append("flight_number", formData.flight_number);
    data.append("category", formData.category); 
    data.append("departure_airport", formData.departure_airport);
    data.append("arrival_airport", formData.arrival_airport);
    data.append("departure_time", formData.departure_time);
    if (formData.pir_ref) {
      data.append('pir_reference', formData.pir_ref);
    }
    data.append('type_contact', typeContact);

    if (file) {
      data.append("boarding_pass", file);
    }

    if (attachments && attachments.length > 0) {
      attachments.forEach((attachment) => {
        data.append("pieces", attachment);
      });
    }

    try {
      const res = await fetch("http://localhost:8000/api/claims/", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        alert(`✅ Réclamation créée !\nToken : ${result.public_token}`);
        console.log("Succès:", result);

        setFormData({
          passenger_name: "",
          email: "",
          telephone: "",
          description: "",
          flight_number: "",
          departure_airport: "",
          arrival_airport: "",
          departure_time: "",
          pir_ref: "",
        });
        setFile(null);
        setAttachments([]);
        setLiéAuVol(null);
        setTypeContact("");
        setCompleted({ vol: false, reclamation: false });
      } else {
        console.error("Erreur backend:", result);
        alert(` Erreur : ${JSON.stringify(result.detail, null, 2)}`);
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
      alert(" Erreur lors de la soumission");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-[#0A1628] px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src={logoImg}alt="logo nouvelAir" className="h-8 w-auto sm:h-10"/>
        <span className="text-white font-bold text-lg sm:text-xl">
          Nouvel<span className="text-blue-400">Air</span>
        </span>
        </div>
        <div className="flex gap-2 sm:gap-4">
          {["FR", "العربية", "EN"].map((lang) => (
            <button
              key={lang}
              className="text-gray-400 hover:text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              {lang}
            </button>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <div className="relative bg-[#0A1628] px-4 sm:px-6 md:px-10 py-10 md:py-14 overflow-hidden">
        <img
          src={heroImg}
          alt="Avion"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 max-w-lg">
          <span className="inline-block bg-white/10 text-blue-300 text-xs font-bold uppercase tracking-widest px-3 sm:px-4 py-1.5 rounded-full mb-4">
            ✈ Réclamations en ligne
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
            Déposer une <span className="text-blue-400">réclamation</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Bénéficiez d'un pré-remplissage du formulaire en scannant votre carte d'embarquement
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 md:py-10 space-y-4 sm:space-y-6">
        
     {/* QUESTION OUI/NON */}
<div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4 sm:p-6">
  <p className="text-sm font-bold text-[#0A1628] mb-4">
    Votre réclamation est-elle liée à un vol particulier ?
  </p>
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
    {[
      { value: true, label: "Oui" },
      { value: false, label: "Non" },
    ].map((option) => (
      <button
        key={String(option.value)}
        type="button"
        onClick={() => setLiéAuVol(option.value)}
        className={`flex items-center justify-center sm:justify-start gap-2 px-6 py-3 rounded-xl border-2 font-semibold text-sm transition-all
          ${
            liéAuVol === option.value
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-gray-200 text-gray-500 hover:border-blue-300"
          }`}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
          ${liéAuVol === option.value ? "border-blue-500" : "border-gray-300"}`}
        >
          {liéAuVol === option.value && (
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          )}
        </div>
        {option.label}
      </button>
    ))}
  </div>
</div>

{/* ✅ SECTION SUIVRE UNE RÉCLAMATION */}
<div className=" bg-gradient-to-br from-blue-200 to-blue-200 rounded-2xl shadow-xl p-6 text-blue-700 hover:shadow-2xl transition-all">
  
  {/* Version Desktop */}
  <div className="hidden sm:flex items-center justify-between gap-6">
    <div className="flex items-center gap-4">
      <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
        <span className="text-4xl">🔍</span>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-1">
          Réclamation déjà déposée ?
        </h3>
        <p className="text-sm text-blue-900">
          Suivez l'état de votre réclamation 
        </p>
      </div>
    </div>
    <Link
      to="/suivi"
      className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 hover:scale-105 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
    >
      <span>Suivre ma réclamation</span>
      <span className="text-xl">→</span>
    </Link>
  </div>

  {/* Version Mobile */}
  <div className="sm:hidden text-center">
    <div className="flex justify-center mb-4">
      <div className="bg-white/20 backdrop-blur-sm p- rounded-2xl inline-block">
        <span className="text-4xl">🔍</span>
      </div>
    </div>
    <h3 className="text-lg font-bold mb-2">
      Réclamation déjà déposée ?
    </h3>
    <p className="text-sm text-blue-100 mb-4">
      Suivez son état en temps réel
    </p>
    <Link
      to="/suivi"
      className="bg-white text-blue-200 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg inline-flex items-center gap-2"
    >
      <span>Suivre ma réclamation</span>
      <span className="text-xl">→</span>
    </Link>
  </div>
  
</div>
        
        {/* ========================================
            SECTION CARTE D'EMBARQUEMENT
            ======================================== */}
        {liéAuVol === true && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
            
            {/* EN-TÊTE */}
            <div className="bg-blue-50 px-4 sm:px-6 md:px-8 py-4 md:py-5 border-b border-gray-200 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-600 rounded-xl flex items-center justify-center text-lg sm:text-xl">
                📋
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0A1628]">
                  Carte d'embarquement
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  L'IA extrait les infos automatiquement
                </p>
              </div>
            </div>
            
            {/* CORPS */}
            <div className="p-4 sm:p-6 md:p-8">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 sm:mb-6">
                🤖 Extraction automatique
              </div>

              {/* Si pas de fichier : afficher les boutons */}
              {!file ? (
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* BOUTON UPLOADER */}
                  <label className="block border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center bg-blue-50 cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-all">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-md">
                      📁
                    </div>
                    <h3 className="text-sm font-bold text-[#0A1628] mb-1">
                      Importer
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Fichier existant
                    </p>
                    <span className="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold">
                      Choisir
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.pdf" 
                      onChange={handleFileChange} 
                    />
                  </label>
                  
                  {/* BOUTON SCANNER */}
                  <button
                    type="button"
                    onClick={openCamera}
                    className="block border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center bg-blue-50 cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-all"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-md">
                      📸
                    </div>
                    <h3 className="text-sm font-bold text-[#0A1628] mb-1">
                      Scanner
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Avec caméra
                    </p>
                    <span className="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold">
                      Ouvrir
                    </span>
                  </button>
                </div>
              ) : (
                /* Fichier sélectionné */
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <div>
                        <div className="font-semibold text-green-900">
                          {file.name}
                        </div>
                        <div className="text-xs text-green-700">
                          {(file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFile(null)} 
                      className="text-red-600 hover:text-red-800 font-bold text-lg"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================
                MODAL CAMÉRA
                ======================================== */}
            {showCamera && (
              <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
                  
                  {/* En-tête modal */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white text-xl font-bold">
                      📷 Scanner la carte d'embarquement
                    </h3>
                    <button
                      onClick={closeCamera}
                      className="text-white hover:text-gray-200 text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Corps modal */}
                  <div className="p-6">
                    
                    {/* Instructions */}
                    <div className="mb-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <div className="text-sm text-blue-800">
                        <div className="font-semibold mb-1">💡 Instructions :</div>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Placez la carte bien visible devant la caméra</li>
                          <li>Assurez-vous d'avoir un bon éclairage</li>
                          <li>Évitez les reflets et ombres</li>
                          <li>Cliquez "Capturer" quand vous êtes prêt</li>
                        </ul>
                      </div>
                    </div>

                    {/* Flux vidéo */}
                    <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-auto"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                      />
                      
                      {/* Overlay de guidage */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div 
                          className="border-4 border-white border-dashed rounded-lg opacity-50"
                          style={{ width: '80%', height: '60%' }}
                        />
                      </div>
                    </div>

                    {/* Canvas caché pour capture */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Boutons d'action */}
                    <div className="flex gap-3">
                      <button
                        onClick={closeCamera}
                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={capturePhoto}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
                      >
                        📸 Capturer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INFOS VOL */}
        {liéAuVol === true && (
          <div
            className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${completed.vol ? "border-green-400" : "border-gray-200"}`}
          >
            <div className="bg-blue-50 px-4 sm:px-6 md:px-8 py-4 md:py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-600 rounded-xl flex items-center justify-center text-lg sm:text-xl">
                    ✈️
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#0A1628]">
                      Informations du vol
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Vérifiez les informations extraites
                    </p>
                  </div>
                </div>
                {completed.vol && (
                  <span className="text-green-500 font-bold text-xs sm:text-sm">
                    ✓ Complété
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {[
                {
                  label: "Numéro de vol",
                  name: "flight_number",
                  placeholder: "Ex: BJ509",
                  required: true,
                },
                {
                  label: "Date du vol",
                  name: "departure_time",
                  type: "date",
                  required: true,
                },
                {
                  label: "Aéroport de départ",
                  name: "departure_airport",
                  placeholder: "Ex: CDG",
                  required: true,
                },
                {
                  label: "Aéroport d'arrivée",
                  name: "arrival_airport",
                  placeholder: "Ex: DJE",
                  required: true,
                },
                {
                  label: "Réf PIR",
                  name: "pir_ref",
                  placeholder: "Ex: ",
                  required: false,
                },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wide mb-2">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onBlur={checkVolCompleted}
                    placeholder={field.placeholder}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RÉCLAMATION */}
        {liéAuVol !== null && (
          <div
            className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${completed.reclamation ? "border-green-400" : "border-gray-200"}`}
          >
            <div className="bg-blue-50 px-4 sm:px-6 md:px-8 py-4 md:py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-600 rounded-xl flex items-center justify-center text-lg sm:text-xl">
                    📝
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#0A1628]">
                      Votre réclamation
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Identifiez-vous et décrivez votre problème
                    </p>
                  </div>
                </div>
                {completed.reclamation && (
                  <span className="text-green-500 font-bold text-xs sm:text-sm">
                    ✓ Complété
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              
              {/* TYPE DE CONTACT */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wide mb-2">
                  Vous êtes <span className="text-red-500">*</span>
                </label>
                <select
                  value={typeContact}
                  onChange={(e) => {
                    setTypeContact(e.target.value);
                    setTimeout(checkReclamationCompleted, 0);
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                >
                  <option value="">Sélectionner...</option>
                  {contactTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* NOM + EMAIL */}
              {[
                {
                  label: "Nom complet",
                  name: "passenger_name",
                  placeholder: "Votre nom et prénom",
                },
                {
                  label: "Email",
                  name: "email",
                  placeholder: "votre@email.com",
                  type: "email",
                },
              ].map((field) => (
                <div key={field.name} className="col-span-1">
                  <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wide mb-2">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onBlur={checkReclamationCompleted}
                    placeholder={field.placeholder}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>
              ))}

              {/* TÉLÉPHONE + CATÉGORIE (côte à côte) */}
<div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
  
              {/* TÉLÉPHONE */}
              <div>
                <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wide mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                  <select
                    value={selectedCountry.code}
                    onChange={(e) =>
                      setSelectedCountry(
                        countries.find((c) => c.code === e.target.value),
                      )
                    }
                    className="bg-gray-50 border-r-2 border-gray-200 px-2 sm:px-3 py-3 text-xs sm:text-sm font-semibold outline-none cursor-pointer"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    onBlur={checkReclamationCompleted}
                    placeholder="XX XXX XXX"
                    className="flex-1 px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* CATÉGORIE */}
              <div>
                <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wide mb-2">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onBlur={checkReclamationCompleted}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                >
                  <option value="">Sélectionner une catégorie...</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

              {/* DESCRIPTION */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wide mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={checkReclamationCompleted}
                  placeholder="Décrivez votre problème en détail..."
                  rows={4}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all resize-none"
                />
              </div>

              {/* PIÈCES JOINTES */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wide mb-3">
                  Pièces jointes{" "}
                  <span className="text-gray-400 font-normal normal-case">
                    (optionnel)
                  </span>
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 sm:p-6 bg-gray-50">
                  {attachments.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {attachments.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5"
                        >
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#0A1628] overflow-hidden">
                            <span>📎</span>
                            <span className="font-medium truncate">
                              {f.name}
                            </span>
                            <span className="text-gray-400 text-xs hidden sm:inline">
                              ({(f.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <button
                            onClick={() => removeAttachment(i)}
                            className="text-red-400 hover:text-red-600 font-bold text-lg transition-colors ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 cursor-pointer">
                    <span className="inline-flex items-center gap-2 border-2 border-blue-200 text-blue-600 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-50 transition-all">
                      📎 Ajouter un fichier
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      onChange={handleAttachments}
                    />
                  </label>
                  <p className="text-center text-xs text-gray-400 mt-2">
                    JPG, PNG, PDF, DOC — Max 10MB par fichier
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBMIT */}
        {liéAuVol !== null && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between mb-4 sm:mb-5">
              <button
                type="button"
                className="border-2 border-gray-200 text-gray-500 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm hover:border-red-300 hover:text-red-500 transition-all order-2 sm:order-1"
              >
                ✕ Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-[#0A1628] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all order-1 sm:order-2"
              >
                Soumettre la réclamation →
              </button>
            </div>
            <div className="text-center border-t border-gray-100 pt-4">
              <p className="text-xs sm:text-sm text-gray-500">
                Après soumission, vous recevrez{" "}
                <span className="font-semibold text-[#0A1628]">
                  un email
                </span>{" "}
                et vous pourrez suivre l'état de votre réclamation .
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
