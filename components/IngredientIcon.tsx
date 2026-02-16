import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface IngredientIconProps {
    name: string;
    size?: number;
    color?: string;
}

/**
 * 재료 이름에 따라 적절한 아이콘을 반환하는 컴포넌트
 */
export default function IngredientIcon({
    name,
    size = 20,
    color = "#111",
}: IngredientIconProps) {
    const iconName = getIconByIngredientName(name);

    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
}

/**
 * 재료 이름에 따라 아이콘 이름을 반환
 */
function getIconByIngredientName(name: string): MaterialIconName {
    if (!name) return "silverware-fork-knife";

    const lowerName = name.toLowerCase();

    // 고기류 - 스테이크 아이콘으로 통일
    if (
        lowerName.includes("고기") ||
        lowerName.includes("소고기") ||
        lowerName.includes("돼지고기") ||
        lowerName.includes("닭고기") ||
        lowerName.includes("삼겹살") ||
        lowerName.includes("목살") ||
        lowerName.includes("등심") ||
        lowerName.includes("안심") ||
        lowerName.includes("갈비") ||
        lowerName.includes("베이컨") ||
        lowerName.includes("햄") ||
        lowerName.includes("소시지")
    ) {
        return "food-steak";
    }

    // 음료 - 컵 아이콘으로 통일
    if (
        lowerName.includes("우유") ||
        lowerName.includes("주스") ||
        lowerName.includes("음료") ||
        lowerName.includes("물") ||
        lowerName.includes("커피") ||
        lowerName.includes("차") ||
        lowerName.includes("콜라") ||
        lowerName.includes("사이다") ||
        lowerName.includes("맥주") ||
        lowerName.includes("소주") ||
        lowerName.includes("와인")
    ) {
        return "cup-water";
    }

    // 채소류 - 다양한 아이콘
    if (lowerName.includes("양파")) return "food-variant";
    if (lowerName.includes("마늘")) return "food-variant";
    if (lowerName.includes("파") || lowerName.includes("대파")) return "leek";
    if (lowerName.includes("상추") || lowerName.includes("깻잎")) return "leaf";
    if (lowerName.includes("배추") || lowerName.includes("양배추")) return "food-variant";
    if (lowerName.includes("시금치")) return "leaf";
    if (lowerName.includes("브로콜리")) return "food-variant";
    if (lowerName.includes("당근")) return "carrot";
    if (lowerName.includes("무")) return "food-variant";
    if (lowerName.includes("감자")) return "food-variant";
    if (lowerName.includes("고구마")) return "food-variant";
    if (lowerName.includes("호박")) return "pumpkin";
    if (lowerName.includes("가지")) return "food-variant";
    if (lowerName.includes("오이")) return "food-variant";
    if (lowerName.includes("토마토")) return "food-variant";
    if (lowerName.includes("피망") || lowerName.includes("파프리카")) return "food-variant";
    if (lowerName.includes("고추")) return "chili-mild";
    if (lowerName.includes("버섯")) return "mushroom";
    if (lowerName.includes("옥수수")) return "corn";
    if (lowerName.includes("콩")) return "soy-sauce";

    // 계란
    if (lowerName.includes("계란") || lowerName.includes("달걀")) {
        return "egg";
    }

    // 과일류
    if (lowerName.includes("사과")) return "apple";
    if (lowerName.includes("배") || lowerName.includes("복숭아")) return "fruit-pear";
    if (lowerName.includes("포도")) return "fruit-grapes";
    if (lowerName.includes("딸기")) return "fruit-cherries";
    if (lowerName.includes("바나나")) return "food-variant";
    if (lowerName.includes("오렌지") || lowerName.includes("귤")) return "fruit-citrus";
    if (lowerName.includes("수박") || lowerName.includes("참외")) return "fruit-watermelon";
    if (lowerName.includes("파인애플")) return "fruit-pineapple";
    if (
        lowerName.includes("자두") ||
        lowerName.includes("키위") ||
        lowerName.includes("망고")
    ) {
        return "food-apple";
    }

    // 해산물 - 생선 아이콘
    if (
        lowerName.includes("생선") ||
        lowerName.includes("고등어") ||
        lowerName.includes("삼치") ||
        lowerName.includes("갈치") ||
        lowerName.includes("조기") ||
        lowerName.includes("연어") ||
        lowerName.includes("참치") ||
        lowerName.includes("새우") ||
        lowerName.includes("오징어") ||
        lowerName.includes("문어") ||
        lowerName.includes("조개") ||
        lowerName.includes("굴") ||
        lowerName.includes("전복")
    ) {
        return "fish";
    }

    // 유제품
    if (lowerName.includes("치즈")) return "cheese";
    if (lowerName.includes("버터")) return "food-variant";
    if (
        lowerName.includes("요구르트") ||
        lowerName.includes("요거트") ||
        lowerName.includes("크림")
    ) {
        return "cup-water";
    }

    // 곡물/면류
    if (lowerName.includes("쌀") || lowerName.includes("밥")) return "rice";
    if (
        lowerName.includes("면") ||
        lowerName.includes("라면") ||
        lowerName.includes("국수") ||
        lowerName.includes("파스타") ||
        lowerName.includes("스파게티")
    ) {
        return "noodles";
    }
    if (lowerName.includes("빵")) return "bread-slice";

    // 기본값: 요리 아이콘
    return "silverware-fork-knife";
}
