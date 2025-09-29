# GEMINI.md

This file provides guidance when working with code in this repository.

## Contexte

Ce document présente le cahier des charges général du front de l'application Let-me-count.
Let-me-count est une application web pour la gestion des comptes entre amis.

## KISS

- This repository is a small personnal project for a side project.
- Don't bother with complexity, it's a simple project.
- KISS is the key.
- Don't hesitate to ask for more details if needed.

## DRY

- Don't repeat yourself, but don't over-engineer.
- If you find yourself repeating code, consider creating a service or a trait.
- Keep the codebase clean and maintainable.
- Avoid unnecessary complexity.

## Language, Framework & tools

- **Vue**: 3.5+
- **TypeScript**

## Code quality tools

- `npm run lint`: Lint JavaScript/TypeScript files
- `npm run type-check`: More strict type checking (before deploying to production)

## Ressources utiles

- [Documentation technique du projet](doc-technique.md)
- [Documentation de l'API](openapi.json)
- Charte graphique sur la page [/style-guide](src/views/StyleGuideView.vue)

## Git

- Les commits ne doivent inclure que les fichiers modifiés par la tâche en cours, ignorer les autres fichiers modifiés par quelque chose d'autre.
- Les messages de commits doivent être concis et en français.
- Les messages de commits doivent commencer par le picto 🤖 et garder un message concernant les modifications seulement.
- Wait for my feedback before committing.
- DON'T YOU DARE TO COMMIT YOUR WITHOUT MY VALIDATION
- USER'S SILENCE DOES NOT MEAN APPROVAL, WAIT FOR MY FEEDBACK
- 
