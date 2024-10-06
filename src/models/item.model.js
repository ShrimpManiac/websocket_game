import { ASSET_TYPE } from '../constants.js';
import { findAssetDataById, getGameAssets, getNextAsset } from '../init/assets.js';
import { getStage } from './stage.model.js';

// key: uuid, value: array
// items[uuid] = { nextUnlock: itemUnlockID, unlockedItems: [{ itemId, score, count }] }
const items = {};

// 초기화
export const createItems = (uuid) => {
  items[uuid] = { nextUnlock: getGameAssets().itemUnlocks.data[0].id, unlockedItems: [] };
};

export const getItems = (uuid) => {
  return items[uuid];
};

export const unlockItems = (uuid) => {
  const currentStages = getStage(uuid);
  // 오름차순 -> 가장 큰 스테이지 ID를 확인 <- 유저의 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  const { item_id: itemId, stage_id: unlockStage } = findAssetDataById(
    ASSET_TYPE.ITEM_UNLOCK,
    items[uuid].nextUnlock,
  );
  const { score } = findAssetDataById(ASSET_TYPE.ITEM, itemId);

  if (currentStage === unlockStage) {
    items[uuid].unlockedItems.push({ itemId, score, count: 0 });
    items[uuid].nextUnlock = getNextAsset(ASSET_TYPE.ITEM_UNLOCK, items[uuid].nextUnlock).id;
  }
};

export const clearItems = (uuid) => {
  return (items[uuid] = []);
};
