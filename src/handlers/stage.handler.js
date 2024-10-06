import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../models/stage.model.js';
import { getNextAsset } from '../init/assets.js';
import { verifyScore } from '../utils/score.js';
import { ASSET_TYPE } from '../constants.js';

// 유저는 스테이지를 하나씩 올라갈 수 있다. (1 -> 2, 2 -> 3)
// 유저는 일정 점수가 되면 다음 스테이지로 이동한다.
// Payload: { currentStageId, targetStageId, score }
export const moveStageHandler = (uuid, payload) => {
  // 유저의 현재 스테이지정보
  let currentStages = getStage(uuid);
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stage found for user' };
  }

  // 오름차순 -> 가장 큰 스테이지 ID를 확인 <- 유저의 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  // 클라이언트 vs 서버 비교
  if (currentStage.id != payload.currentStage) {
    return {
      status: 'fail',
      message: `Current stage mismatch: server ${currentStage.id} vs client ${payload.currentStage}}`,
    };
  }

  // 스테이지 클리어에 필요한 점수 확인
  const nextStage = getNextAsset(ASSET_TYPE.STAGE, currentStage.id);
  const { score: requiredScore } = nextStage;

  // 필요 점수와 플레이어 점수가 오차범위 이내로 일치하는지 검증
  const scoreMatch = verifyScore(uuid, payload.score, requiredScore);
  if (!scoreMatch) {
    return {
      status: 'fail',
      message: `Invalid score to advance to next stage: ${payload.score} / ${requiredScore}`,
    };
  }

  // targetStage에 대한 검증 <- 게임에셋에 존재하는가?
  const { stages } = getGameAssets();
  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    return { status: 'fail', message: 'Target stage not found' };
  }

  setStage(uuid, payload.targetStage, Date.now());

  return { status: 'success', message: `Successfully advanced to stage ${payload.targetStage}` };
};
