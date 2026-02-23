import heroImg from "../assets/avion.jpg";
import { useState } from "react";

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
  const [completed, setCompleted] = useState({
    vol: false,
    reclamation: false,
  });
  const [formData, setFormData] = useState({
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
    data.append("departure_airport", formData.departure_airport);
    data.append("arrival_airport", formData.arrival_airport);
    data.append("departure_time", formData.departure_time);

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

        // Réinitialiser le formulaire (SÉCURITÉ)
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
        alert(`❌ Erreur : ${JSON.stringify(result.detail, null, 2)}`);
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
      alert("❌ Erreur lors de la soumission");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR - RESPONSIVE */}
      <nav className="bg-[#0A1628] px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50">
        <span className="text-white font-bold text-lg sm:text-xl">
          Nouvel<span className="text-blue-400">Air</span>
        </span>
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

      {/* HERO - RESPONSIVE */}
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
            Notre IA analyse votre carte d'embarquement et pré-remplit le
            formulaire automatiquement.
          </p>
        </div>
      </div>

      {/* FORM - RESPONSIVE */}
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

        {/* UPLOAD BOARDING PASS - RESPONSIVE */}
        {liéAuVol === true && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
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
            <div className="p-4 sm:p-6 md:p-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 sm:mb-6">
                Extraction automatique
              </div>
              <label className="block border-2 border-dashed border-blue-200 rounded-2xl p-6 sm:p-8 md:p-12 text-center bg-blue-50 cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-all">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-4 shadow-md">
                  📸
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#0A1628] mb-2">
                  {file
                    ? ` ${file.name}`
                    : "Glissez votre carte d'embarquement ici"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  JPG, PNG, PDF — Max 10MB
                </p>
                <span className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold">
                  📁 Choisir un fichier
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        )}

        {/* INFOS VOL - RESPONSIVE */}
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
                  placeholder: "Ex: TUNBJ12345",
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

        {/* RÉCLAMATION - RESPONSIVE */}
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

              {/* TÉLÉPHONE */}
              <div className="col-span-1 sm:col-span-2">
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

        {/* SUBMIT - RESPONSIVE */}
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
                Après soumission, vous recevrez un{" "}
                <span className="font-semibold text-[#0A1628]">
                  token unique
                </span>{" "}
                par email pour suivre l'état de votre réclamation en temps réel.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
