import { MAX_SECONDS_GAP } from '../constants.js';
import { getStage } from '../models/stage.model.js';
import { getItems } from '../models/item.model.js';

// 입력된 시점까지의 점수를 계산하는 함수
export const calculateScore = (uuid, survivedTime) => {
  let stages = getStage(uuid);
  let items = getItems(uuid).unlockItems;

  let totalScore = 0;

  // 시간 경과에 의한 점수
  stages.forEach((stage, index) => {
    let stageEndTime;
    if (index === stages.length - 1) {
      stageEndTime = survivedTime;
    } else {
      stageEndTime = stages[index + 1].timestamp;
    }
    const stageDuration = (stageEndTime - stage.timestamp) / 1000;
    totalScore += stageDuration * stage.scorePerSecond;
  });

  // 아이템 획득에 의한 점수
  items.forEach((item) => {
    const scorePerSecond = stages[stages.length - 1].scorePerSecond;
    totalScore += item.score * item.count * scorePerSecond;
  });

  return totalScore;
};

// 클라이언트와 서버 점수가 오차범위 내외로 일치하는지 검증하는 함수
export const verifyScore = (uuid, clientScore, serverScore) => {
  const stages = getStage(uuid);
  stages.sort((a, b) => a.id - b.id);
  const maxScorePerSecond = stages[stages.length - 1].scorePerSecond; // 최종 스테이지 점수배율
  return Math.abs(clientScore - serverScore) <= MAX_SECONDS_GAP * maxScorePerSecond;
};
