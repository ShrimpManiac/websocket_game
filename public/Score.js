import { sendEvent } from './Socket.js';
import { findAssetDataById, getNextAsset } from './Assets.js';
import { ASSET_TYPE } from './Constants.js';

class Score {
  currentStage = 1000;
  scorePerSecond = 1;
  currentScore = 0;
  requiredScore = 10;

  HIGH_SCORE_KEY = 'highScore';
  stageChange = true;

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  update(deltaTime) {
    this.currentScore += (deltaTime / 1000) * this.scorePerSecond;
    // 필요점수에 도달시 서버에 메세지 전송
    if (Math.floor(this.currentScore) >= this.requiredScore) {
      // this.stageChange = false;
      const nextStage = getNextAsset(ASSET_TYPE.STAGE, this.currentStage);
      const nextNextStage = getNextAsset(ASSET_TYPE.STAGE, nextStage.id);
      sendEvent(11, {
        currentStage: this.currentStage,
        targetStage: nextStage.id,
        score: this.currentScore,
      });

      this.currentStage = nextStage.id;
      this.scorePerSecond = nextStage.scorePerSecond;
      this.requiredScore = nextNextStage.score;
    }
  }

  getItem(itemId) {
    console.log(`itemId : ${itemId}`);
    const item = findAssetDataById(ASSET_TYPE.ITEM, itemId);
    this.currentScore += item.score * this.scorePerSecond;
  }

  reset() {
    this.stage = 1000;
    this.scorePerSecond = 1;
    this.currentScore = 0;
    this.requiredScore = 10;
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.currentScore > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.currentScore));
    }
  }

  getScore() {
    return this.currentScore;
  }

  getStage() {
    return this.currentStage;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.currentScore).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;
