export const formatPhoneNumber = (value: string) => {
    if (!value) return "";

    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "");

    // 3자리 이하: 그대로 반환
    if (numbers.length <= 3) {
        return numbers;
    }

    // 7자리 이하: 3-4 (010-1234)
    if (numbers.length <= 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    }

    // 11자리 이하: 3-4-4 (010-1234-5678)
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};
