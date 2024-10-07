import { getGameAssets } from './Assets.js';
import Item from './Item.js';

class ItemController {
  INTERVAL_MIN = 0;
  INTERVAL_MAX = 12000;

  nextInterval = null;
  items = [];

  constructor(ctx, itemImages, scaleRatio, speed) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.itemImages = itemImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;

    this.setNextItemTime();
  }

  setNextItemTime() {
    this.nextInterval = this.getRandomNumber(this.INTERVAL_MIN, this.INTERVAL_MAX);
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createItem(currentStage) {
    this.itemImages.sort((a, b) => a.id - b.id);

    let maxIndex = -1;
    const { itemUnlocks } = getGameAssets();
    for (let index = 0; index < this.itemImages.length; index++) {
      const itemUnlock = itemUnlocks.data.find(
        (unlock) => unlock.item_id === this.itemImages[index].id,
      );
      console.log(`itemUnlock.stage_id : ${itemUnlock.stage_id}, currentStage: ${currentStage}`);
      if (itemUnlock.stage_id <= currentStage) maxIndex = Math.max(maxIndex, index);
    }

    const index = this.getRandomNumber(0, maxIndex);
    const itemInfo = this.itemImages[index];
    const x = this.canvas.width * 1.5;
    const y = this.getRandomNumber(10, this.canvas.height - itemInfo.height);

    const item = new Item(
      this.ctx,
      itemInfo.id,
      x,
      y,
      itemInfo.width,
      itemInfo.height,
      itemInfo.image,
    );
    console.log(item.id);

    this.items.push(item);
  }

  update(gameSpeed, deltaTime, currentStage) {
    if (this.nextInterval <= 0) {
      this.createItem(currentStage);
      this.setNextItemTime();
    }

    this.nextInterval -= deltaTime;

    this.items.forEach((item) => {
      item.update(this.speed, gameSpeed, deltaTime, this.scaleRatio);
    });

    this.items = this.items.filter((item) => item.x > -item.width);
  }

  draw() {
    this.items.forEach((item) => item.draw());
  }

  collideWith(sprite) {
    const collidedItem = this.items.find((item) => item.collideWith(sprite));
    if (collidedItem) {
      this.ctx.clearRect(collidedItem.x, collidedItem.y, collidedItem.width, collidedItem.height);
      return {
        itemId: collidedItem.id,
      };
    }
  }

  reset() {
    this.items = [];
  }
}

export default ItemController;
