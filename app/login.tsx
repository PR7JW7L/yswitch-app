import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { PasswordInput } from "@/components/PasswordInput";
import { authService } from "@/services/auth";

const LoginPage = ({ onSwitchToSignup }: { onSwitchToSignup: () => void }) => {
  const [email, setEmail] = useState("switch@yarsa.tech");
  const [password, setPassword] = useState("Password");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    const { success, message } = await authService.login({ email, password });
    if (success) {
      router.replace("/");
    } else setError(message ?? "Failed to login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Welcome back!</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          autoComplete="email"
          keyboardType="email-address"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <PasswordInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{`Don't have an account? `}</Text>
        <TouchableOpacity onPress={onSwitchToSignup}>
          <Text style={styles.linkText}>Sign up</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const SignupPage = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!fullname.trim() || !email.trim() || !password.trim()) {
      setError("Please enter all fields");
      return;
    }
    setError("");
    const { message, success } = await authService.register({
      fullname,
      email,
      password,
    });

    if (success) {
      onSwitchToLogin();
    } else setError(message ?? "Failed to register");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullname}
          onChangeText={setFullname}
          placeholder="Enter username"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          autoComplete="email"
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <PasswordInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={styles.linkText}>Login</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const App = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <LoginPage onSwitchToSignup={() => setIsLogin(false)} />
      ) : (
        <SignupPage onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#007bff",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  linkText: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "600",
  },
  errorText: {
    textAlign: "center",
    paddingVertical: 12,
    color: "red",
    backgroundColor: "#ffe8e8",
    marginTop: 12,
  },
});

export default App;
