// Current formal UI regression entry point; manual-roll and palette-list UI were retired.
const {spawnSync}=require('node:child_process');
const path=require('node:path');
for(const script of ['checkPaletteArea.cjs','checkAutomaticRolls.cjs','checkDiceSelection.cjs','checkAchievementMaterials.cjs','checkCardDiceSearch.cjs','checkIconCleanup.cjs']){
 const result=spawnSync(process.execPath,[path.join(__dirname,script),...process.argv.slice(2)],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
