import { fmtYYYYMMDD, formatInputToYYYYMMDD } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type DateInputWithCalendarProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helperText?: string;
};

export default function DateInputWithCalendar({
  label,
  value,
  onChangeText,
  placeholder = "YYYY-MM-DD",
  helperText,
}: DateInputWithCalendarProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleTextChange = (raw: string) => {
    // 숫자·하이픈 이외 문자 제거, 최대 10자 (YYYY-MM-DD)
    const sanitized = raw.replace(/[^\d-]/g, "").slice(0, 10);
    // 하이픈이 없는 순수 숫자 입력 → 자동 포맷 (20020321 → 2002-03-21)
    // 하이픈이 있으면 그대로 전달 (중간 수정 시 자릿수 밀림 방지)
    if (/^\d+$/.test(sanitized)) {
      onChangeText(formatInputToYYYYMMDD(sanitized));
    } else {
      onChangeText(sanitized);
    }
  };

  const pickerValue = (() => {
    if (!value || value.length < 10) return new Date();
    const [y, m, d] = value.slice(0, 10).split("-").map(Number);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return new Date();
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  })();

  const handlePickerChange = (
    event: { type: string },
    selectedDate: Date | undefined
  ) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "set" && selectedDate) {
      onChangeText(fmtYYYYMMDD(selectedDate));
    }
  };

  return (
    <>
      {label != null ? (
        <Text style={styles.inputLabel}>{label}</Text>
      ) : null}
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          style={[styles.input, { flex: 1 }]}
          keyboardType="numbers-and-punctuation"
        />
        <Pressable
          style={styles.calIcon}
          onPress={() => setShowPicker(true)}
          accessibilityLabel="날짜 선택"
        >
          <Ionicons name="calendar-outline" size={18} color="#111" />
        </Pressable>
      </View>
      {showPicker && (
        <>
          <DateTimePicker
            value={pickerValue}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handlePickerChange}
          />
          {Platform.OS === "ios" && (
            <Pressable
              onPress={() => setShowPicker(false)}
              style={styles.iosDoneBtn}
            >
              <Text style={styles.iosDoneText}>완료</Text>
            </Pressable>
          )}
        </>
      )}
      {helperText != null ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    marginTop: 10,
    marginBottom: 6,
    color: "#666",
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  calIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
  },
  helper: {
    marginTop: 6,
    fontSize: 11,
    color: "#888",
  },
  iosDoneBtn: {
    marginTop: 8,
    backgroundColor: "#111",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  iosDoneText: {
    color: "#fff",
    fontWeight: "700",
  },
});
