# Accorder les permissions d’administrateur technique (Device)

L’administrateur d’établissement (`ae_admin`, rôle ADMIN Kolibri) **n’a pas**
automatiquement accès à l’administration technique de l’appareil
(`deviceinfo`, `devicename`, import Device, synchronisation technique).

Ces droits sont portés par le modèle Kolibri **DevicePermissions**
(`is_superuser` et/ou `can_manage_content`), exposés dans la session via
`can_manage_content` et le kind `SUPERUSER`.

Le portail AE utilise `canAccessDeviceAdministration` (= superutilisateur **ou**
`can_manage_content` de session). Il ne transforme jamais un ADMIN d’établissement
en administrateur technique.

## Procédure (interface native, sans modification directe de la base)

1. Se connecter avec le **superadministrateur** déjà provisionné (ex. `adiawara`).
2. Ouvrir l’application **Device** (Administration de l’appareil).
3. Aller dans la gestion des **permissions** / utilisateurs de l’appareil
   (selon la version : section Permissions ou Utilisateurs de l’appareil).
4. Sélectionner le compte de test dédié à l’administration technique
   (créer un compte distinct si besoin, ex. `ae_device_admin` — **ne pas**
   convertir silencieusement `ae_admin`).
5. Accorder au minimum **Gérer le contenu de l’appareil** (`can_manage_content`).
   Pour un superutilisateur d’appareil, cocher aussi les droits superutilisateur
   Device si l’interface le propose.
6. Se déconnecter, se reconnecter avec ce compte.
7. Vérifier dans le portail AE :
   - le lien **Administration technique** est visible ;
   - Device s’ouvre sans 403 bloquant le tableau de bord AE ;
   - `ae_admin` (sans DevicePermissions) ne voit toujours **pas** ce lien.

## Comportement attendu dans le portail

| Compte | Admin établissement | Admin technique Device |
|--------|---------------------|-------------------------|
| `ae_admin` sans DevicePermissions | oui | non (pas d’erreur 403 affichée comme panne) |
| Compte avec `can_manage_content` | selon rôles | oui |
| Superutilisateur (`adiawara`) | oui | oui |

## Ne pas faire

- Modifier directement la table `devicepermissions` en SQL.
- Accorder DevicePermissions à tous les ADMIN d’établissement par défaut.
- Contourner les 403 des API Device côté backend pour les masquer comme succès.
