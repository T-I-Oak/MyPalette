const fs = require('node:fs');
const {diceListReviewFixture} = require('./diceListReviewFixture.cjs');
fs.writeFileSync('tmp_dice_list_review.html',diceListReviewFixture());
console.log('Created tmp_dice_list_review.html (page-only settings; saved settings unchanged)');
