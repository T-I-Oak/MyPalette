const fs = require('node:fs');
const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));
for (const card of settings.cards) for (const step of card.steps) { step.playEffects=[]; step.achievementEffects=[]; }
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
const html = `
            <body class="theme-atelier texture-layout"><style>.ReviewVersion{position:fixed;right:4px;top:4px;z-index:5;background:#fff;padding:2px 6px;color:#394b47;pointer-events:none}</style><output class="ReviewVersion">v${version}</output><main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle" type="button"></button></main>
            <script type="module">
            import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
            import {createLayoutPresentation} from './src/game/layoutPresentation.js';
            import {mountGame} from './src/game/view.js';
            import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';
            import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
            Math.random=()=>.4;
            const root=document.querySelector('main');
            const screen=createLayoutScreen(root,document.querySelector('button'));
            const presentation=createLayoutPresentation(screen);
            const settings=${JSON.stringify(settings)};
            window.rerollCheck={screen,...mountGame(root,settings,presentation)};
            const game=window.rerollCheck.session.game,complete=game.completeRoll.bind(game);
            let configured=false;
            game.completeRoll=(...args)=>{complete(...args);if(!configured&&game.state.phase==='play'){
                const die=game.state.dice.find(d=>!d.faces[d.current].special),face=die.faces[die.current];
                for(const card of Object.values(game.definitions))for(const step of card.steps)step.goals=[{color:face.color,material:face.material}];configured=true;
            }};
            </script>`;
fs.writeFileSync('tmp_reroll_review.html', '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+html);
console.log('Created tmp_reroll_review.html (review fixture only)');
