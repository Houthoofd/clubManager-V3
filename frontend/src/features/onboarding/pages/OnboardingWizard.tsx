import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { CheckIcon } from "@heroicons/react/24/solid";
import { BuildingOfficeIcon, UserIcon, CreditCardIcon, UsersIcon, ArrowUpTrayIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import { buttonClass, inputClass, formLabelClass, cardClass } from "@/shared/styles/designTokens";

export const OnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const navigate = useNavigate();

  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const password = useWatch({ control, name: 'adminPassword', defaultValue: '' });

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);
  
  const getStrengthColor = (level: number) => {
    if (strength === 0) return "bg-gray-200";
    if (strength <= 2) return level <= strength ? "bg-red-500" : "bg-gray-200";
    if (strength === 3) return level <= strength ? "bg-yellow-500" : "bg-gray-200";
    if (strength >= 4) return level <= strength ? "bg-brand-green" : "bg-gray-200";
    return "bg-gray-200";
  };

  const getStrengthLabel = () => {
    if (strength === 0) return "";
    if (strength <= 2) return "Faible";
    if (strength === 3) return "Moyen";
    if (strength === 4) return "Fort";
    if (strength === 5) return "Très fort";
    return "";
  };

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      startDeployment(data);
    }
  };

  const startDeployment = async (data: any) => {
    setIsDeploying(true);
    const logs = [
      "Initialisation de l'environnement isolé...",
      "Allocation des ressources serveur...",
      "Création de la base de données dédiée...",
      "Exécution du schéma SQL...",
      "Injection des données de référence...",
      "Création du compte administrateur...",
      "Déploiement terminé. Redirection..."
    ];
    
    let currentLog = 0;
    
    // Start showing fake progress while waiting for the real API
    const progressInterval = setInterval(() => {
      setDeployProgress((prev) => {
        if (prev >= 90) return 90; // Bloque à 90% tant que l'API n'a pas répondu
        return prev + 5;
      });
    }, 300);

    const logInterval = setInterval(() => {
      if (currentLog < logs.length - 1) { // Ne pas afficher le dernier log
        setDeployLogs((prev) => [...prev, `> ${logs[currentLog]}`]);
        currentLog++;
      }
    }, 800);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/onboarding/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la base de données");
      }

      // Quand l'API répond avec succès, on complète à 100%
      clearInterval(progressInterval);
      clearInterval(logInterval);
      
      setDeployProgress(100);
      setDeployLogs((prev) => [...prev, `> ${logs[logs.length - 1]}`]);

      // Redirection vers le login après 1.5s
      setTimeout(() => navigate('/login'), 1500);

    } catch (error) {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      setDeployLogs((prev) => [...prev, `> ERREUR: Impossible de finaliser le déploiement. Contactez le support.`]);
      console.error(error);
    }
  };

  const steps = [
    { id: 1, name: "Organisation", icon: BuildingOfficeIcon },
    { id: 2, name: "Admin", icon: UserIcon },
    { id: 3, name: "Membres", icon: UsersIcon },
    { id: 4, name: "Déploiement", icon: RocketLaunchIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
        <Link to="/" className="inline-block">
          <div className="flex items-center justify-center gap-2">
            <img src="/logo-icon.svg" alt="ClubManager" className="h-10 w-auto" />
            <span className="text-3xl font-bold text-brand-dark">Club<span className="text-brand-blue">Manager</span></span>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer votre espace
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className={cardClass("standard")}>
          
          {/* Stepper */}
          <nav aria-label="Progress" className="mb-14 mt-4 px-4 sm:px-10">
            <ol role="list" className="flex items-center w-full justify-between relative z-0">
              {/* Background Line */}
              <div className="absolute left-0 top-5 w-full h-[2px] bg-gray-200 -z-10" />
              
              {/* Active Line */}
              <div 
                className="absolute left-0 top-5 h-[2px] bg-brand-green -z-10 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step) => (
                <li key={step.name} className="relative flex flex-col items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white transition-all duration-500 ${
                    currentStep > step.id ? 'border border-brand-green text-brand-green' 
                    : currentStep === step.id ? 'border-2 border-brand-blue text-brand-blue shadow-sm' 
                    : 'border border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckIcon className="h-5 w-5 text-brand-green" />
                    ) : (
                      <step.icon className="h-5 w-5" strokeWidth={1.5} />
                    )}
                  </div>
                  <span className={`absolute top-14 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                    currentStep >= step.id ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-12">
            {isDeploying ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
                <div className="text-center">
                  <RocketLaunchIcon className="mx-auto h-12 w-12 text-brand-blue animate-bounce" />
                  <h3 className="mt-4 text-xl font-bold text-gray-900">Déploiement de votre espace</h3>
                  <p className="text-sm text-gray-500">Veuillez patienter pendant que nous configurons votre infrastructure dédiée...</p>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-brand-blue h-2.5 rounded-full transition-all duration-100 ease-linear" style={{ width: `${deployProgress}%` }}></div>
                </div>
                
                {/* Terminal Window */}
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto shadow-inner flex flex-col justify-end">
                  {deployLogs.map((log, i) => (
                    <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">{log}</div>
                  ))}
                  {deployProgress < 100 && (
                    <div className="animate-pulse mt-1">_</div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-lg font-medium text-gray-900">Informations du club</h3>
                    <div>
                      <label className={formLabelClass(true)}>Nom du club / association</label>
                      <input 
                        type="text" 
                        {...register("clubName", { required: true })} 
                        className={inputClass()} 
                        placeholder="Ex: Judo Club Paris"
                      />
                    </div>
                    <div>
                      <label className={formLabelClass(true)}>Numéro de téléphone</label>
                      <input 
                        type="text" 
                        {...register("clubPhone", { required: true })} 
                        className={inputClass()} 
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-lg font-medium text-gray-900">Votre compte Administrateur</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={formLabelClass(true)}>Prénom</label>
                        <input 
                          type="text" 
                          {...register("adminFirstName", { required: true })} 
                          className={inputClass()} 
                        />
                      </div>
                      <div>
                        <label className={formLabelClass(true)}>Nom</label>
                        <input 
                          type="text" 
                          {...register("adminLastName", { required: true })} 
                          className={inputClass()} 
                        />
                      </div>
                    </div>
                    <div>
                      <label className={formLabelClass(true)}>Adresse email</label>
                      <input 
                        type="email" 
                        {...register("adminEmail", { required: true })} 
                        className={inputClass()} 
                      />
                    </div>
                    <div>
                      <label className={formLabelClass(true)}>Mot de passe</label>
                      <input 
                        type="password" 
                        {...register("adminPassword", { required: true })} 
                        className={inputClass()} 
                      />
                      
                      {/* Password Strength Indicator */}
                      <div className="mt-3">
                        <div className="flex gap-1 h-1.5 mb-1.5 w-full">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div 
                              key={level} 
                              className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(level)}`} 
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">8+ caractères, majuscules, chiffres, symboles</span>
                          <span className={`font-medium ${
                            strength <= 2 ? 'text-red-500' : strength === 3 ? 'text-yellow-600' : 'text-brand-green'
                          }`}>
                            {getStrengthLabel()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-lg font-medium text-gray-900">Import des membres (Optionnel)</h3>
                    <p className="text-sm text-gray-500">
                      Gagnez du temps en important votre base de données existante (fichier CSV ou Excel). 
                    </p>
                    
                    <div className="mt-4 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10 hover:border-brand-blue transition-colors bg-white">
                      <div className="text-center">
                        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-brand-blue focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-blue focus-within:ring-offset-2 hover:text-blue-500"
                          >
                            <span>Uploader un fichier</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv, .xlsx, .xls" />
                          </label>
                          <p className="pl-1">ou glissez-déposez</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-500 mt-2">CSV, XLS, XLSX jusqu'à 10MB</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-2">
                      <button type="button" onClick={() => setCurrentStep(4)} className="text-sm font-medium text-gray-500 hover:text-brand-blue transition-colors">
                        Passer cette étape (Ajout manuel plus tard) &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-lg font-medium text-gray-900">Finalisation (1 mois offert)</h3>
                    <div className="rounded-md bg-brand-green/10 p-4 border border-brand-green/20">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CheckIcon className="h-5 w-5 text-brand-green" aria-hidden="true" />
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between">
                          <p className="text-sm text-brand-green"><strong>Offre de bienvenue activée !</strong> Votre premier mois est 100% gratuit.</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Aucune carte de crédit n'est requise aujourd'hui. Cliquez sur le bouton ci-dessous pour lancer la création de votre environnement sécurisé et isolé.
                    </p>
                  </div>
                )}

                <div className="pt-5 flex justify-between">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className={buttonClass("secondary")}
                    >
                      Précédent
                    </button>
                  ) : (
                    <div></div>
                  )}
                  
                  <button
                    type="submit"
                    className={buttonClass("primary")}
                  >
                    {currentStep === 4 ? "Lancer le déploiement gratuit" : "Étape suivante"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
