# 💹 Trading-IA — Apprentissage Automatisé pour le Forex

Ce projet open source vise à créer une **application IA de trading automatisé** pour le marché du Forex (EUR/USD notamment), en combinant :

- 📊 Analyse MWD (Monthly, Weekly, Daily)
- 🧠 Agents GPT-4 spécialisés et entraînés en boucle continue
- 🔁 Boucle de feedback via n8n + Supabase + OpenAI API
- 🧾 Journalisation complète des résultats : win rate, Sharpe ratio, RR, TP/SL...

## ⚙️ Technologies utilisées

- **Supabase** : base de données, auth, fonctions Edge & Realtime
- **n8n** : automatisation, évaluation des runs, feedback IA
- **OpenAI GPT-4 Turbo** : agents d’analyse et d’optimisation
- **React + Tailwind** (Lovable) : interface web
- **Codex** (OpenAI) : génération automatique de composants front personnalisés

## 🎯 Fonctionnalités clés

- 🔁 Boucle d’apprentissage IA sur données MWD
- 📈 Tableau des backtests avec indicateurs clés
- 🏆 Carte IA du meilleur run détecté (is_best_run)
- 🧠 Synthèse IA avec recommandations stratégiques
- ⚠️ Journal des erreurs & TP/SL manqués
- 🚀 Lancement manuel ou automatique de sessions
- 📡 Affichage temps réel (Supabase Realtime)

## 🗂 Structure du dépôt


