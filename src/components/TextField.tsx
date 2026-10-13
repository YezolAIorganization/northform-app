import { Feather } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from "react-native";
import { colors, fonts, radius, sizes, spacing, type } from "../theme";

type Props = TextInputProps & {
  label: string;
  error?: string;
  secure?: boolean;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, secure = false, style, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          focused && styles.focused,
          !!error && styles.errored,
        ]}
      >
        <TextInput
          ref={ref}
          {...rest}
          secureTextEntry={secure && hidden}
          placeholderTextColor={colors.muted}
          selectionColor={colors.accent}
          accessibilityLabel={label}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, style]}
        />
        {secure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            style={styles.toggle}
          >
            <Feather
              name={hidden ? "eye" : "eye-off"}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: { ...type.label, color: colors.muted },
  field: {
    flexDirection: "row",
    alignItems: "center",
    height: sizes.control,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  focused: { borderColor: colors.muted },
  errored: { borderColor: colors.danger },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    paddingHorizontal: spacing.lg,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.foreground,
  },
  toggle: {
    width: sizes.control,
    height: sizes.control,
    alignItems: "center",
    justifyContent: "center",
  },
  error: { ...type.caption, color: colors.danger },
});
