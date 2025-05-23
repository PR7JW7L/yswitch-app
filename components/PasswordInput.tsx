import React, { forwardRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PasswordInput = forwardRef<TextInput, TextInputProps>((props, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        ref={ref}
        {...props}
        style={[styles.input, props.style]}
        secureTextEntry={!visible}
      />
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => setVisible((v) => !v)}>
        <Ionicons name={visible ? "eye-off" : "eye"} size={20} color="gray" />
      </TouchableOpacity>
    </View>
  );
});
PasswordInput.displayName = "PasswordInput";
export { PasswordInput };

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  input: {
    flex: 1,
    paddingRight: 40, // space for icon
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  iconContainer: {
    position: "absolute",
    right: 10,
    padding: 4,
  },
});
