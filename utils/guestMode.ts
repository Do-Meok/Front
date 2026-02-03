/**
 * "로그인 없이 시작" 직후 네비 가드가 즉시 인식하도록 하는 동기 플래그.
 * AsyncStorage 읽기 타이밍 이슈를 피하기 위함.
 */
let guestChosenSync = false;

export function setGuestChosen(): void {
  guestChosenSync = true;
}

export function consumeGuestChosen(): boolean {
  const value = guestChosenSync;
  guestChosenSync = false;
  return value;
}
