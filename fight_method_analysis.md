# Analyse de la méthode `fight()`

## Nommage

Le type de retour original `Array<number|boolean>` force à accéder aux valeurs par position (`response[4]`), sans aucune indication sur ce que représente chaque index. La fonction retourne désormais un objet `FightResult` typé avec des propriétés nommées (`playerHealth`, `enemyHealth`, `enemyWeapon`, `status`).

Le paramètre `playerWeapon: any` abandonnait toute sécurité de typage (un peu le but de typescript). L'interface `Weapon` rend la forme explicite et laisse le compilateur détecter les erreurs.

## Commentaires

La fonction originale contenait des commentaires comme `// health cannot be negative` ou `// check if the game is over`. Ces commentaires décrivent ce que fait le code, ce qui devrait être évident à la lecture. Ils ont été supprimés pour avoir à la place des fonctions bien nommées : `preventNegative`, `determineStatus`.

## Taille et responsabilités

La fonction originale faisait tout à la fois : valider l'état du jeu, choisir l'arme ennemie, calculer les dégâts des deux côtés, les appliquer, empêcher la santé de passer en négatif, et déterminer le gagnant. Chacune de ces responsabilités a été extraite dans sa propre fonction :

- `pickRandomWeapon` — pioche une arme au hasard
- `calculateDamage` — calcule les dégâts d'une arme
- `netDamage` — calcule les dégâts nets entre deux combattants
- `preventNegative` — empêche la santé de passer en négatif
- `determineStatus` — détermine l'issue du combat

`fight` elle-même se résume à orchestrer ces étapes.

## Paramètres

La fonction originale prenait 6 paramètres dont 3 booleans (`hasInit`, `hasRound`, `hasFought`). Passer des booleans en paramètre est à éviter : ils impliquent un `if` à l'intérieur et obligent le lecteur à retenir ce qu'ils représentent pendant toute la lecture. Ces paramètres ont été supprimés, le contrôle du flux se fait maintenant avec un `GameStatus`.

## Switch et duplication

Le même `switch` sur le nom de l'arme était écrit deux fois dans la fonction originale, une fois pour le joueur et une fois pour l'ennemi. Toute modification d'une arme devait être appliquée à deux endroits. La logique a été extraite dans `calculateDamage`, et le `switch` remplacé par une map `weaponDamage` de type `Record<string, () => number>`. Ajouter une arme revient désormais à ajouter une seule ligne.

## Structures imbriquées

La logique principale se trouvait sous trois niveaux de `if` imbriqués (`hasInit -> hasRound -> !hasFought`). Ces conditions n'appartiennent pas à `fight()` : elles gèrent l'état du jeu, pas le combat. Elles ont été supprimées de la fonction, et le contrôle du flux a été délégué via un `GameStatus`.

## Side effect

La ligne `weaponList = weapons` modifiait une variable globale à l'intérieur de `fight`. Une fonction qui retourne une valeur ne doit pas avoir de side effect. Cette ligne a été supprimée.
