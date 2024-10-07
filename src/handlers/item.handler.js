import { getItems } from '../models/item.model.js';
import { findAssetDataById } from '../init/assets.js';
import { ASSET_TYPE } from '../constants.js';

// 아이템을 획득했을 떄 카운트를 가산하는 함수
// Payload: { itemId }
export const obtainItem = (uuid, payload) => {
  // item에 대한 검증 <- 게임에셋에 존재하는가?
  const itemAsset = findAssetDataById(ASSET_TYPE.ITEM, payload.itemId);
  if (!itemAsset) return { status: 'fail', message: 'Obtained item does not exist!' };

  // 해금된 아이템이 맞는지 검증
  const unlockedItems = getItems(uuid).unlockedItems;
  const unlockedItem = unlockedItems.find((item) => {
    item.itemId === payload.itemId;
    console.log(`serverItemId : ${item.itemId}, clientItemId: ${payload.itemId}`);
  });

  if (!unlockedItem) {
    return { status: 'fail', message: 'Obtained item is not yet unlocked!' };
  }

  // 아이템 획득 카운트 가산
  unlockedItem.count++;
};
